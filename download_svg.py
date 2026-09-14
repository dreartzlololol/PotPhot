import urllib.request
import os

url = "https://www.svgrepo.com/download/149911/japan-koi-fish.svg"
req = urllib.request.Request(
    url, 
    data=None, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
)
try:
    response = urllib.request.urlopen(req)
    with open("public/koi_pattern.svg", "wb") as f:
        f.write(response.read())
    print("Successfully downloaded koi SVG")
except Exception as e:
    print(f"Error downloading: {e}")
