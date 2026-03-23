import urllib.request
import json
try:
    print("Checking backend health...")
    with urllib.request.urlopen("http://localhost:8000/health") as response:
        print(f"Status: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
