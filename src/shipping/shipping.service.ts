import {AllocatedOrder} from "../allocation/allocatedOrder";

export const SHIPPING_COST_PER_KG_PER_KM = 0.01;

export function calculateShippingCost(allocatedOrder: AllocatedOrder, deviceWeightInGram: number): number {
    // if the location is the same, we still want to charge shipping cost due to the weight
    // round up to the next integer value, e.g. 0.05km counts as 1km
    const distanceInKm = Math.max(1, Math.ceil(allocatedOrder.distanceToCustomer));
    // calculating total weight before the weight is being round up, e.g. 0.365*5=1.825 (no rounding) instead of 1*5=5 (single unit weight rounded up before, yielding wrong total weight)
    // round up to the next integer value, e.g. 0.05kg counts as 1kg
    const deviceWeightInKg = deviceWeightInGram / 1000; // convert grams to kg
    const weightInKg = Math.max(1, Math.ceil(allocatedOrder.unitsTakenFromWarehouse * deviceWeightInKg));

    const shippingCost = weightInKg * distanceInKm * SHIPPING_COST_PER_KG_PER_KM;
    console.log(`[Shipping Service] Shipping cost for ${weightInKg}kg over ${distanceInKm}km: $${shippingCost.toFixed(2)}`);
    return shippingCost;
}