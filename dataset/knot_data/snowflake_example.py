"""
Simple example of connecting to Snowflake and running queries.

This is a minimal example to show basic Snowflake connectivity.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import snowflake.connector

# Load environment variables from .env file
script_dir = Path(__file__).parent
env_paths = [
    script_dir / '.env',
    script_dir.parent / '.env',
    script_dir.parent.parent / '.env',
    Path.cwd() / '.env'
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        break

# Connection parameters
conn = snowflake.connector.connect(
    user=os.getenv('SNOWFLAKE_USER', 'your_username'),
    password=os.getenv('SNOWFLAKE_PASSWORD', 'your_password'),
    account=os.getenv('SNOWFLAKE_ACCOUNT', 'your_account'),
    warehouse=os.getenv('SNOWFLAKE_WAREHOUSE', 'your_warehouse'),
    database=os.getenv('SNOWFLAKE_DATABASE', 'your_database'),
    schema=os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC')
)

try:
    cursor = conn.cursor()
    
    # Example: Run a simple query
    cursor.execute("SELECT CURRENT_VERSION()")
    version = cursor.fetchone()
    print(f"Snowflake version: {version[0]}")
    
    # Example: Query your data
    cursor.execute("SELECT COUNT(*) FROM transactions")
    count = cursor.fetchone()
    print(f"Total transactions: {count[0]}")
    
    # Example: Run a more complex query
    cursor.execute("""
        SELECT 
            merchant_name,
            COUNT(*) as transaction_count,
            SUM(price_total) as total_spend
        FROM transactions
        GROUP BY merchant_name
        ORDER BY total_spend DESC
    """)
    
    print("\nMerchant Summary:")
    print("-" * 50)
    for row in cursor.fetchall():
        print(f"{row[0]:<15} {row[1]:>5} transactions  ${row[2]:>12.2f}")
    
finally:
    cursor.close()
    conn.close()

