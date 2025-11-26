import requests
import json

with open('user_token.json', 'r') as f:
    data = json.load(f)
    token = data['access_token']

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
payload = {'option': 'yes'}

response = requests.post('http://localhost:8000/api/v1/votes/proposals/7/vote', headers=headers, json=payload)

print(f"Status Code: {response.status_code}")
print(json.dumps(response.json(), indent=2))
