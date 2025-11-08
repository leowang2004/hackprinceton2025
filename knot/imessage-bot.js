// imessage-bot.js
// Bridge between iMessage Kit and your Knot+LLM chatbot backend.

import { IMessageSDK } from '@photon-ai/imessage-kit'

const CHAT_BACKEND_URL =
  process.env.CHAT_BACKEND_URL || 'http://localhost:3000/chat'

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
  const res = await fetch(CHAT_BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      userId: from, // later: map this -> external_user_id
    }),
  })

  if (!res.ok) {
    console.error('Backend error status:', res.status)
    return "Sorry, I'm having trouble reaching your data right now."
  }

  const data = await res.json()
  return data.answer || "Sorry, I couldn't understand that."
}

async function handleIncoming(message) {
  try {
    // Basic filters: only text, only direct chats
    if (!message.text || !message.text.trim()) return
    if (message.isGroupChat) return

    const from = message.sender
    const userText = message.text.trim()

    console.log(`Incoming from ${from}: ${userText}`)

    const reply = await callChatBackend(from, userText)

    // Reply into same thread
    await sdk
      .message(message)
      .replyText(reply)
      .execute()

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