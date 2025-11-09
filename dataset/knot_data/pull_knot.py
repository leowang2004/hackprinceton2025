import urllib.request
import json
import os
import csv

# API endpoint
url = "https://knot.tunnel.tel/transactions/sync"

# Merchant IDs mapping
merchants = {
    "Amazon": 44,
    "Costco": 165,
    "Doordash": 19,
    "Instacart": 40,
    "Target": 12,
    "Ubereats": 36,
    "Walmart": 45
}

# Request body template
def get_request_body(merchant_id):
    return {
        "merchant_id": merchant_id,
        "external_user_id": "abc",
        "limit": 5
    }

def flatten_transaction(transaction, merchant_id, merchant_name):
    """Flatten a transaction into a row for transactions CSV"""
    # Extract payment method info (take first payment method)
    payment_method = transaction.get("payment_methods", [{}])[0] if transaction.get("payment_methods") else {}
    
    # Calculate total adjustments
    adjustments = transaction.get("price", {}).get("adjustments", [])
    def safe_float(value):
        try:
            return float(value) if value else 0.0
        except (ValueError, TypeError):
            return 0.0
    
    total_discount = sum(safe_float(adj.get("amount", 0)) for adj in adjustments if adj.get("type") in ["DISCOUNT", "PROMO"])
    total_fee = sum(safe_float(adj.get("amount", 0)) for adj in adjustments if adj.get("type") == "FEE")
    total_tax = sum(safe_float(adj.get("amount", 0)) for adj in adjustments if adj.get("type") == "TAX")
    total_tip = sum(safe_float(adj.get("amount", 0)) for adj in adjustments if adj.get("type") == "TIP")
    
    price_info = transaction.get("price", {})
    
    return {
        "transaction_id": transaction.get("id", ""),
        "external_id": transaction.get("external_id", ""),
        "merchant_id": merchant_id,
        "merchant_name": merchant_name,
        "datetime": transaction.get("datetime", ""),
        "url": transaction.get("url", ""),
        "order_status": transaction.get("order_status", ""),
        "payment_method_external_id": payment_method.get("external_id", ""),
        "payment_method_type": payment_method.get("type", ""),
        "payment_method_brand": payment_method.get("brand", ""),
        "payment_method_last_four": payment_method.get("last_four", ""),
        "payment_method_transaction_amount": payment_method.get("transaction_amount", ""),
        "price_sub_total": price_info.get("sub_total", ""),
        "price_total": price_info.get("total", ""),
        "price_currency": price_info.get("currency", ""),
        "total_discount": total_discount,
        "total_fee": total_fee,
        "total_tax": total_tax,
        "total_tip": total_tip,
        "adjustments_json": json.dumps(adjustments) if adjustments else ""
    }

def flatten_products(transaction, merchant_id, merchant_name):
    """Flatten products from a transaction into rows for products CSV"""
    products = []
    transaction_id = transaction.get("id", "")
    
    for product in transaction.get("products", []):
        product_price = product.get("price", {})
        eligibility = product.get("eligibility", [])
        
        products.append({
            "transaction_id": transaction_id,
            "merchant_id": merchant_id,
            "merchant_name": merchant_name,
            "product_external_id": product.get("external_id", ""),
            "product_name": product.get("name", ""),
            "product_url": product.get("url", ""),
            "quantity": product.get("quantity", ""),
            "product_sub_total": product_price.get("sub_total", ""),
            "product_total": product_price.get("total", ""),
            "product_unit_price": product_price.get("unit_price", ""),
            "eligibility": ",".join(eligibility) if eligibility else ""
        })
    
    return products

# Collect all transactions and products across all merchants
all_transactions = []
all_products = []

# Make requests and process responses
for merchant_name, merchant_id in merchants.items():
    print(f"Fetching data for {merchant_name} (merchant_id: {merchant_id})...")
    
    try:
        # Prepare request data
        data = json.dumps(get_request_body(merchant_id)).encode('utf-8')
        
        # Create request
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        # Make POST request
        with urllib.request.urlopen(req) as response:
            # Get JSON response
            response_data = json.loads(response.read().decode('utf-8'))
            
            # Process transactions
            transactions = response_data.get("transactions", [])
            for transaction in transactions:
                # Flatten transaction
                flat_transaction = flatten_transaction(transaction, merchant_id, merchant_name)
                all_transactions.append(flat_transaction)
                
                # Flatten products
                flat_products = flatten_products(transaction, merchant_id, merchant_name)
                all_products.extend(flat_products)
            
            print(f"✓ Processed {len(transactions)} transactions with {sum(len(t.get('products', [])) for t in transactions)} products for {merchant_name}")
        
    except urllib.error.HTTPError as e:
        print(f"✗ HTTP Error fetching {merchant_name}: {e.code} - {e.reason}")
        if e.fp:
            error_body = e.read().decode('utf-8')
            print(f"  Error details: {error_body}")
    except Exception as e:
        print(f"✗ Error processing {merchant_name}: {e}")

# Write transactions CSV
if all_transactions:
    transactions_file = os.path.join(os.path.dirname(__file__), "transactions.csv")
    with open(transactions_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            "transaction_id", "external_id", "merchant_id", "merchant_name",
            "datetime", "url", "order_status",
            "payment_method_external_id", "payment_method_type", "payment_method_brand",
            "payment_method_last_four", "payment_method_transaction_amount",
            "price_sub_total", "price_total", "price_currency",
            "total_discount", "total_fee", "total_tax", "total_tip", "adjustments_json"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_transactions)
    print(f"\n✓ Saved {len(all_transactions)} transactions to transactions.csv")

# Write products CSV
if all_products:
    products_file = os.path.join(os.path.dirname(__file__), "products.csv")
    with open(products_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            "transaction_id", "merchant_id", "merchant_name",
            "product_external_id", "product_name", "product_url",
            "quantity", "product_sub_total", "product_total", "product_unit_price",
            "eligibility"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_products)
    print(f"✓ Saved {len(all_products)} products to products.csv")

print("\nDone! CSV files are ready for Snowflake import.")
