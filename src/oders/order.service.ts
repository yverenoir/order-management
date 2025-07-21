import {AllocatedOrder, AllocationService} from "./allocation.service";
import {DisCountService} from "./discount.service";
import {DeviceOrder, OrderRequest} from "./orderRequest";
import {OrderVerificationResponse} from "./orderVerificationResponse";
import * as dataProvider from './data.provider';
import {calculateShippingCost} from "./shipping.service";
import {OrderSubmissionResponse} from "./orderSubmissionResponse";

const allocationService = new AllocationService();
const discountService = new DisCountService();

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

export class OrderService {
    constructor(/* inject DB, logger */) {}

    /*
    * We can optimise for lowest shipping cost when we optimise for getting the maximum amount of stock from the closest warehouse
    */
  verifyOrder(order: OrderRequest): OrderVerificationResponse {
    const {totalPrice, totalDiscount, totalShipping} = this.getOrderPrices(order);

    // Order validity check
      const isValid = this.isOrderValid(totalPrice, totalDiscount, totalShipping);

      return {
        totalPrice: this.roundUp(totalPrice),
        discount: this.roundUp(totalDiscount),
        shippingCost: this.roundUp(totalShipping),
        currency: "USD",
        isValid
    };
  }

    private isOrderValid(totalPrice: number, totalDiscount: number, totalShipping: number) {
        const thresholdForShipping = (totalPrice - totalDiscount) * 0.15;
        return totalShipping <= thresholdForShipping;
    }

    private getOrderPrices(order: OrderRequest): OrderPriceSummary {
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
                }: DeviceOrderPriceSummary = this.processDeviceOrder(order, deviceOrder);

                // Add individual device item order to total order
                totalPrice += priceAfterDiscount + totalShippingCost;
                totalDiscount += totalDevicePriceWithoutDiscount - priceAfterDiscount;
                totalShipping += totalShippingCost;
                allocatedOrders.push(...allocatedOrder)
            }
        );
        return {totalPrice, totalDiscount, totalShipping, allocatedOrders};
    }

    private processDeviceOrder(order: OrderRequest, deviceOrder: DeviceOrder): DeviceOrderPriceSummary {
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
      const allocatedOrder: AllocatedOrder[] = allocationService.allocate(order, deviceOrder, deviceWeightInGram);

      // Calculate possible discounts
      const priceAfterDiscount = discountService.applyDiscount(deviceOrder, unitPrice);
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

  submitOrder(order: OrderRequest): OrderSubmissionResponse {
        // Verify, get allocation and prices
      const {totalPrice, totalDiscount, totalShipping, allocatedOrders} : OrderPriceSummary = this.getOrderPrices(order);

      // Reject request if order is not valid
      if (!this.isOrderValid(totalPrice, totalDiscount, totalShipping)) {
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

  roundUp(num: number) {
    return Math.ceil(num * 100) / 100;
  }
  
}