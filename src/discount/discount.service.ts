import { DeviceOrder } from "../order/orderRequest";
import * as dataProvider from "../db/data.provider";

import { Discount } from "./discount";

// TODO
// Test cases
// 1. Highest possible discount is applied
// 2. No discount applied

/** applyDiscount calculates the total price after applying the highest applicable discount for a device order.
 * @param deviceOrder
 * @param originalUnitPrice
 * @return The total price after applying the discount.
 */
export async function applyDiscount(
  deviceOrder: DeviceOrder,
  originalUnitPrice: number,
): Promise<number> {
  const totalPriceWithoutDiscount = originalUnitPrice * deviceOrder.deviceCount;

  const discountsForThisDevice = await dataProvider.getDiscountsByDeviceId(
    deviceOrder.deviceIdentifier,
  );

  const discountsEligibleForOrderQuantity = discountsForThisDevice.filter(
    (discount) => discount.minimumQuantity <= deviceOrder.deviceCount,
  );

  // Could not find applicable discount -> return not discounted total price
  if (discountsEligibleForOrderQuantity.length == 0) {
    return deviceOrder.deviceCount * originalUnitPrice;
  }
  const highestDiscountPerType = Array.from(
    discountsEligibleForOrderQuantity.reduce((map, discount) => {
      const existing = map.get(discount.type);
      if (!existing || discount.discount > existing.discount) {
        map.set(discount.type, discount);
      }
      return map;
    }, new Map<number, Discount>()),
  ).map(([_, discount]) => discount);

  let totalPriceAfterDiscount = totalPriceWithoutDiscount;
  highestDiscountPerType.forEach((element) => {
    switch (element.type) {
      case 1:
        totalPriceAfterDiscount =
          totalPriceWithoutDiscount * (1 - element.discount / 100);
        break;
      default:
        throw new Error("Cannot find discount type" + element.type);
    }
  });

  return Math.min(totalPriceWithoutDiscount, totalPriceAfterDiscount);
}
