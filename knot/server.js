// server.js
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// env vars from your Knot dev dashboard
const KNOT_CLIENT_ID = process.env.KNOT_CLIENT_ID;
const KNOT_SECRET = process.env.KNOT_SECRET; // or API key, depending on their auth docs
const KNOT_BASE_URL = "https://api.knotapi.com"; // use dev base if specified by docs

// Basic helper for auth header (adjust if your account uses API keys differently)
function knotClient() {
  return axios.create({
    baseURL: KNOT_BASE_URL,
    auth: {
      username: KNOT_CLIENT_ID,
      password: KNOT_SECRET,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// 1) Endpoint your frontend calls to get a fresh TransactionLink sessionId
app.post("/api/knot/session", async (req, res) => {
  try {
    const externalUserId = `test-user-${Date.now()}`;

    const { data } = await knotClient().post("/session/create", {
      type: "transaction_link",
      external_user_id: externalUserId,
    });

    // data should contain session_id
    res.json({
      sessionId: data.session_id,
      externalUserId,
    });
  } catch (err) {
    console.error("Error creating session", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// 2) Webhook receiver for NEW_TRANSACTIONS_AVAILABLE, UPDATED_TRANSACTIONS_AVAILABLE
app.post("/api/knot/webhook", async (req, res) => {
  const event = req.body;

  // Always 200 quickly so Knot doesn't retry excessively
  res.sendStatus(200);

  try {
    const {
      type,                    // e.g. "NEW_TRANSACTIONS_AVAILABLE"
      merchant_id,
      external_user_id,
    } = event;

    if (type === "NEW_TRANSACTIONS_AVAILABLE" || type === "UPDATED_TRANSACTIONS_AVAILABLE") {
      console.log("Got webhook:", type, "for", external_user_id, "merchant", merchant_id);

      // Pull transactions using Sync Transactions
      const client = knotClient();
      let cursor = null;
      let hasMore = true;

      while (hasMore) {
        const { data } = await client.post("/transactions/sync", {
          external_user_id,
          merchant_id,
          cursor,
          limit: 100,
        });

        // data.transactions = array of fake SKU-level transactions
        console.log("Fetched", data.transactions.length, "transactions");

        // TODO: store data.transactions into your DB / analytics pipeline here

        if (data.next_cursor) {
          cursor = data.next_cursor;
        } else {
          hasMore = false;
        }
      }
    }
  } catch (err) {
    console.error("Error handling webhook / syncing", err.response?.data || err.message);
  }
});

app.listen(3001, () => {
  console.log("Knot test backend running on http://localhost:3001");
});