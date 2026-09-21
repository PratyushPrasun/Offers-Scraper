import argparse
import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich import box
    HAS_RICH = True
except ImportError:
    HAS_RICH = False


# Map long bank names to standard recognizable abbreviations for compact table rendering
BANK_ABBR = {
    "PUNJAB NATIONAL BANK": "PNB",
    "BANK OF BARODA": "BOB",
    "INDIAN OVERSEAS BANK": "IOB",
    "STANDARD CHARTERED": "StanC",
    "AU SMALL FINANCE BANK": "AU",
    "AU SMALL FINANCE": "AU",
    "AU SMALL": "AU",
}


def _clean_bank_name(bank: Optional[str]) -> str:
    if not bank:
        return "[dim]General[/dim]"
    up = bank.upper()
    return BANK_ABBR.get(up, bank)


def _format_discount(offer: Dict[str, Any], compact: bool = False) -> str:
    dtype = offer.get("discount_type")
    dval = offer.get("discount_value")
    max_d = offer.get("max_discount")

    if dtype == "percent" and dval is not None:
        val_str = f"{int(dval)}%" if isinstance(dval, (int, float)) and dval.is_integer() else f"{dval}%"
        if max_d is not None:
            max_str = f"₹{int(max_d):,}" if isinstance(max_d, (int, float)) and max_d.is_integer() else f"₹{max_d}"
            return f"{val_str} (up to {max_str})" if not compact else f"{val_str} (max {max_str})"
        return f"{val_str} OFF"
    elif dtype == "flat" and dval is not None:
        val_str = f"₹{int(dval):,}" if isinstance(dval, (int, float)) and dval.is_integer() else f"₹{dval}"
        return f"{val_str} FLAT" if compact else f"{val_str} FLAT OFF"
    elif dtype == "cashback" and dval is not None:
        val_str = f"₹{int(dval):,}" if isinstance(dval, (int, float)) and dval.is_integer() else f"₹{dval}"
        return f"{val_str} CB" if compact else f"{val_str} CASHBACK"
    elif dval is not None:
        return str(dval)
    return "—"


def _format_card_type(card_type: Optional[str], compact: bool = False) -> str:
    if not card_type:
        return "—"
    card_type_lower = card_type.lower()
    if "credit" in card_type_lower:
        text = "CR" if compact else "CREDIT"
        return f"[bold magenta]{text}[/bold magenta]" if HAS_RICH else text
    elif "debit" in card_type_lower:
        text = "DB" if compact else "DEBIT"
        return f"[bold cyan]{text}[/bold cyan]" if HAS_RICH else text
    text = card_type[:4].upper() if compact else card_type.upper()
    return f"[bold blue]{text}[/bold blue]" if HAS_RICH else text


def _format_status(status: Optional[str], compact: bool = False) -> str:
    status_lower = (status or "").lower()
    if status_lower == "unlocked":
        text = "OPEN" if compact else "✓ UNLOCKED"
        return f"[bold green]{text}[/bold green]" if HAS_RICH else text
    text = "LOCKED" if compact else "🔒 LOCKED"
    return f"[bold red]{text}[/bold red]" if HAS_RICH else text


def _format_unlock_spend(amount: Optional[float]) -> str:
    if amount is None or amount == 0:
        return "—"
    return f"₹{int(amount):,}" if isinstance(amount, (int, float)) and amount.is_integer() else f"₹{amount}"


def display_offers_rich(offers: List[Dict[str, Any]], console: Optional["Console"] = None) -> None:
    if console is None:
        console = Console(legacy_windows=False)

    if not offers:
        console.print("[yellow]No matching offers found.[/yellow]")
        return

    # Summary metrics
    total = len(offers)
    banks = sorted(list({_clean_bank_name(o.get("bank")) for o in offers if o.get("bank")}))
    credit_count = sum(1 for o in offers if (o.get("card_type") or "").lower() == "credit")
    debit_count = sum(1 for o in offers if (o.get("card_type") or "").lower() == "debit")
    other_cards = total - (credit_count + debit_count)
    unlocked_count = sum(1 for o in offers if (o.get("status") or "").lower() == "unlocked")

    card_dist = f"[magenta]{credit_count} Credit[/magenta] / [cyan]{debit_count} Debit[/cyan]"
    if other_cards > 0:
        card_dist += f" / [blue]{other_cards} Other[/blue]"

    summary_text = (
        f"[bold white]Total Offers:[/bold white] [bold cyan]{total}[/bold cyan]   │   "
        f"[bold white]Banks / Networks:[/bold white] [bold cyan]{len(banks)}[/bold cyan]   │   "
        f"[bold white]Cards:[/bold white] {card_dist}   │   "
        f"[bold white]Unlocked:[/bold white] [{'green' if unlocked_count > 0 else 'dim'}]{unlocked_count}[/{'green' if unlocked_count > 0 else 'dim'}]"
    )

    console.print()
    console.print(Panel(summary_text, title="⚡ [bold bright_green]Zepto Bank & Card Offers[/bold bright_green] ⚡", border_style="bright_blue", box=box.ROUNDED))

    show_details = console.width >= 115
    is_compact = console.width < 95

    table = Table(
        box=box.ROUNDED,
        header_style="bold bright_white on blue",
        row_styles=["none", "dim"],
        expand=True if show_details else False,
        show_lines=False,
        pad_edge=False,
    )

    table.add_column("#", justify="right", style="bold dim", min_width=3, no_wrap=True)
    table.add_column("Bank", style="bold cyan", max_width=10 if is_compact else 18, overflow="ellipsis", no_wrap=True)
    table.add_column("Card", justify="center", min_width=4 if is_compact else 8, no_wrap=True)
    table.add_column("Discount", style="bold bright_green", no_wrap=True)
    table.add_column("Promo Code" if not is_compact else "Code", justify="center", style="bold yellow", no_wrap=True)
    table.add_column("Min Spend" if not is_compact else "Spend", justify="right", style="bright_white", no_wrap=True)
    table.add_column("Status", justify="center", min_width=7 if is_compact else 12, no_wrap=True)
    if show_details:
        table.add_column("Offer Details", style="dim", overflow="fold")

    for idx, offer in enumerate(offers, 1):
        bank = _clean_bank_name(offer.get("bank"))
        card = _format_card_type(offer.get("card_type"), compact=is_compact)
        discount = _format_discount(offer, compact=is_compact)
        code = offer.get("promo_code") or "[dim]—[/dim]"
        unlock = _format_unlock_spend(offer.get("amount_to_unlock"))
        status = _format_status(offer.get("status"), compact=is_compact)

        row = [
            str(idx),
            bank,
            card,
            discount,
            code,
            unlock,
            status,
        ]
        if show_details:
            row.append(offer.get("title") or "")

        table.add_row(*row)

    console.print(table)
    console.print(f"[dim]📁 Offers saved to [bold white]offers.json[/bold white] ({total} items)[/dim]\n")


def display_offers_clean_text(offers: List[Dict[str, Any]]) -> None:
    if not offers:
        print("\nNo matching offers found.\n")
        return

    total = len(offers)
    credit_count = sum(1 for o in offers if (o.get("card_type") or "").lower() == "credit")
    debit_count = sum(1 for o in offers if (o.get("card_type") or "").lower() == "debit")
    unlocked_count = sum(1 for o in offers if (o.get("status") or "").lower() == "unlocked")

    print("\n" + "=" * 118)
    print(f" ZEPTO BANK & CARD OFFERS ({total} Total | {credit_count} Credit | {debit_count} Debit | {unlocked_count} Unlocked)")
    print("=" * 118)
    header = f"{'#':>3} | {'BANK/NETWORK':<15} | {'TYPE':<7} | {'DISCOUNT/BENEFIT':<24} | {'PROMO CODE':<15} | {'MIN SPEND':>10} | {'STATUS':<11} | {'DETAILS'}"
    print(header)
    print("-" * 118)

    for idx, offer in enumerate(offers, 1):
        bank = offer.get("bank") or "General"
        card = (offer.get("card_type") or "—").upper()
        discount = _format_discount(offer)
        code = offer.get("promo_code") or "—"
        unlock = _format_unlock_spend(offer.get("amount_to_unlock"))
        status = (offer.get("status") or "—").upper()
        title = offer.get("title") or ""

        row = f"{idx:>3} | {bank:<15} | {card:<7} | {discount:<24} | {code:<15} | {unlock:>10} | {status:<11} | {title}"
        print(row)

    print("=" * 118)
    print(f"Offers saved to offers.json ({total} items)\n")


def display_offers(offers: List[Dict[str, Any]], force_text: bool = False) -> None:
    if HAS_RICH and not force_text:
        display_offers_rich(offers)
    else:
        display_offers_clean_text(offers)


def filter_and_sort_offers(
    offers: List[Dict[str, Any]],
    bank: Optional[str] = None,
    card_type: Optional[str] = None,
    unlocked_only: bool = False,
    sort_by: Optional[str] = None,
) -> List[Dict[str, Any]]:
    filtered = list(offers)

    if bank:
        bank_q = bank.lower()
        filtered = [o for o in filtered if o.get("bank") and bank_q in o["bank"].lower()]

    if card_type:
        type_q = card_type.lower()
        filtered = [o for o in filtered if o.get("card_type") and type_q in o["card_type"].lower()]

    if unlocked_only:
        filtered = [o for o in filtered if (o.get("status") or "").lower() == "unlocked"]

    if sort_by == "discount":
        filtered.sort(key=lambda o: (o.get("discount_value") or 0), reverse=True)
    elif sort_by == "spend":
        filtered.sort(key=lambda o: (o.get("amount_to_unlock") or 0))
    elif sort_by == "bank":
        filtered.sort(key=lambda o: (o.get("bank") or "ZZZ").lower())

    return filtered


def main() -> None:
    parser = argparse.ArgumentParser(description="Visualize Zepto bank and card offers.")
    parser.add_argument("--file", default="offers.json", help="Path to offers.json (default: offers.json)")
    parser.add_argument("--bank", help="Filter by bank or card network name (e.g., SBI, ICICI, Visa)")
    parser.add_argument("--type", choices=["credit", "debit", "card"], help="Filter by card type")
    parser.add_argument("--unlocked", action="store_true", help="Show only unlocked offers")
    parser.add_argument("--sort", choices=["discount", "spend", "bank"], help="Sort offers by field")
    parser.add_argument("--json", action="store_true", help="Output filtered results as raw JSON")
    parser.add_argument("--text", action="store_true", help="Force clean plain-text table output")
    parser.add_argument("--web", action="store_true", help="Launch interactive web frontend in your browser")

    args = parser.parse_args()

    if args.web:
        from server import run_server
        run_server()
        return

    offers_path = Path(args.file)

    if not offers_path.exists():
        print(f"Error: File '{offers_path}' does not exist. Run scrape.py first.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(offers_path, "r", encoding="utf-8") as f:
            offers = json.load(f)
    except Exception as e:
        print(f"Error reading {offers_path}: {e}", file=sys.stderr)
        sys.exit(1)

    processed = filter_and_sort_offers(
        offers,
        bank=args.bank,
        card_type=args.type,
        unlocked_only=args.unlocked,
        sort_by=args.sort,
    )

    if args.json:
        print(json.dumps(processed, indent=2, ensure_ascii=False))
    else:
        display_offers(processed, force_text=args.text)


if __name__ == "__main__":
    main()
