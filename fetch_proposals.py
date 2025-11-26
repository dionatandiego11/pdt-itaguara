import requests
import json

with open('user_token.json', 'r') as f:
    data = json.load(f)
    token = data['access_token']

headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/v1/proposals/', headers=headers)

print(json.dumps(response.json(), indent=2))
with open('proposals_auth.json', 'w') as f:
    json.dump(response.json(), f, indent=2)
