Knot API Credit Scoring Backend (Simulated)

This project is a Node.js backend that calculates a custom credit score based on financial data.

This version is modified to read from a local dummydata.json file instead of making a live call to the Knot API. This allows you to develop and test your credit scoring logic (calculateCreditScore and getLendingAmount functions) without needing a live, linked account.

The server is still structured as if it would call the Knot API, with the Knot SDK imported and the live-data-fetching code commented out in server.js for easy swapping later.

How to Run This Project

1. Prerequisites

Node.js (v18 or later).

2. Setup

Install Dependencies: Open your terminal in the project's root directory and run:

npm install


Configure Environment:

Rename .env.example to .env.

You only need to set the PORT (e.g., PORT=3000). The Knot API keys are not required for this simulation to run.

3. Run the Server

With your .env file saved, start the server:

npm start


You should see messages:

Server running at http://localhost:3000
Ready to calculate credit scores from dummydata.json.
Test endpoint: http://localhost:3000/api/get-credit-score


4. How to Use

Since the account linking frontend is not included in this version, you can test the logic directly using your browser or a tool like curl.

Option 1: In your browser
Simply visit: http://localhost:3000/api/get-credit-score

Option 2: In your terminal (using curl)

curl http://localhost:3000/api/get-credit-score


Example Output:

You will get a JSON response based on the logic in server.js and the data in dummydata.json.

(Based on the included dummy data, the user has one overdraft, so their score will be penalized).

{
  "creditScore": 625,
  "lendingOffer": {
    "status": "Approved",
    "maxAmount": 2000,
    "interestRate": "18.0%",
    "message": "You qualify for a small starter loan."
  },
  "analysis": {
    "accountName": "Main Checking",
    "currentBalance": 2500.77,
    "totalTransactionsAnalyzed": 10,
    "source": "dummydata.json (simulation)"
  }
}


Now you can modify dummydata.json and server.js to test all your different scoring scenarios!