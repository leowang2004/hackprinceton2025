"""
Query script for Snowflake - Run various queries on your transaction data.

Usage:
    python3 query_snowflake.py
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

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        break

def connect_to_snowflake():
    """Establish connection to Snowflake"""
    try:
        conn = snowflake.connector.connect(
            user=os.getenv('SNOWFLAKE_USER'),
            password=os.getenv('SNOWFLAKE_PASSWORD'),
            account=os.getenv('SNOWFLAKE_ACCOUNT'),
            warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
            database=os.getenv('SNOWFLAKE_DATABASE'),
            schema=os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC')
        )
        return conn
    except Exception as e:
        print(f"✗ Failed to connect to Snowflake: {e}")
        sys.exit(1)

def run_query(cursor, query, description):
    """Run a query and display results"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        if not results:
            print("No results found.")
            return
        
        # Print header
        header = " | ".join(f"{col:<20}" for col in columns)
        print(header)
        print("-" * len(header))
        
        # Print rows
        for row in results:
            row_str = " | ".join(f"{str(val):<20}" for val in row)
            print(row_str)
        
        print(f"\nTotal rows: {len(results)}")
    except Exception as e:
        print(f"✗ Error running query: {e}")

def main():
    """Run example queries"""
    print("=" * 60)
    print("Snowflake Query Examples")
    print("=" * 60)
    
    conn = connect_to_snowflake()
    cursor = conn.cursor()
    
    try:
        # Query 1: Total spend by merchant
        run_query(cursor, """
            SELECT 
                merchant_name,
                COUNT(*) as transaction_count,
                SUM(price_total) as total_spend,
                AVG(price_total) as avg_transaction
            FROM transactions
            GROUP BY merchant_name
            ORDER BY total_spend DESC
        """, "Total Spend by Merchant")
        
        # Query 2: Recent transactions
        run_query(cursor, """
            SELECT 
                transaction_id,
                merchant_name,
                datetime,
                order_status,
                price_total
            FROM transactions
            ORDER BY datetime DESC
            LIMIT 10
        """, "10 Most Recent Transactions")
        
        # Query 3: Products with FSA/HSA eligibility
        run_query(cursor, """
            SELECT 
                product_name,
                merchant_name,
                quantity,
                product_total,
                eligibility
            FROM products
            WHERE eligibility LIKE '%FSA_HSA%'
            ORDER BY product_total DESC
            LIMIT 20
        """, "FSA/HSA Eligible Products")
        
        # Query 4: Top products by total spend
        run_query(cursor, """
            SELECT 
                product_name,
                merchant_name,
                SUM(quantity) as total_quantity,
                SUM(product_total) as total_spend,
                AVG(product_unit_price) as avg_unit_price
            FROM products
            GROUP BY product_name, merchant_name
            ORDER BY total_spend DESC
            LIMIT 20
        """, "Top Products by Total Spend")
        
        # Query 5: Transaction summary with product counts
        run_query(cursor, """
            SELECT 
                t.transaction_id,
                t.merchant_name,
                t.datetime,
                t.price_total,
                COUNT(p.product_external_id) as product_count,
                SUM(p.quantity) as total_items
            FROM transactions t
            LEFT JOIN products p ON t.transaction_id = p.transaction_id
            GROUP BY t.transaction_id, t.merchant_name, t.datetime, t.price_total
            ORDER BY t.datetime DESC
            LIMIT 10
        """, "Transaction Summary with Product Counts")
        
        # Query 6: Payment method breakdown
        run_query(cursor, """
            SELECT 
                payment_method_brand,
                payment_method_type,
                COUNT(*) as transaction_count,
                SUM(price_total) as total_spend
            FROM transactions
            WHERE payment_method_brand IS NOT NULL
            GROUP BY payment_method_brand, payment_method_type
            ORDER BY total_spend DESC
        """, "Payment Method Breakdown")
        
        # Query 7: Monthly spending trend
        run_query(cursor, """
            SELECT 
                DATE_TRUNC('month', datetime) as month,
                COUNT(*) as transaction_count,
                SUM(price_total) as monthly_spend,
                AVG(price_total) as avg_transaction
            FROM transactions
            GROUP BY DATE_TRUNC('month', datetime)
            ORDER BY month DESC
        """, "Monthly Spending Trend")
        
        # Query 8: Discount and fee analysis
        run_query(cursor, """
            SELECT 
                merchant_name,
                COUNT(*) as transactions,
                SUM(total_discount) as total_discounts,
                SUM(total_fee) as total_fees,
                SUM(total_tax) as total_tax,
                SUM(total_tip) as total_tips
            FROM transactions
            GROUP BY merchant_name
            ORDER BY total_discounts DESC
        """, "Discount and Fee Analysis by Merchant")
        
        # Interactive mode
        print(f"\n{'='*60}")
        print("Interactive Query Mode")
        print("Enter SQL queries (type 'exit' to quit)")
        print(f"{'='*60}\n")
        
        while True:
            try:
                query = input("SQL> ").strip()
                if query.lower() in ['exit', 'quit', 'q']:
                    break
                if not query:
                    continue
                if query.endswith(';'):
                    query = query[:-1]
                
                cursor.execute(query)
                results = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                
                if results:
                    # Print header
                    header = " | ".join(f"{col:<20}" for col in columns)
                    print(header)
                    print("-" * len(header))
                    
                    # Print rows (limit to 50 for display)
                    for i, row in enumerate(results[:50]):
                        row_str = " | ".join(f"{str(val):<20}" for val in row)
                        print(row_str)
                    
                    if len(results) > 50:
                        print(f"\n... and {len(results) - 50} more rows")
                    print(f"\nTotal rows: {len(results)}")
                else:
                    print("No results found.")
                print()
            except KeyboardInterrupt:
                print("\nExiting...")
                break
            except Exception as e:
                print(f"Error: {e}\n")
        
    finally:
        cursor.close()
        conn.close()
        print("\n✓ Connection closed")

if __name__ == '__main__':
    main()

