# Assumptions
- Total price from verifying order response is the total price after the discounts have been applied and shipping cost have been added, similar to a shopping cart overview
- Total price = Original price x order quantity - discount + shipping cost
- Volume discount are applied on the entire order, not on the possible shipping per warehouse
- Shipping cost = every started km * every started kg * 0.01, e.g. if distance between warehouse and customer's shipping address is > 0 and < 1, we count it as 1km, same as with weight of order, if the order weight is > 0, and < 1, we count it as 1kg. Similar to DHL weight to price brackets on: https://www.dhl.de/en/privatkunden/pakete-versenden/weltweit-versenden/preise-international.html#preise


## Distance provider
- A more accurate way to gauge shopping cost is to use the calculator API from the shipping provider, given this can be used with no or very low cost for order verification. If the shipping provider's API is not available or feasible for verification purpose, then we should build the calculator as close as the observed behavior of the shipping provider's calculation.