import { DeviceService } from "./device.service";
import { DeviceOrder } from "./orderRequest";

const deviceService = new DeviceService();

// TODO
// Test cases
// 1. Highest possible discount is applied
// 2. No discount applied

export class DisCountService {
    applyDiscount(deviceOrder: DeviceOrder, originalUnitPrice: number): number {
        var totalPriceWithoutDiscount = originalUnitPrice * deviceOrder.deviceCount;
        console.log('[DiscountService] applyDiscount: totalPriceWithoutDiscount: ' + totalPriceWithoutDiscount);

        const discountsForThisDevice = discounts.filter(discount => discount.deviceId==deviceOrder.deviceIdentifier);
        console.log('[DiscountService] applyDiscount: discountsForThisDevice: ' + JSON.stringify(discountsForThisDevice));
        const discountsEligibleForOrderQuantity = discountsForThisDevice.filter(discount => discount.minimumQuantity<=deviceOrder.deviceCount);
        console.log('[DiscountService] applyDiscount: discountsEligibleForOrderQuantity: ' + JSON.stringify(discountsEligibleForOrderQuantity));
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
            }, new Map<number, Discount>())
          ).map(([_, discount]) => discount);
        
          console.log('[DiscountService] applyDiscount: highestDiscountPerType: ' + JSON.stringify(highestDiscountPerType));


        var totalPriceAfterDiscount = totalPriceWithoutDiscount;
        highestDiscountPerType.forEach(element => {
            switch(element.type) {
                case 1: 
                    totalPriceAfterDiscount = totalPriceWithoutDiscount * (1-(element.discount/100));
                    console.log('[DiscountService] applyDiscount: priceAfterDiscount: ' + JSON.stringify(element.discount));
                    console.log('[DiscountService] applyDiscount: priceAfterDiscount: ' + JSON.stringify(totalPriceAfterDiscount));
                    break;
                default: throw new Error("Cannot find discount type" + element.type);
            }
        });


        return Math.min(totalPriceWithoutDiscount, totalPriceAfterDiscount);
    }
}

interface Discount {
    id: number,
    deviceId: number,
    type: number,
    minimumQuantity: number,
    discount: number
}

const discounts: Discount[] = [
    {id: 1, deviceId: 1, type: 1, minimumQuantity: 25, discount: 5},
    {id: 2, deviceId: 1, type: 1, minimumQuantity: 50, discount: 10},
    {id: 3, deviceId: 1, type: 1, minimumQuantity: 100, discount: 15},
    {id: 4, deviceId: 1, type: 1, minimumQuantity: 250, discount: 20}
]