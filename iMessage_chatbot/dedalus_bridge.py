"""
Dedalus Bridge Service
----------------------
Run this FastAPI service to expose Dedalus Labs capabilities over HTTP so that
the Node.js chatbot can call them. Requires Python 3.9+.
"""

import json
import os
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

try:
    from dedalus_labs import AsyncDedalus, DedalusRunner
except ImportError as exc:
    raise ImportError(
        "dedalus_labs package is required. Install with `pip install dedalus-labs`."
    ) from exc

load_dotenv()

app = FastAPI(title="Dedalus Bridge Service", version="0.1.0")


DEFAULT_MODEL = os.getenv("DEDALUS_BRIDGE_MODEL", "openai/gpt-5-mini")
SQL_MODEL = os.getenv("DEDALUS_SQL_MODEL", "openai/gpt-5")
SHOPPING_MODEL = os.getenv("DEDALUS_SHOPPING_MODEL", "openai/gpt-5")


class FormatPayload(BaseModel):
    user_query: str
    sql_query: Optional[str] = None
    results: List[Dict[str, Any]] = []
    model: Optional[str] = None


class SQLPayload(BaseModel):
    question: str
    schema: str
    model: Optional[str] = None


class ShoppingPayload(BaseModel):
    category: Optional[str] = None
    purchase_history: List[Dict[str, Any]] = []
    top_merchants: List[Dict[str, Any]] = []
    favorite_merchants: List[str] = []
    average_purchase_amount: Optional[float] = None
    total_purchases: Optional[int] = None
    model: Optional[str] = None


class InterpretPayload(BaseModel):
    message: str
    system_prompt: Optional[str] = None
    model: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    client = AsyncDedalus()
    runner = DedalusRunner(client)
    app.state.dedalus_client = client
    app.state.dedalus_runner = runner


@app.on_event("shutdown")
async def shutdown_event():
    client: AsyncDedalus = app.state.dedalus_client
    await client.aclose()


async def run_dedalus(
    input_text: str,
    model: str,
    *,
    system_prompt: Optional[str] = None,
    mcp_servers: Optional[List[str]] = None,
) -> str:
    runner: DedalusRunner = app.state.dedalus_runner
    kwargs: Dict[str, Any] = {}
    if system_prompt:
        kwargs["system_prompt"] = system_prompt
    if mcp_servers:
        kwargs["mcp_servers"] = mcp_servers
    result = await runner.run(input=input_text, model=model, **kwargs)
    return result.final_output


def extract_sql(response_text: str) -> Optional[str]:
    """
    Extract SQL from the response text. Handles markdown code fences or plain SQL.
    """
    if not response_text:
        return None

    response_text = response_text.strip()
    if "```" in response_text:
        parts = response_text.split("```")
        if len(parts) >= 2:
            sql_candidate = parts[1]
            if sql_candidate.lower().startswith("sql"):
                sql_candidate = sql_candidate[3:]
            return sql_candidate.strip()

    if response_text.upper().startswith("SELECT"):
        return response_text.strip().rstrip(";")

    return None


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/format-results")
async def format_results(payload: FormatPayload):
    summaries = json.dumps(payload.results[:20], indent=2, default=str)
    prompt = (
        f'You are a helpful financial assistant. A user asked: "{payload.user_query}"\n'
        f"I executed a SQL query ({payload.sql_query or 'unknown'}) and got "
        f"{len(payload.results)} row(s). Here is a sample:\n\n{summaries}\n\n"
        "Explain the results in a friendly, conversational tone, highlighting key insights.\n"
        "Format numbers nicely with commas and currency symbols where appropriate.\n"
        "Keep the response to 2-4 sentences."
    )

    try:
        final_output = await run_dedalus(
            prompt,
            model=payload.model or DEFAULT_MODEL,
            system_prompt=(
                "You are a helpful financial assistant who can summarize database query results "
                "into clear, actionable explanations."
            ),
        )
        return {"answer": final_output}
    except Exception as error:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/generate-sql")
async def generate_sql(payload: SQLPayload):
    prompt = (
        f"You are a Snowflake SQL expert. Given the schema:\n{payload.schema}\n\n"
        f"Generate a SQL query for the question: \"{payload.question}\"\n\n"
        "Return ONLY the SQL query."
    )

    try:
        final_output = await run_dedalus(
            prompt,
            model=payload.model or SQL_MODEL,
            system_prompt="You are a SQL expert. Respond only with valid Snowflake SQL.",
        )
        sql = extract_sql(final_output)
        if not sql:
            raise ValueError("Could not extract SQL from Dedalus response.")
        return {"sql": sql}
    except Exception as error:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/shopping-recommendations")
async def shopping_recommendations(payload: ShoppingPayload):
    history_preview = json.dumps(payload.purchase_history[:20], indent=2, default=str)
    top_merchants = ", ".join(
        f"{item.get('name')} (${item.get('total', 0):,.2f})"
        for item in payload.top_merchants[:5]
    )

    prompt = (
        f"The customer is interested in: {payload.category or 'general shopping'}.\n"
        f"Purchase history sample:\n{history_preview}\n\n"
        f"Favorite merchants: {', '.join(payload.favorite_merchants)}\n"
        f"Top merchants by spending: {top_merchants}\n"
        f"Average purchase amount: ${payload.average_purchase_amount or 0:,.2f}\n"
        f"Total recent purchases: {payload.total_purchases or len(payload.purchase_history)}\n\n"
        "Recommend three realistic products (fake is ok) that match the customer's preferences. "
        "For each recommendation include: product name, price estimate, merchant, short description, "
        "and why it fits their history."
    )

    try:
        final_output = await run_dedalus(
            prompt,
            model=payload.model or SHOPPING_MODEL,
            system_prompt=(
                "You are a shopping assistant who suggests personalized products based on purchase history. "
                "Be friendly, concise, and specific."
            ),
        )
        return {"recommendations": final_output}
    except Exception as error:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/interpret-query")
async def interpret_query(payload: InterpretPayload):
    system_prompt = payload.system_prompt or (
        "You are a router for a financial wellness assistant chatbot. Analyze the user's question "
        "and return a compact JSON object with intent, time range, limit, and params."
    )

    try:
        final_output = await run_dedalus(
            payload.message,
            model=payload.model or DEFAULT_MODEL,
            system_prompt=system_prompt,
        )
        return {"interpretation": final_output}
    except Exception as error:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=str(error)) from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "dedalus_bridge:app",
        host=os.getenv("DEDALUS_BRIDGE_HOST", "0.0.0.0"),
        port=int(os.getenv("DEDALUS_BRIDGE_PORT", "8000")),
        reload=False,
    )

