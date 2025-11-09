"""
Script to reload both transactions and products tables from CSV files
This will replace all existing data with the full CSV files.
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

# File paths
TRANSACTIONS_CSV = script_dir / 'transactions.csv'
PRODUCTS_CSV = script_dir / 'products.csv'

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

def load_csv_to_table(cursor, csv_file, table_name):
    """Load CSV data into Snowflake table using COPY INTO"""
    if not csv_file.exists():
        print(f"✗ CSV file not found: {csv_file}")
        return False
    
    stage_name = f"{table_name}_stage"
    
    try:
        # Truncate existing data
        print(f"  Clearing existing {table_name} data...")
        cursor.execute(f"TRUNCATE TABLE IF EXISTS {table_name}")
        
        # Create stage
        cursor.execute(f"CREATE OR REPLACE STAGE {stage_name}")
        
        # Upload file to stage
        print(f"  Uploading {csv_file.name} to stage...")
        cursor.execute(f"PUT file://{csv_file} @{stage_name} AUTO_COMPRESS=FALSE")
        
        # Copy from stage to table
        print(f"  Loading data into {table_name} table...")
        copy_sql = f"""
        COPY INTO {table_name}
        FROM @{stage_name}/{csv_file.name}
        FILE_FORMAT = (TYPE = CSV, SKIP_HEADER = 1, FIELD_OPTIONALLY_ENCLOSED_BY = '"')
        """
        cursor.execute(copy_sql)
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        row_count = cursor.fetchone()[0]
        print(f"✓ Loaded {row_count} rows into {table_name}")
        
        # Clean up stage
        cursor.execute(f"DROP STAGE IF EXISTS {stage_name}")
        
        return True
    except Exception as e:
        print(f"✗ Error loading {table_name}: {e}")
        import traceback
        traceback.print_exc()
        return False

def show_summary(cursor):
    """Show summary of loaded data"""
    print("\n" + "=" * 60)
    print("Data Summary")
    print("=" * 60)
    
    # Transactions summary
    cursor.execute("""
        SELECT 
            merchant_name, 
            COUNT(*) as count, 
            SUM(price_total) as total_spend
        FROM transactions
        GROUP BY merchant_name
        ORDER BY merchant_name
    """)
    transactions_summary = cursor.fetchall()
    
    print("\nTransactions by Merchant:")
    total_transactions = 0
    total_spend = 0
    for merchant, count, spend in transactions_summary:
        total_transactions += count
        total_spend += float(spend)
        print(f"  {merchant}: {count} transactions, ${float(spend):,.2f}")
    print(f"\n  Total: {total_transactions} transactions, ${total_spend:,.2f}")
    
    # Products summary
    cursor.execute("""
        SELECT 
            merchant_name, 
            COUNT(*) as count
        FROM products
        GROUP BY merchant_name
        ORDER BY merchant_name
    """)
    products_summary = cursor.fetchall()
    
    print("\nProducts by Merchant:")
    total_products = 0
    for merchant, count in products_summary:
        total_products += count
        print(f"  {merchant}: {count} products")
    print(f"\n  Total: {total_products} products")

def main():
    """Main function"""
    print("=" * 60)
    print("Reload All Tables from CSV")
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
        # Load transactions first (products reference transactions)
        print("\n" + "=" * 60)
        print("Loading Transactions")
        print("=" * 60)
        transactions_success = load_csv_to_table(cursor, TRANSACTIONS_CSV, "transactions")
        
        # Load products
        print("\n" + "=" * 60)
        print("Loading Products")
        print("=" * 60)
        products_success = load_csv_to_table(cursor, PRODUCTS_CSV, "products")
        
        if transactions_success and products_success:
            # Show summary
            show_summary(cursor)
            
            conn.commit()
            print("\n" + "=" * 60)
            print("✓ All tables reloaded successfully!")
            print("=" * 60)
        else:
            conn.rollback()
            print("\n✗ Reload failed!")
            if not transactions_success:
                print("  - Transactions table failed to load")
            if not products_success:
                print("  - Products table failed to load")
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
        print("\n✓ Connection closed")

if __name__ == '__main__':
    main()

