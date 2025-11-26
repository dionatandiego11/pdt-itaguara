import json
import requests

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwiZXhwIjoxNzY0MDc5OTAyLCJ0eXBlIjoiYWNjZXNzIn0.LKSoKVRH0jLdBiTC9qeIbwC5YboIIHdOO5qi-jYvij0"
PROPOSAL_ID = 7


def main():
    url = f"http://localhost:8000/api/v1/votes/proposals/{PROPOSAL_ID}/vote"
    payload = {"option": "yes"}
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
    }
    resp = requests.post(url, json=payload, headers=headers)
    print("status", resp.status_code)
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)


if __name__ == "__main__":
    main()
