"""
Script to connect to Snowflake and upload CSV data to tables.

Requirements:
    pip install snowflake-connector-python python-dotenv

Configuration:
    Create a .env file in the project root with:
    - SNOWFLAKE_ACCOUNT
    - SNOWFLAKE_USER
    - SNOWFLAKE_PASSWORD
    - SNOWFLAKE_WAREHOUSE
    - SNOWFLAKE_DATABASE
    - SNOWFLAKE_SCHEMA (optional, defaults to PUBLIC)
"""

import os
import csv
import sys
from pathlib import Path

try:
    import snowflake.connector
except ImportError:
    print("Error: snowflake-connector-python is not installed.")
    print("Install it with: pip install snowflake-connector-python")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("Error: python-dotenv is not installed.")
    print("Install it with: pip install python-dotenv")
    sys.exit(1)

# Load environment variables from .env file
# Try to find .env in current directory, parent directory, or project root
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
# Loaded from .env file or environment variables
SNOWFLAKE_ACCOUNT = os.getenv('SNOWFLAKE_ACCOUNT', '')
SNOWFLAKE_USER = os.getenv('SNOWFLAKE_USER', '')
SNOWFLAKE_PASSWORD = os.getenv('SNOWFLAKE_PASSWORD', '')
SNOWFLAKE_WAREHOUSE = os.getenv('SNOWFLAKE_WAREHOUSE', '')
SNOWFLAKE_DATABASE = os.getenv('SNOWFLAKE_DATABASE', '')
SNOWFLAKE_SCHEMA = os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC')

# File paths
SCRIPT_DIR = Path(__file__).parent
TRANSACTIONS_CSV = SCRIPT_DIR / 'transactions.csv'
PRODUCTS_CSV = SCRIPT_DIR / 'products.csv'

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
        print("\nPlease check your connection parameters:")
        print(f"  Account: {SNOWFLAKE_ACCOUNT or '(not set)'}")
        print(f"  User: {SNOWFLAKE_USER or '(not set)'}")
        print(f"  Warehouse: {SNOWFLAKE_WAREHOUSE or '(not set)'}")
        print(f"  Database: {SNOWFLAKE_DATABASE or '(not set)'}")
        print(f"  Schema: {SNOWFLAKE_SCHEMA or '(not set)'}")
        sys.exit(1)

def create_tables(cursor):
    """Create tables in Snowflake"""
    print("\nCreating tables...")
    
    # Create transactions table
    transactions_ddl = """
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id VARCHAR(255) PRIMARY KEY,
        external_id VARCHAR(255),
        merchant_id INTEGER,
        merchant_name VARCHAR(100),
        datetime TIMESTAMP_NTZ,
        url VARCHAR(500),
        order_status VARCHAR(50),
        payment_method_external_id VARCHAR(255),
        payment_method_type VARCHAR(50),
        payment_method_brand VARCHAR(50),
        payment_method_last_four VARCHAR(10),
        payment_method_transaction_amount DECIMAL(18, 2),
        price_sub_total DECIMAL(18, 2),
        price_total DECIMAL(18, 2),
        price_currency VARCHAR(10),
        total_discount DECIMAL(18, 2),
        total_fee DECIMAL(18, 2),
        total_tax DECIMAL(18, 2),
        total_tip DECIMAL(18, 2),
        adjustments_json VARIANT
    )
    """
    
    # Create products table
    products_ddl = """
    CREATE TABLE IF NOT EXISTS products (
        transaction_id VARCHAR(255),
        merchant_id INTEGER,
        merchant_name VARCHAR(100),
        product_external_id VARCHAR(255),
        product_name VARCHAR(1000),
        product_url VARCHAR(500),
        quantity INTEGER,
        product_sub_total DECIMAL(18, 2),
        product_total DECIMAL(18, 2),
        product_unit_price DECIMAL(18, 2),
        eligibility VARCHAR(500),
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
    )
    """
    
    try:
        cursor.execute(transactions_ddl)
        print("✓ Created transactions table")
        
        cursor.execute(products_ddl)
        print("✓ Created products table")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        raise

def load_csv_to_table(cursor, csv_file, table_name):
    """Load CSV data into Snowflake table using COPY INTO"""
    if not csv_file.exists():
        print(f"✗ CSV file not found: {csv_file}")
        return False
    
    # Create a stage for file upload (internal stage)
    stage_name = f"{table_name}_stage"
    
    try:
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
        return False

def load_csv_using_insert(cursor, csv_file, table_name):
    """Alternative: Load CSV data using INSERT statements (for smaller files)"""
    if not csv_file.exists():
        print(f"✗ CSV file not found: {csv_file}")
        return False
    
    try:
        # Read CSV and prepare INSERT statements
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        if not rows:
            print(f"  No data to load for {table_name}")
            return True
        
        # Get column names
        columns = list(rows[0].keys())
        placeholders = ', '.join(['%s'] * len(columns))
        column_names = ', '.join(columns)
        
        # Prepare data
        values_list = []
        for row in rows:
            values = []
            for col in columns:
                val = row[col]
                # Handle empty strings as NULL
                if val == '':
                    values.append(None)
                else:
                    values.append(val)
            values_list.append(tuple(values))
        
        # Clear existing data (optional - remove if you want to append)
        cursor.execute(f"TRUNCATE TABLE IF EXISTS {table_name}")
        
        # Insert data
        insert_sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
        cursor.executemany(insert_sql, values_list)
        
        print(f"✓ Loaded {len(rows)} rows into {table_name}")
        return True
    except Exception as e:
        print(f"✗ Error loading {table_name}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("Snowflake Data Upload Script")
    print("=" * 60)
    
    # Validate connection parameters
    if not all([SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, 
                SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE]):
        print("\n⚠ Missing required Snowflake connection parameters!")
        print("\nSet environment variables:")
        print("  export SNOWFLAKE_ACCOUNT='your_account'")
        print("  export SNOWFLAKE_USER='your_username'")
        print("  export SNOWFLAKE_PASSWORD='your_password'")
        print("  export SNOWFLAKE_WAREHOUSE='your_warehouse'")
        print("  export SNOWFLAKE_DATABASE='your_database'")
        print("  export SNOWFLAKE_SCHEMA='your_schema'  # optional, defaults to PUBLIC")
        print("\nOr modify the connection parameters in this script.")
        sys.exit(1)
    
    # Connect to Snowflake
    conn = connect_to_snowflake()
    cursor = conn.cursor()
    
    try:
        # Create tables
        create_tables(cursor)
        
        # Load data
        print("\nLoading data...")
        
        # Try using COPY INTO first (more efficient for large files)
        # If that fails, fall back to INSERT statements
        try:
            load_csv_to_table(cursor, TRANSACTIONS_CSV, 'transactions')
        except Exception as e:
            print(f"  COPY INTO failed, trying INSERT method: {e}")
            load_csv_using_insert(cursor, TRANSACTIONS_CSV, 'transactions')
        
        try:
            load_csv_to_table(cursor, PRODUCTS_CSV, 'products')
        except Exception as e:
            print(f"  COPY INTO failed, trying INSERT method: {e}")
            load_csv_using_insert(cursor, PRODUCTS_CSV, 'products')
        
        # Commit transaction
        conn.commit()
        print("\n✓ Data upload completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error during upload: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
        print("✓ Connection closed")

if __name__ == '__main__':
    main()

