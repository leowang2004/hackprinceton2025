"""
Script to reload the transactions table from transactions.csv
This will replace all existing data with the full CSV file.
"""

import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    import snowflake.connector
except ImportError as e:
    print(f"Error: Missing required package. Install with: pip install python-dotenv snowflake-connector-python")
    sys.exit(1)

# Load environment variables from .env file
script_dir = Path(__file__).parent
env_paths = [
    script_dir / '.env',
    script_dir.parent / '.env',
    script_dir.parent.parent / '.env',
    Path.cwd() / '.env'
]

env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✓ Loaded .env from {env_path}")
        env_loaded = True
        break

if not env_loaded:
    print("⚠ No .env file found. Trying to load from environment variables...")

# Snowflake connection parameters
SNOWFLAKE_ACCOUNT = os.getenv('SNOWFLAKE_ACCOUNT', '')
SNOWFLAKE_USER = os.getenv('SNOWFLAKE_USER', '')
SNOWFLAKE_PASSWORD = os.getenv('SNOWFLAKE_PASSWORD', '')
SNOWFLAKE_WAREHOUSE = os.getenv('SNOWFLAKE_WAREHOUSE', '')
SNOWFLAKE_DATABASE = os.getenv('SNOWFLAKE_DATABASE', '')
SNOWFLAKE_SCHEMA = os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC')

# File path
TRANSACTIONS_CSV = script_dir / 'transactions.csv'

def connect_to_snowflake():
    """Establish connection to Snowflake"""
    try:
        conn = snowflake.connector.connect(
            user=SNOWFLAKE_USER,
            password=SNOWFLAKE_PASSWORD,
            account=SNOWFLAKE_ACCOUNT,
            warehouse=SNOWFLAKE_WAREHOUSE,
            database=SNOWFLAKE_DATABASE,
            schema=SNOWFLAKE_SCHEMA
        )
        print("✓ Connected to Snowflake successfully")
        return conn
    except Exception as e:
        print(f"✗ Failed to connect to Snowflake: {e}")
        sys.exit(1)

def load_transactions_csv(cursor, csv_file):
    """Load transactions CSV into Snowflake table using COPY INTO"""
    if not csv_file.exists():
        print(f"✗ CSV file not found: {csv_file}")
        return False
    
    stage_name = "transactions_stage"
    
    try:
        # Truncate existing data
        print("  Clearing existing transactions data...")
        cursor.execute("TRUNCATE TABLE IF EXISTS transactions")
        
        # Create stage
        cursor.execute(f"CREATE OR REPLACE STAGE {stage_name}")
        
        # Upload file to stage
        print(f"  Uploading {csv_file.name} to stage...")
        cursor.execute(f"PUT file://{csv_file} @{stage_name} AUTO_COMPRESS=FALSE")
        
        # Copy from stage to table
        print(f"  Loading data into transactions table...")
        copy_sql = f"""
        COPY INTO transactions
        FROM @{stage_name}/{csv_file.name}
        FILE_FORMAT = (TYPE = CSV, SKIP_HEADER = 1, FIELD_OPTIONALLY_ENCLOSED_BY = '"')
        """
        cursor.execute(copy_sql)
        
        # Get row count and merchant breakdown
        cursor.execute("SELECT COUNT(*) FROM transactions")
        row_count = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT merchant_name, COUNT(*) as count, SUM(price_total) as total_spend
            FROM transactions
            GROUP BY merchant_name
            ORDER BY merchant_name
        """)
        merchant_counts = cursor.fetchall()
        
        print(f"✓ Loaded {row_count} rows into transactions table")
        print("\n  Merchant breakdown:")
        for merchant, count, spend in merchant_counts:
            print(f"    {merchant}: {count} transactions, ${float(spend):,.2f} total")
        
        # Clean up stage
        cursor.execute(f"DROP STAGE IF EXISTS {stage_name}")
        
        return True
    except Exception as e:
        print(f"✗ Error loading transactions: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("Reload Transactions Table from CSV")
    print("=" * 60)
    
    # Validate connection parameters
    if not all([SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, 
                SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE]):
        print("\n⚠ Missing required Snowflake connection parameters!")
        print("\nSet environment variables or create a .env file with:")
        print("  SNOWFLAKE_ACCOUNT=your_account")
        print("  SNOWFLAKE_USER=your_username")
        print("  SNOWFLAKE_PASSWORD=your_password")
        print("  SNOWFLAKE_WAREHOUSE=your_warehouse")
        print("  SNOWFLAKE_DATABASE=your_database")
        print("  SNOWFLAKE_SCHEMA=your_schema  # optional, defaults to PUBLIC")
        sys.exit(1)
    
    # Connect to Snowflake
    conn = connect_to_snowflake()
    cursor = conn.cursor()
    
    try:
        # Load transactions
        print("\nLoading transactions from CSV...")
        success = load_transactions_csv(cursor, TRANSACTIONS_CSV)
        
        if success:
            conn.commit()
            print("\n✓ Transactions reload completed successfully!")
        else:
            conn.rollback()
            print("\n✗ Transactions reload failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"\n✗ Error during reload: {e}")
        conn.rollback()
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()
        print("✓ Connection closed")

if __name__ == '__main__':
    main()

