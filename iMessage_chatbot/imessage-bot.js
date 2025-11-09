// imessage-bot.js
// Bridge between iMessage Kit and your Knot+LLM chatbot backend.

import { IMessageSDK } from '@photon-ai/imessage-kit'

const CHAT_BACKEND_URL =
  process.env.CHAT_BACKEND_URL || 'http://localhost:3000/chat'
const MAX_IMESSAGE_CHUNK =
  Number.parseInt(process.env.IMESSAGE_CHUNK_SIZE || '', 10) || 350
const IMESSAGE_PAUSE_MS =
  Number.parseInt(process.env.IMESSAGE_PAUSE_MS || '', 10) || 1200

// Init SDK with watcher enabled
const sdk = new IMessageSDK({
  debug: true,
  watcher: {
    pollInterval: 3000,       // check every 3s
    unreadOnly: true,         // only react to new/unread
    excludeOwnMessages: true, // ignore messages sent by this device
  },
})

async function callChatBackend(from, text) {
  try {
    const res = await fetch(CHAT_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        userId: from,
        useCortex: true, // Enable Cortex for all queries
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.error('Backend error status:', res.status)
      return {
        answer:
          data.answer ||
          data.error ||
          "Sorry, I'm having trouble reaching your data right now.",
        answerChunks: Array.isArray(data.answerChunks)
          ? data.answerChunks
          : [],
        chunkDelayMs: data.chunkDelayMs,
      }
    }

    return {
      answer:
        data.answer || data.error || "Sorry, I couldn't understand that.",
      answerChunks: Array.isArray(data.answerChunks) ? data.answerChunks : [],
      chunkDelayMs: data.chunkDelayMs,
    }
  } catch (err) {
    console.error('Error calling chat backend:', err)
    return {
      answer:
        "Sorry, I'm having trouble connecting to the server right now.",
      answerChunks: [],
      chunkDelayMs: undefined,
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function splitMessageIntoChunks(message, maxLength) {
  const chunks = []
  let remaining = message.trim()
  const normalized = remaining.replace(/\r/g, '')

  const sections = []
  const itemMatchIndex = normalized.search(/\n\d+\.\s/)

  if (itemMatchIndex !== -1) {
    const preamble = normalized.slice(0, itemMatchIndex).trim()
    if (preamble.length) {
      sections.push(preamble)
    }

    const itemRegex = /(\d+\.\s[\s\S]*?)(?=(\n\d+\.\s)|$)/g
    let match
    while (
      (match = itemRegex.exec(normalized.slice(itemMatchIndex))) !== null
    ) {
      const itemText = match[1].trim().replace(/^[\.\s]+/, '')
      if (itemText.length) {
        sections.push(itemText)
      }
    }
  } else {
    const paragraphSections = normalized
      .split(/(?:\n\s*\n)+/)
      .map((section) => section.trim())
      .filter((section) => section.length > 0)

    if (paragraphSections.length > 1) {
      paragraphSections.forEach((section) => sections.push(section))
    }
  }

  if (sections.length > 1 && sections.every((section) => section.length <= maxLength)) {
    return sections
  }

  remaining = normalized

  while (remaining.length > maxLength) {
    let splitIndex =
      remaining.lastIndexOf('\n', maxLength) !== -1
        ? remaining.lastIndexOf('\n', maxLength)
        : remaining.lastIndexOf('. ', maxLength)

    if (splitIndex === -1 || splitIndex < maxLength * 0.4) {
      splitIndex = maxLength
    }

    chunks.push(remaining.slice(0, splitIndex).trim().replace(/^[\.\s]+/, ''))
    remaining = remaining.slice(splitIndex).trim()
  }

  if (remaining.length) {
    chunks.push(remaining)
  }

  return chunks
}

async function handleIncoming(message) {
  try {
    // Basic filters: only text, only direct chats
    if (!message.text || !message.text.trim()) return
    if (message.isGroupChat) return

    const from = message.sender
    const userText = message.text.trim()

    console.log(`Incoming from ${from}: ${userText}`)

    const replyPayload = await callChatBackend(from, userText)
    const chunks =
      replyPayload.answerChunks && replyPayload.answerChunks.length
        ? replyPayload.answerChunks
        : splitMessageIntoChunks(replyPayload.answer, MAX_IMESSAGE_CHUNK)
    const delay =
      replyPayload.chunkDelayMs && Number.isFinite(replyPayload.chunkDelayMs)
        ? replyPayload.chunkDelayMs
        : IMESSAGE_PAUSE_MS

    for (let i = 0; i < chunks.length; i += 1) {
      await sdk.message(message).replyText(chunks[i]).execute()
      if (i < chunks.length - 1) {
        await sleep(delay)
      }
    }

    console.log(`Replied to ${from}`)
  } catch (err) {
    console.error('Failed to handle incoming message:', err)
  }
}

async function main() {
  await sdk.startWatching({
    onNewMessage: handleIncoming,
    onError: (error) => {
      console.error('Watcher error:', error)
    },
  })

  console.log('✅ iMessage → Knot chatbot bridge is running')
}

main().catch((err) => {
  console.error('Fatal error starting iMessage bot:', err)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down iMessage bot...')
  try {
    await sdk.stopWatching()
    await sdk.close()
  } finally {
    process.exit(0)
  }
})