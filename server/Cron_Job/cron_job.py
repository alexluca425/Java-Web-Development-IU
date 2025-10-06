import os
import sys
import requests
from dotenv import load_dotenv




# Get the backend URL var
backend_url = os.environ.get('BACKEND_ENDPOINT', 'http://localhost:5000')


# Function to run the grammar_reset endpoint in the mongo_grammar.py file
def run_grammar_reset():
    try:
        response = requests.post(
            f"{backend_url}/mongo_grammar/grammar_reset",
            headers={'Content-Type': 'application/json'},
            json={},
            timeout=30
        ) 

        data = response.json()

        if not data:
            print("No data to be changed")

        print("Cron job ran successfully")

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in cron: {e}")


# Only run this code when file is run directly
if __name__ == '__main__':
    run_grammar_reset()