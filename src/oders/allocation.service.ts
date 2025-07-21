type WarehouseSupply = {
    unit: number;
    distanceInKm: number;
  };
  
  type FulfilledUnit = {
    numberTakenFromWarehouse: number;
    distanceToCustomer: number;
    shippingCost: number;
  };

export class AllocationService {
    /*
    * Allocates units from warehouse by prioritising taking maximum needed and available stock from closest warehouse before moving to the next closest warehouse
    */
      allocateUnits(
        sortedUnits: WarehouseSupply[],
        quantityNeeded: number,
        deviceWeightInKg: number,
        rate: number = 0.01
      ): FulfilledUnit[] {
        const result: FulfilledUnit[] = [];
        let remaining = quantityNeeded;
      
        for (const warehouse of sortedUnits) {
          if (remaining <= 0) break;
      
          const take = Math.min(warehouse.unit, remaining);
          console.log('[Allocation Service] allocateUnits: take: ' + take);
          // if the location is the same, we still want to charge shipping cost due to the weight
          // round up to the next integer value, e.g. 0.05km counts as 1km
          const normalisedDistance = Math.ceil(warehouse.distanceInKm) == 0 ? 1 : Math.ceil(warehouse.distanceInKm);
          // calculating total weight before the weight is being round up, e.g. 0.365*5=1.825 (no rounding) instead of 1*5=5 (single unit weight rounded up before, yielding wrong total weight)
          const weightOfAllDevices = take * deviceWeightInKg;
          // round up to the next integer value, e.g. 0.05kg counts as 1kg
          const normalisedWeight = Math.ceil(weightOfAllDevices) == 0 ? 1 : Math.ceil(weightOfAllDevices);
          const shippingCost = normalisedWeight * normalisedDistance * rate;
          console.log('[Allocation Service] allocateUnits: deviceWeightInKg: ' + normalisedWeight);
          console.log('[Allocation Service] allocateUnits: distance: ' + normalisedDistance);
          console.log('[Allocation Service] allocateUnits: shippingCost: ' + shippingCost);
      
          result.push({
            numberTakenFromWarehouse: take,
            distanceToCustomer: warehouse.distanceInKm,
            shippingCost: shippingCost
          });
      
          remaining -= take;
        }
      
        return result;
      }
}