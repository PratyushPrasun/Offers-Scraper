# Zepto Bank & Card Offers Scraper and Hub

An end-to-end automation and visualization tool that scrapes bank and credit/debit card payment offers from Zepto, normalizes the data into structured JSON, and provides both a rich terminal CLI and an interactive web dashboard with a real-time cart savings optimizer.

---

## Pipeline Architecture

```mermaid
flowchart TD
    A[User Input / Trigger] -->|python scrape.py| B[1. Browser Automation]
    B -->|Playwright Chromium| C[Zepto Web App: Cart & Offers Drawer]
    C -->|Extracts raw DOM text| D[2. Parsing & Normalization]
    D -->|parser.py: Regex & Rules| E[(offers.json)]
    
    E -->|python display.py [flags]| F[3a. Rich Terminal CLI]
    E -->|python server.py| G[3b. Python HTTP API & Static Server]
    E -->|npm run dev| H[3c. Vite React Frontend]
    
    F --> I[Formatted CLI Table / Filtered JSON]
    G --> J[Web Dashboard on :5050]
    H --> K[Web Dashboard on :5173]
```

---

## Tech Stack

- **Scraping & Automation**: Python 3.10+, [Playwright](https://playwright.dev/python/) (Chromium)
- **Data Parsing & CLI**: Python standard library (`re`, `dataclasses`, `argparse`, `http.server`), [Rich](https://github.com/Textualize/rich)
- **Testing**: [pytest](https://docs.pytest.org/)
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Data Store**: Flat JSON (`offers.json`)

---

## Prerequisites

- **Python**: Version 3.10 or higher (`python --version`)
- **Node.js**: Version 18 or higher (`node --version`)
- **Package Managers**: `pip` and `npm`

---

## Installation & Environment Setup

### 1. Clone & Navigate to Repository
```bash
cd "d:/Stack Projects/Zepto-offers"
```

### 2. Set Up Python Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies & Playwright Browser
```bash
pip install -r requirements.txt
playwright install chromium
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## Commands & Usage

### 1. Scrape Offers from Zepto
Launches a persistent Chromium browser instance, navigates to Zepto, accesses the payment offers drawer, extracts all deals, and saves them to `offers.json`.

```bash
# Standard run (opens browser and outputs Rich table)
python scrape.py

# Run and print scraped results as raw JSON
python scrape.py --json
```

> **Note on first run:** If prompted, confirm your delivery location and ensure at least one item is in the cart so Zepto unlocks and displays the offers drawer. Session credentials are saved in `.session/` for subsequent runs.

---

### 2. Run Parser Unit Tests
Validates bank matching, card-type detection, wallet exclusion, and discount calculation rules:

```bash
pytest test_parser.py
```

---

### 3. Terminal CLI Viewer & Filters (`display.py`)
View, search, filter, and sort previously scraped offers in `offers.json` without launching the browser:

```bash
# View all offers formatted in a Rich table
python display.py

# Filter by bank or payment network (case-insensitive)
python display.py --bank SBI
python display.py --bank ICICI
python display.py --bank Visa

# Filter by card type (credit, debit, or card)
python display.py --type credit
python display.py --type debit

# Filter to unlocked offers only
python display.py --unlocked

# Sort offers (by discount, spend, or bank)
python display.py --sort discount
python display.py --sort spend
python display.py --sort bank

# Force plain text table (without Rich colors/borders)
python display.py --text

# Output filtered results as JSON to stdout
python display.py --bank HDFC --json

# Specify a custom JSON file path
python display.py --file path/to/offers.json
```

---

### 4. Interactive Web Dashboard

The web frontend includes a **Smart Cart Savings Optimizer**, real-time bank and card filters, 1-click coupon copying, and card-style visuals.

#### Option A: Production Server (Single Command)
Builds the frontend (if not already built), serves static assets and `/api/offers` on port `5050`, and opens your browser:
```bash
python server.py
# or via CLI flag:
python display.py --web
```
*Access at: `http://localhost:5050`*

#### Option B: Frontend Development Mode
Run the Vite development server with Hot Module Replacement (HMR):
```bash
cd frontend
npm run dev
```
*Access at: `http://localhost:5173`*

#### Build Frontend Assets Manually
```bash
cd frontend
npm run build
```

---

## Project Structure

```
Zepto-offers/
├── scrape.py             # Playwright browser automation & scraper
├── parser.py             # Regex extraction, normalization, & Offer schema
├── display.py            # CLI visualizer, filter engine, & Rich table renderer
├── server.py             # Python HTTP server: serves frontend/dist & /api/offers (:5050)
├── test_parser.py        # Pytest test suite validating parsing rules
├── offers.json           # Scraped & normalized data output
├── requirements.txt      # Python dependencies (playwright, pytest, rich)
├── .session/             # Persistent browser profile & cookies (gitignored)
└── frontend/             # React 19 + Vite + Tailwind CSS v4 web dashboard
    ├── package.json      # Node dependencies and build scripts
    ├── vite.config.js    # Vite configuration with Tailwind CSS plugin
    ├── index.html        # SPA HTML entry point
    ├── dist/             # Production build output served by server.py
    └── src/
        ├── main.jsx      # React root rendering entry point
        ├── App.jsx       # Main dashboard component (optimizer, search, cards)
        ├── App.css       # App-level styling
        ├── index.css     # Tailwind CSS v4 imports and theme variables
        ├── components/   # Modular UI components
        ├── utils/        # Calculation & filtering helpers
        └── data/         # Fallback static offers.json for standalone dev
```

### Module Responsibilities & Data Contract

| Module | Primary Responsibility | Input | Output |
| :--- | :--- | :--- | :--- |
| `scrape.py` | Automates Chromium via Playwright, navigates Zepto cart, opens offers drawer, handles lazy scrolling. | Web DOM from `zepto.com` | Raw text of offers drawer |
| `parser.py` | Splits raw drawer text, matches bank keywords, extracts discount structures & promo codes via regex. | Raw drawer text | Structured `List[dict]` conforming to `Offer` schema |
| `offers.json` | Local storage serving as the single source of truth for CLI and Web interfaces. | Normalized offer dicts | JSON file on disk |
| `display.py` | Terminal interface with rich tables, filtering (`--bank`, `--type`), sorting, and raw JSON flags. | `offers.json` | Formatted terminal output or JSON |
| `server.py` | Lightweight zero-dependency HTTP server with SPA routing fallback and CORS-enabled API endpoint. | `frontend/dist` & `offers.json` | Web application & JSON API at `:5050` |
| `frontend/` | React 19 dashboard with interactive cart amount input, real-time unlock check, and 1-click promo copy. | `/api/offers` (or fallback JSON) | Interactive user interface |

#### `Offer` Data Contract (`offers.json`)
```json
{
  "title": "Get 15% off up to ₹125 off with HDFC Mastercard Debit Cards",
  "bank": "HDFC",
  "card_type": "debit",
  "discount_type": "percent",
  "discount_value": 15.0,
  "max_discount": 125.0,
  "promo_code": "ZEPHHDFCDC",
  "amount_to_unlock": 549.0,
  "status": "locked"
}
```

---

## Internal Processes & Data Flow

### 1. Scraping Process (`scrape.py`)
1. **Persistent Browser Session**: Playwright launches Chromium using a persistent user directory (`.session/`). This preserves delivery location, login state, and cookies across runs, avoiding repeated login prompts and anti-bot verification challenges.
2. **Drawer Navigation**:
   - Verifies if the cart drawer is open; if not, triggers the cart button.
   - Scans the cart for offer triggers (e.g., `"View all coupons"`, `"Bank offers"`).
   - Switches to the **Bank / Payment Offers** tab inside the drawer.
3. **Lazy Load Simulation**: Zepto's offer drawer renders deals lazily. The scraper executes smooth mouse-wheel scrolls and programmatic DOM scroll events (`scrollBy(0, 800)`) across multiple rounds to ensure all card offers are loaded into the DOM.
4. **Text Extraction**: Captures the complete rendered inner text of the drawer and passes it to the parser.

### 2. Parsing & Normalization Process (`parser.py`)
1. **Chunk Splitting**: Zepto offer cards terminate with a `"Know more"` action link. The parser chunks the raw text by splitting on `"Know more"`.
2. **Filtering & Validation**:
   - Checks titles against known Indian bank names (`HDFC`, `ICICI`, `SBI`, `AXIS`, `KOTAK`, `PNB`, etc.) and card networks (`Visa`, `Mastercard`, `RuPay`).
   - Filters out non-card wallet promotions (`Amazon Pay`, `Paytm`, `PhonePe`, `Mobikwik`) unless specifically co-branded with a bank card.
3. **Regex Extraction**:
   - **Discount Details**: Detects percentage (`(\d+)%`), flat rupee values (`₹(\d+)`), and cashback designations.
   - **Caps**: Extracts upper limits (e.g., `"up to ₹125"`).
   - **Promo Codes**: Matches Zepto coupon code formats (`ZEP[A-Z0-9]+`).
   - **Unlock Thresholds**: Extracts minimum spend requirements from `"Shop for ₹X more to unlock"`.
4. **Serialization**: Instantiates `Offer` dataclass instances and serializes them into `offers.json`.

### 3. CLI Display & Filtering Process (`display.py`)
1. **Argument Parsing**: Reads CLI options (`--bank`, `--type`, `--unlocked`, `--sort`, `--json`, `--text`).
2. **In-Memory Querying**:
   - Applies case-insensitive substring filters for bank names and card types (`credit` vs. `debit`).
   - Filters by unlock status.
   - Sorts results by discount value (descending), spend needed to unlock (ascending), or bank name.
3. **Rendering**:
   - If `rich` is installed: Generates an ANSI-styled table with color-coded badges for card types (magenta for credit, cyan for debit), statuses (green unlocked, red locked), and discount summaries.
   - Fallback / Plain text mode: Produces a clean ASCII table.
   - JSON mode: Emits filtered records to stdout.

### 4. Web Serving & API Flow (`server.py`)
1. **Static File Serving**: Serves the pre-built React application from `frontend/dist`.
2. **API Endpoint (`/api/offers`)**: Reads `offers.json` and returns standard JSON with `Content-Type: application/json`, CORS headers (`Access-Control-Allow-Origin: *`), and `no-cache` directives.
3. **SPA Fallback**: If an incoming request path does not match a physical static file or an API route, the server automatically rewrites the path to `/index.html`, supporting client-side routing.

### 5. Frontend Reactive Optimization Process (`frontend/src/App.jsx`)
1. **Data Ingestion**: Queries `/api/offers` on mount, falling back to `src/data/offers.json` if running in standalone static development.
2. **Smart Cart Savings Optimizer**:
   - User inputs a planned cart amount (e.g., `₹1,200`).
   - For every offer, the optimizer calculates the actual effective rupee discount:
     - Percent-based: `min(cart * (discount_value / 100), max_discount)`
     - Flat-based: `discount_value`
   - Dynamically re-evaluates whether the offer is unlocked based on the entered cart value.
   - Highlights the single highest-value deal as the **Top Recommendation**.
3. **UI Interactions**:
   - Real-time search bar and multi-criteria pill filters.
   - One-click promo code copying with animated clipboard feedback.
   - Glassmorphic card design displaying EMV chips and bank branding colors.

