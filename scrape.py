import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from parser import parse_panel_text
from display import display_offers

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

SESSION_DIR = Path(".session")   # persistent browser profile (gitignored)


def ensure_cart_open(page):
    """Ensure the cart drawer is open if not already visible."""
    # Check if cart drawer or bill details are already open
    cart_indicators = page.locator("text=/bill details|to pay|cart summary|delivery partner fee/i").first
    if cart_indicators.is_visible():
        return True

    cart_btn = page.locator("[aria-label*='cart' i], button:has-text('Cart'), a[href*='cart'], [data-testid*='cart']").first
    if cart_btn.is_visible():
        try:
            cart_btn.click(timeout=3000)
            page.wait_for_timeout(2000)
            return True
        except Exception:
            pass
    return False


def find_offers_trigger(page):
    """Find the link or button that opens the offers/coupons panel."""
    # Check common text variations Zepto uses in the cart
    patterns = [
        re.compile(r"view\s*(all\s*)?(payment\s*offers|coupons?|offers|bank\s*offers)", re.I),
        re.compile(r"avail\s*(offers|coupons)", re.I),
        re.compile(r"apply\s*coupon", re.I),
        re.compile(r"coupons?\s*(&|and)\s*offers?", re.I),
        re.compile(r"bank\s*offers?", re.I),
        re.compile(r"payment\s*offers?", re.I),
    ]
    for pat in patterns:
        link = page.get_by_text(pat).first
        if link.is_visible():
            return link

    # Also check locator attributes
    attr_elem = page.locator("[data-testid*='coupon'], [data-testid*='offer'], [aria-label*='coupon' i], [aria-label*='offer' i]").first
    if attr_elem.is_visible():
        return attr_elem

    return None


def select_bank_offers_tab(page):
    """Switch to the Bank/Payment Offers tab inside the offers drawer."""
    tab_patterns = [
        re.compile(r"^(payment|bank|card)\s*offers?$", re.I),
        re.compile(r"payment\s*offers?|bank\s*offers?", re.I),
    ]
    for pat in tab_patterns:
        tab = page.get_by_text(pat).first
        if tab.is_visible():
            try:
                tab.click(timeout=3000)
                page.wait_for_timeout(1500)
                return True
            except Exception:
                pass
    return False


def open_payment_offers(page):
    # If not on Zepto, navigate once
    if "zepto.com" not in page.url:
        page.goto("https://www.zepto.com", wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

    while True:
        # 1. If Bank/Payment offers tab or drawer is already visible, select it and finish
        if select_bank_offers_tab(page):
            return

        # 2. Make sure the cart drawer is open
        ensure_cart_open(page)

        # 3. Look for the offers link/button
        trigger = find_offers_trigger(page)
        if trigger and trigger.is_visible():
            try:
                trigger.click(timeout=5000)
                page.wait_for_timeout(2000)
                select_bank_offers_tab(page)
                return
            except Exception as e:
                print(f"[!] Note: Click on offers trigger failed ({e}), retrying...")

        # 4. If neither was found, cart may be empty or location modal is blocking
        print("\n[!] Could not find the offers section.")
        print("    Zepto requires at least one item in the cart to display offers.")
        print("\n--> In the browser window:")
        print("    1. Confirm your delivery location.")
        print("    2. Add ANY item to the cart (or open the cart).")
        input("--> Once an item is in the cart, press Enter here to continue...")
        page.wait_for_timeout(2000)


def scroll_offer_panel(page, rounds=8):
    """The offers list is a scrollable panel; scroll so lazy items render."""
    for _ in range(rounds):
        # Scroll at common drawer position
        page.mouse.move(1100, 500)
        page.mouse.wheel(0, 800)
        # Also scroll any scrollable elements in the page/drawer directly
        try:
            page.evaluate("""
                () => {
                    const els = Array.from(document.querySelectorAll('div, section, aside'))
                        .filter(el => {
                            const style = window.getComputedStyle(el);
                            return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
                        });
                    for (const el of els) {
                        el.scrollBy(0, 800);
                    }
                }
            """)
        except Exception:
            pass
        page.wait_for_timeout(400)


def main():
    first_run = not SESSION_DIR.exists()
    with sync_playwright() as p:
        # Note: Zepto returns HTTP 429 when headless=True due to anti-bot protection.
        # Running with headless=False keeps the session active and working.
        ctx = p.chromium.launch_persistent_context(
            str(SESSION_DIR),
            headless=False,
            viewport={"width": 1400, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        if first_run:
            page.goto("https://www.zepto.com")
            input("First time setup: Set your location, log in, add any item to the cart, "
                  "then press Enter here...")

        try:
            open_payment_offers(page)
        except Exception as e:
            sys.exit(f"Error opening offers panel: {e}")

        scroll_offer_panel(page)
        panel_text = page.locator("body").inner_text()
        offers = parse_panel_text(panel_text)
        ctx.close()

    Path("offers.json").write_text(json.dumps(offers, indent=2, ensure_ascii=False), encoding="utf-8")
    if "--json" in sys.argv:
        print(json.dumps(offers, indent=2, ensure_ascii=False))
    else:
        display_offers(offers)


if __name__ == "__main__":
    main()
