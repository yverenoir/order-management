import { AllocatedOrder } from "../allocation/allocatedOrder";

export const SHIPPING_COST_PER_KG_PER_KM = 0.01;

/** Calculate shipping cost based on device weight and distance to customer based on the formula:
 * Shipping cost = weight in kg * distance in km * 0.01
 * @param allocatedOrder
 * @param deviceWeightInGram
 * @return Shipping cost in USD
 */
export function calculateShippingCost(
  allocatedOrder: AllocatedOrder,
  deviceWeightInGram: number,
): number {
  // if the location is the same, we still want to charge shipping cost due to the weight
  // round up to the next integer value, e.g. 0.05km counts as 1km
  const distanceInKm = Math.max(
    1,
    Math.ceil(allocatedOrder.distanceToCustomer),
  );
  // calculating total weight before the weight is being round up, e.g. 0.365*5=1.825 (no rounding) instead of 1*5=5 (single unit weight rounded up before, yielding wrong total weight)
  // round up to the next integer value, e.g. 0.05kg counts as 1kg
  const deviceWeightInKg = deviceWeightInGram / 1000; // convert grams to kg
  const weightInKg = Math.max(
    1,
    Math.ceil(allocatedOrder.unitsTakenFromWarehouse * deviceWeightInKg),
  );

  return weightInKg * distanceInKm * SHIPPING_COST_PER_KG_PER_KM;
}
