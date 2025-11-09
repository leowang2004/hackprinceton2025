# Wings
## HackPrinceton Project 2025
## Athena Zhong, Niki Hu, Leo Wang, Lu

This repository contains two complementary experiences that turn raw purchase data into actionable financial coaching:

1. **iMessage Financial Coach** – a conversational assistant that pulls transactions from Snowflake, enriches them with Nessie + Knot data, and answers questions through Snowflake Cortex, OpenAI, and optional Dedalus Labs models. Responses are chunked and timed for a native iMessage feel via Photon’s iMessage Kit.
2. **WingsPay Web App** – a React/Vite + Express experience that demonstrates a BNPL checkout flow, credit scoring dashboard, and rich merchant storefronts powered by the same data sources.

Together they showcase a full-stack “coach + checkout” story: ingest real merchant data, store it in Snowflake, reason over it with LLMs, and surface guidance in both chat and web surfaces.

---

## Repository Layout

```
hackprinceton2025/
├── dataset/                 # Scripts + CSVs for populating Snowflake from Knot & Nessie
│   ├── knot_data/           # Knot TransactionLink pull + flatten to transactions/products CSVs
│   └── nessie_data/         # Nessie API pulls for bills, deposits, loans
├── iMessage_chatbot/        # Node chatbot + iMessage bridge + optional Dedalus FastAPI service
├── knot/                    # Earliest Node chatbot prototype (kept for reference)
├── newfrontend/             # React/Vite WingsPay web experience
├── server.js                # Legacy Express backend used by WingsPay demo screens
└── README.md                # You are here
```

Key datasets (`dataset/knot_data/*.csv`, `dataset/nessie_data/*.json`) can be used directly for Snowflake ingestion or local prototyping.

---

## Requirements

- **Node.js** ≥ 18 (required for Express 5, `fetch`, and top-level `await`)
- **npm** ≥ 9
- **Python** ≥ 3.10 (3.11+ recommended) for the Dedalus bridge and data ingestion scripts
- **Snowflake account** (optional, but required for live data queries)
- **macOS with Messages** (required if you want to send iMessage replies via AppleScript)

---

## Environment Variables

Create a `.env` in `iMessage_chatbot/` (and optionally in `dataset/knot_data/`) with the following variables as needed:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Required for SQL fallback, response formatting, and recommendation generation when Dedalus is disabled |
| `OPENAI_MODEL` | Override default OpenAI chat model (default `gpt-4o-mini`) |
| `NESSIE_API_KEY`, `NESSIE_ACCOUNT_ID` | Capital One Nessie sandbox credentials for supplemental financial data |
| `SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, `SNOWFLAKE_PASSWORD`, `SNOWFLAKE_DATABASE`, `SNOWFLAKE_SCHEMA`, `SNOWFLAKE_WAREHOUSE` | Enable direct Snowflake connectivity |
| `USE_SNOWFLAKE` | Set to `true` to force Snowflake usage (instead of `dummy_data.json`) |
| `USE_DEDALUS_BRIDGE` | Set to `true` to proxy LLM calls through the Python Dedalus bridge |
| `DEDALUS_BRIDGE_URL` | Base URL for the FastAPI bridge (default `http://localhost:8000`) |
| `DEDALUS_API_KEY` (inside bridge) | API key required by Dedalus Labs SDK (set in shell or `.env` alongside the bridge) |
| `CHAT_RESPONSE_CHUNK_SIZE`, `CHAT_RESPONSE_DELAY_MS` | Tune chunk length and delay for iMessage sending cadence |

Snowflake loaders in `dataset/knot_data/` also expect the Snowflake variables above. The scripts rely on `.env` files sitting next to them.

---

## Data Ingestion Workflow

1. **Install dependencies**
   ```bash
   cd /Users/Niki/gatech/hackprinceton2025/dataset/knot_data
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r ../nessie_data/requirements.txt  # if you maintain a requirements file
   pip install python-dotenv snowflake-connector-python
   ```

2. **Pull merchant transactions from Knot**
   ```bash
   python pull_knot.py
   ```
   This hits the Knot TransactionLink endpoint for Amazon, Costco, DoorDash, Instacart, Target, UberEats, and Walmart, flattening responses into `transactions.csv` and `products.csv`.

3. **Pull supplemental data from Nessie**
   ```bash
   cd ../nessie_data
   python pull_nessie.py
   ```
   Generates `bills.json`, `deposits.json`, and `loans.json`.

4. **Load into Snowflake**
   ```bash
   cd ../knot_data
   python upload_to_snowflake.py
   ```
   The script creates (or truncates) `TRANSACTIONS`, `PRODUCTS`, `NESSIE_BILL`, `NESSIE_DEPOSIT`, and `NESSIE_LOAN`, then uses `COPY INTO` to ingest the CSV/JSON data. Helper scripts `reload_transactions.py`, `reload_products.py`, and `reload_all.py` support quick refreshes.

Once loaded, Snowflake Cortex can reason over the combined dataset, and both the chatbot and web experiences can surface insights.

---

## iMessage Financial Coach

### What It Does

- Serves `/chat`, `/cortex`, and analytics endpoints from `iMessage_chatbot/chat.js`.
- Creates Snowflake connections on demand, runs SQL produced by Cortex/Dedalus/OpenAI, and reformats results into conversational English.
- Detects shopping/review intents, produces recommendations, and warns about redundant purchases.
- Chunks and delays outgoing messages so Photon iMessage Kit can send them sequentially via AppleScript.
- Optionally routes prompt interpretation, SQL generation, and summarization through Dedalus Labs (`dedalus_bridge.py`).

### Getting Started

```bash
# Terminal 1 – start the Node chatbot
cd /Users/Niki/gatech/hackprinceton2025/iMessage_chatbot
npm install
node chat.js

# Terminal 2 – (optional) start the Dedalus bridge
cd /Users/Niki/gatech/hackprinceton2025/iMessage_chatbot
python -m venv .venv && source .venv/bin/activate
pip install -r dedalus_bridge_requirements.txt  # contains fastapi, uvicorn, dedalus-labs, python-dotenv
python dedalus_bridge.py

# Terminal 3 – run the Photon iMessage agent
node imessage-bot.js
```

Put the target phone number and AppleScript permissions in `imessage-bot.js` as needed. The bot will forward inbound iMessages to `/chat`, then stream the resulting chunks back out with configurable pauses.

Testing without a phone is possible by hitting the REST endpoints directly:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What did I spend at Costco last month?","useCortex":true}'
```

If Snowflake is disabled (`USE_SNOWFLAKE` unset), the chatbot falls back to `dummy_data.json`.

---

## WingsPay Web App

The `newfrontend/` directory houses a Vite + React BNPL demo that consumes the legacy Express backend (`server.js`) and the dummy JSON datasets. It remains useful for storytelling about financing flows even if the chatbot is the primary surface.

### Setup

```bash
# Install dependencies
cd /Users/Niki/gatech/hackprinceton2025
npm install        # installs shared utilities

cd newfrontend
npm install

# Start backend (legacy demo services)
cd ..
node server.js     # serves API mocks on http://localhost:3000

# Start frontend
cd newfrontend
npm run dev        # launches http://localhost:5173
```

Available endpoints from `server.js` include `/api/get-credit-score` and `/api/get-merchants`, both built on top of the dummy JSON files at the repository root. The React app uses `PaymentContext` to orchestrate state across onboarding, merchant selection, cart, checkout, and confirmation screens. A production build is available via `npm run build`.

---

## Testing & Tooling Tips

- **Chatbot** – exercise `/chat` and `/cortex` with curl or Postman; observe SQL generation in the console to ensure Cortex and fallback OpenAI/Dedalus paths behave.
- **Snowflake** – use `dataset/knot_data/query_snowflake.py` for quick interactive queries.
- **iMessage** – run the Photon agent in verbose mode to confirm chunk timing; adjust `CHAT_RESPONSE_DELAY_MS` if messages feel too fast/slow.
- **Frontend** – rely on Vite’s hot reload (`npm run dev`) for UI tweaks; `test-backend.js` contains sample requests against `server.js`.

---

## Troubleshooting

- **Invalid Snowflake credentials** – the chatbot logs connection attempts; double-check account identifier format (e.g., `xyz12345.us-east-1`).
- **SQL syntax issues** – Cortex output is cleaned and validated, but edge cases happen. Enable Dedalus bridge or tweak prompt instructions inside `chat.js`.
- **iMessage AppleScript errors** – ensure “Automation” permissions are granted to Terminal/iTerm for Messages control; review Photon iMessage Kit docs for setup.
- **Dedalus bridge import error** – install the SDK via `pip install dedalus-labs` inside the same venv running `dedalus_bridge.py`.
- **Frontend data mismatch** – legacy web app still uses local JSON data; update `server.js` or wire it to Snowflake if you need parity with the chatbot.

---

## Next Steps & Ideas

- Swap dummy datasets for real-time Knot webhooks and persist them straight into Snowflake.
- Align the WingsPay frontend with the live Snowflake warehouse to showcase unified analytics.
- Productionize the AppleScript bridge by migrating to Business Chat APIs or Twilio for cross-platform messaging.
- Expand Dedalus usage for report generation, not just intent routing and summarization.

---

**Created for HackPrinceton 2025** — blending fintech data engineering with conversational AI to deliver personalized financial guidance across channels.
