"""
Lightweight Web Server for Zepto Offers Frontend.
Serves the built React app from frontend/dist and exposes /api/offers.
"""
import http.server
import json
import os
import sys
import webbrowser
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 5050
BASE_DIR = Path(__file__).parent.resolve()
DIST_DIR = BASE_DIR / "frontend" / "dist"
OFFERS_FILE = BASE_DIR / "offers.json"


class ZeptoOffersHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve static files from frontend/dist
        directory = str(DIST_DIR) if DIST_DIR.exists() else str(BASE_DIR / "frontend")
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        # API endpoint: /api/offers
        if self.path.startswith("/api/offers") or self.path == "/offers.json":
            if not OFFERS_FILE.exists():
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "offers.json not found. Run scrape.py first."}).encode("utf-8"))
                return

            try:
                with open(OFFERS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)

                content = json.dumps(data, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        # Fallback to SPA routing if file not found
        path_in_dir = DIST_DIR / self.path.lstrip("/")
        if not path_in_dir.exists() and not self.path.startswith("/assets"):
            self.path = "/index.html"

        super().do_GET()


def run_server(port=PORT, open_browser=True):
    # Ensure frontend/dist exists
    if not DIST_DIR.exists():
        print(f"[!] Warning: {DIST_DIR} not found. Building frontend...")
        os.system("cd frontend && npm run build")

    server_address = ("", port)
    httpd = http.server.ThreadingHTTPServer(server_address, ZeptoOffersHandler)
    url = f"http://localhost:{port}"

    print(f"\n=======================================================")
    print(f"  ⚡ Zepto Offers Web Frontend Running at: {url}")
    print(f"  Press Ctrl+C to stop the server")
    print(f"=======================================================\n")

    if open_browser:
        webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else PORT
    no_browser = "--no-browser" in sys.argv
    run_server(port=port, open_browser=not no_browser)
