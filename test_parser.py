from parser import parse_panel_text

SAMPLE = """
Get Upto ₹50 Cashback on using Amazon Pay
Shop for ₹99 more to apply
Know more
Flat ₹125 Off with IDFC FIRST Bank Debit Cards
Locked
Shop for ₹549 more to unlock
ZEPIDFCDC
Know more
Flat ₹100 off with HSBC Bank Credit Cards
Locked
Shop for ₹549 more to unlock
ZEPHSBC
Know more
Get 15% off up to ₹125 off with HDFC Mastercard Debit Cards
Locked
Shop for ₹549 more to unlock
ZEPHHDFCDC
Know more
"""

def test_filters_and_parses():
    offers = parse_panel_text(SAMPLE)
    assert len(offers) == 3                       # Amazon Pay wallet excluded
    idfc = offers[0]
    assert idfc["bank"] == "IDFC" and idfc["card_type"] == "debit"
    assert idfc["discount_type"] == "flat" and idfc["discount_value"] == 125
    assert idfc["promo_code"] == "ZEPIDFCDC" and idfc["amount_to_unlock"] == 549
    hdfc = offers[2]
    assert hdfc["discount_type"] == "percent" and hdfc["discount_value"] == 15
    assert hdfc["max_discount"] == 125