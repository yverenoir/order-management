Assumptions:
- Total price from verifying order response is the total price after the discounts have been applied and shipping cost have been added, similar to a shopping cart overview
- Total price = Original price x order quantity - discount + shipping cost
- Volume discount are applied on the entire order, not on the possible shipping per warehouse
- Shipping cost = every started km * every started kg * 0.01, e.g. if distance between warehouse and customer's shipping address is > 0 and < 1, we count it as 1km, same as with weight of order, if the order weight is > 0, and < 1, we count it as 1kg. Similar to DHL weight to price brackets on: https://www.dhl.de/en/privatkunden/pakete-versenden/weltweit-versenden/preise-international.html#preise