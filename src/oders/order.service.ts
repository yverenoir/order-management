import {AllocatedOrder, allocate} from "./allocation.service";
import {applyDiscount} from "./discount.service";
import {DeviceOrder, OrderRequest} from "./orderRequest";
import {OrderVerificationResponse} from "./orderVerificationResponse";
import * as dataProvider from './data.provider';
import {calculateShippingCost} from "./shipping.service";
import {OrderSubmissionResponse} from "./orderSubmissionResponse";
import {roundUp} from "../common/utils";

interface OrderPriceSummary {
    totalPrice: number;
    totalDiscount: number;
    totalShipping: number;
    allocatedOrders: AllocatedOrder[];
}

interface DeviceOrderPriceSummary {
    priceAfterDiscount: number,
    totalDevicePriceWithoutDiscount: number,
    totalShippingCost: number,
    allocatedOrder: AllocatedOrder[]
}

/** verifyOrder verifies the order and returns the total price, discount, shipping cost, and whether the order is valid.
 * @param order: OrderRequest containing device orders and shipping address.
 * returns OrderVerificationResponse containing total price, discount, shipping cost, currency, and validity of the order.
 */
  export function verifyOrder(order: OrderRequest): OrderVerificationResponse {
    const {totalPrice, totalDiscount, totalShipping} = getOrderPrices(order);

    // Order validity check
      const isValid = isOrderValid(totalPrice, totalDiscount, totalShipping);

      return {
        totalPrice: roundUp(totalPrice),
        discount: roundUp(totalDiscount),
        shippingCost: roundUp(totalShipping),
        currency: "USD",
        isValid
    };
  }

    function isOrderValid(totalPrice: number, totalDiscount: number, totalShipping: number) {
        const thresholdForShipping = (totalPrice - totalDiscount) * 0.15;
        return totalShipping <= thresholdForShipping;
    }

    function getOrderPrices(order: OrderRequest): OrderPriceSummary {
        let totalPrice = 0;
        let totalDiscount = 0;
        let totalShipping = 0;
        const allocatedOrders: AllocatedOrder[] = [];
        console.log('[OrderService] order' + JSON.stringify(order.deviceOrders));

        // Iterate over all device orders
        order.deviceOrders.forEach(deviceOrder => {
                const {
                    priceAfterDiscount,
                    totalDevicePriceWithoutDiscount,
                    totalShippingCost,
                    allocatedOrder
                }: DeviceOrderPriceSummary = processDeviceOrder(order, deviceOrder);

                // Add individual device item order to total order
                totalPrice += priceAfterDiscount + totalShippingCost;
                totalDiscount += totalDevicePriceWithoutDiscount - priceAfterDiscount;
                totalShipping += totalShippingCost;
                allocatedOrders.push(...allocatedOrder)
            }
        );
        return {totalPrice, totalDiscount, totalShipping, allocatedOrders};
    }

    function processDeviceOrder(order: OrderRequest, deviceOrder: DeviceOrder): DeviceOrderPriceSummary {
      // Get device information
      // TODO: handle null case
      const device = dataProvider.getDeviceById(deviceOrder.deviceIdentifier);
      console.log('[OrderService] device: ' + device);
      const unitPrice = device?.price ?? 0;
      const totalDevicePriceWithoutDiscount = unitPrice * deviceOrder.deviceCount;
      console.log('[OrderService] Total without discount: ' + totalDevicePriceWithoutDiscount);
      const deviceWeightInGram = device?.weightInGram ?? 0;
      console.log('[OrderService] Device weight: ' + deviceWeightInGram);

      // Fetch list of warehouses having this order item
        // TODO: refactor so we don't need the entire order object here
      const allocatedOrder: AllocatedOrder[] = allocate(order, deviceOrder);

      // Calculate possible discounts
      const priceAfterDiscount = applyDiscount(deviceOrder, unitPrice);
      console.log('[OrderService] Total after discount: ' + priceAfterDiscount);

      // Calculate shipping costs
      const totalShippingCost = allocatedOrder.reduce((sum, allocatedOrder) =>
          sum + calculateShippingCost(allocatedOrder, deviceWeightInGram), 0);
      console.log('[OrderService] Shipping: ' + totalShippingCost);

      return {
          priceAfterDiscount,
          totalDevicePriceWithoutDiscount,
          totalShippingCost,
          allocatedOrder
      };
  }

/** Processes the order and returns the order ID.
 * This function verifies the order, calculates the total price, discount, and shipping cost, saves the order to the database,
 * and reduces the stock in warehouses.
 * @param order: OrderRequest containing device orders and shipping address.
 * @returns OrderSubmissionResponse containing the order ID.
 */
export function submitOrder(order: OrderRequest): OrderSubmissionResponse {
        // Verify, get allocation and prices
      const {totalPrice, totalDiscount, totalShipping, allocatedOrders} : OrderPriceSummary = getOrderPrices(order);

      // Reject request if order is not valid
      if (!isOrderValid(totalPrice, totalDiscount, totalShipping)) {
          throw new Error("Order is not valid: shipping cost exceeds 15% of the total price after discount.");
      }

      // TODO: This should be a transaction, so that if one of the steps fails, we can roll back
      // Reduce stock in warehouses
        allocatedOrders.forEach(allocatedOrder => {
            dataProvider.reduceStock(allocatedOrder.warehouseId, allocatedOrder.numberTakenFromWarehouse);
        });
        // Add order to the database
      const orderId = dataProvider.addOrder(totalPrice, totalDiscount, totalShipping);

      return {
          orderId: orderId
      };
  }
