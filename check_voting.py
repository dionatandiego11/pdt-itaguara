import requests
import json

with open('user_token.json', 'r') as f:
    data = json.load(f)
    token = data['access_token']

headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/v1/voting/sessions/active', headers=headers)

print(json.dumps(response.json(), indent=2))
