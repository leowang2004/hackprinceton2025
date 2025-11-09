import urllib.request
import json
import os

# Nessie API configuration
NESSIE_BASE_URL = "http://api.nessieisreal.com"
NESSIE_API_KEY = "cae10384de09c187245926bab130cd0c"
NESSIE_ACCOUNT_ID = "690f8d1708f7513c4ad89fda"

# Three Nessie endpoints to fetch
endpoints = {
    "bills": f"/accounts/{NESSIE_ACCOUNT_ID}/bills?key={NESSIE_API_KEY}",
    "loans": f"/accounts/{NESSIE_ACCOUNT_ID}/loans?key={NESSIE_API_KEY}",
    "deposits": f"/accounts/{NESSIE_ACCOUNT_ID}/deposits?key={NESSIE_API_KEY}"
}

# Fetch data from each endpoint and save as JSON
for name, endpoint in endpoints.items():
    print(f"Fetching {name} data...")
    
    try:
        url = f"{NESSIE_BASE_URL}{endpoint}"
        
        # Create request
        req = urllib.request.Request(url)
        
        # Make GET request
        with urllib.request.urlopen(req) as response:
            # Get JSON response
            response_data = json.loads(response.read().decode('utf-8'))
            
            # Save to JSON file
            filename = f"{name}.json"
            filepath = os.path.join(os.path.dirname(__file__), filename)
            
            with open(filepath, 'w') as f:
                json.dump(response_data, f, indent=2)
            
            print(f"✓ Saved {name} data to {filename}")
        
    except urllib.error.HTTPError as e:
        print(f"✗ HTTP Error fetching {name}: {e.code} - {e.reason}")
        if e.fp:
            error_body = e.read().decode('utf-8')
            print(f"  Error details: {error_body}")
    except Exception as e:
        print(f"✗ Error processing {name}: {e}")

print("\nDone!")

