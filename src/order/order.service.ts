import { allocate } from "../allocation/allocation.service";
import { applyDiscount } from "../discount/discount.service";
import { DeviceOrder, OrderRequest } from "./orderRequest";
import { OrderVerificationResponse } from "./orderVerificationResponse";
import * as dataProvider from "../db/data.provider";
import { calculateShippingCost } from "../shipping/shipping.service";
import { OrderSubmissionResponse } from "./orderSubmissionResponse";
import { roundUp } from "../common/utils";
import { AllocatedOrder } from "../allocation/allocatedOrder";

interface OrderPriceSummary {
  totalPrice: number;
  totalDiscount: number;
  totalShipping: number;
  allocatedOrders: AllocatedOrder[];
}

interface DeviceOrderPriceSummary {
  priceAfterDiscount: number;
  totalDevicePriceWithoutDiscount: number;
  totalShippingCost: number;
  allocatedOrder: AllocatedOrder[];
}

/** verifyOrder verifies the order and returns the total price, discount, shipping cost, and whether the order is valid.
 * returns OrderVerificationResponse containing total price, discount, shipping cost, currency, and validity of the order.
 * @param order: OrderRequest containing device orders and shipping address.
 */
export async function verifyOrder(
  order: OrderRequest,
): Promise<OrderVerificationResponse> {
  const { totalPrice, totalDiscount, totalShipping } =
    await getOrderPrices(order);

  // Order validity check
  const isValid = isOrderValid(totalPrice, totalDiscount, totalShipping);

  return {
    totalPrice: roundUp(totalPrice),
    discount: roundUp(totalDiscount),
    shippingCost: roundUp(totalShipping),
    currency: "USD",
    isValid,
  };
}

function isOrderValid(
  totalPrice: number,
  totalDiscount: number,
  totalShipping: number,
) {
  const thresholdForShipping = (totalPrice - totalDiscount) * 0.15;
  return totalShipping <= thresholdForShipping;
}

async function getOrderPrices(order: OrderRequest): Promise<OrderPriceSummary> {
  let totalPrice = 0;
  let totalDiscount = 0;
  let totalShipping = 0;
  const allocatedOrders: AllocatedOrder[] = [];
  console.log("[OrderService] order" + JSON.stringify(order.deviceOrders));

  // Iterate over all device orders
  for (const deviceOrder of order.deviceOrders) {
    const {
      priceAfterDiscount,
      totalDevicePriceWithoutDiscount,
      totalShippingCost,
      allocatedOrder,
    }: DeviceOrderPriceSummary = await processDeviceOrder(order, deviceOrder);

    // Add individual device item order to total order
    totalPrice += priceAfterDiscount + totalShippingCost;
    totalDiscount += totalDevicePriceWithoutDiscount - priceAfterDiscount;
    totalShipping += totalShippingCost;
    allocatedOrders.push(...allocatedOrder);
  }
  return { totalPrice, totalDiscount, totalShipping, allocatedOrders };
}

async function processDeviceOrder(
  order: OrderRequest,
  deviceOrder: DeviceOrder,
): Promise<DeviceOrderPriceSummary> {
  // Get device information
  const device = await dataProvider.getDeviceById(deviceOrder.deviceIdentifier);
  console.log("[OrderService] device: " + device);
  const unitPrice = device?.price ?? 0;
  const totalDevicePriceWithoutDiscount = unitPrice * deviceOrder.deviceCount;
  console.log(
    "[OrderService] Total without discount: " + totalDevicePriceWithoutDiscount,
  );
  const deviceWeightInGram = device?.weightInGram ?? 0;
  console.log("[OrderService] Device weight: " + deviceWeightInGram);

  // Fetch list of warehouses having this order item
  // TODO: refactor so we don't need the entire order object here
  const allocatedOrder: AllocatedOrder[] = await allocate(order, deviceOrder);

  // Calculate possible discounts
  const priceAfterDiscount = await applyDiscount(deviceOrder, unitPrice);
  console.log("[OrderService] Total after discount: " + priceAfterDiscount);

  // Calculate shipping costs
  const totalShippingCost = allocatedOrder.reduce(
    (sum, allocatedOrder) =>
      sum + calculateShippingCost(allocatedOrder, deviceWeightInGram),
    0,
  );
  console.log("[OrderService] Shipping: " + totalShippingCost);

  return {
    priceAfterDiscount,
    totalDevicePriceWithoutDiscount,
    totalShippingCost,
    allocatedOrder,
  };
}

/** Processes the order and returns the order ID.
 * This function verifies the order, calculates the total price, discount, and shipping cost, saves the order to the database,
 * and reduces the stock in warehouses.
 * @returns OrderSubmissionResponse containing the order ID.
 * @param order : OrderRequest containing device orders and shipping address.
 */
export async function submitOrder(
  order: OrderRequest,
): Promise<OrderSubmissionResponse> {
  // Verify, get allocation and prices
  const {
    totalPrice,
    totalDiscount,
    totalShipping,
    allocatedOrders,
  }: OrderPriceSummary = await getOrderPrices(order);

  // Reject request if order is not valid
  if (!isOrderValid(totalPrice, totalDiscount, totalShipping)) {
    throw new Error(
      "Order is not valid: shipping cost exceeds 15% of the total price after discount.",
    );
  }

  // TODO: This should be a transaction, so that if one of the steps fails, we can roll back
  // Reduce stock in warehouses
  for (const allocatedOrder of allocatedOrders) {
    await dataProvider.updateStock(
      allocatedOrder.warehouseId,
      allocatedOrder.stockUnits - allocatedOrder.unitsTakenFromWarehouse,
      allocatedOrder.deviceId,
    );
  }
  // Add order to the database
  const orderId = await dataProvider.addOrder(
    totalPrice,
    totalDiscount,
    totalShipping,
  );

  return {
    orderId: orderId,
  };
}
