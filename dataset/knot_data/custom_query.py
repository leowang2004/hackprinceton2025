"""
Custom query script - Modify this to run your own queries.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import snowflake.connector

# Load .env file
script_dir = Path(__file__).parent
for env_path in [script_dir / '.env', script_dir.parent / '.env', Path.cwd() / '.env']:
    if env_path.exists():
        load_dotenv(env_path)
        break

# Connect to Snowflake
conn = snowflake.connector.connect(
    user=os.getenv('SNOWFLAKE_USER'),
    password=os.getenv('SNOWFLAKE_PASSWORD'),
    account=os.getenv('SNOWFLAKE_ACCOUNT'),
    warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
    database=os.getenv('SNOWFLAKE_DATABASE'),
    schema=os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC')
)

cursor = conn.cursor()

try:
    # ===== MODIFY THIS QUERY =====
    query = """
    SELECT 
        merchant_name,
        COUNT(*) as transaction_count,
        SUM(price_total) as total_spend
    FROM transactions
    GROUP BY merchant_name
    ORDER BY total_spend DESC
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    
    # Print results
    print("Results:")
    print(" | ".join(columns))
    print("-" * 60)
    for row in results:
        print(" | ".join(str(val) for val in row))
    
finally:
    cursor.close()
    conn.close()

