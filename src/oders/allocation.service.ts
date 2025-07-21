import * as inventoryService from './inventory.service';
import * as distanceService from './distance.service';
import {DeviceOrder, OrderRequest} from "./orderRequest";
import {Inventory} from "./inventory.service";
import {Coordinate} from "./distance.service";

type WarehouseSupplyWithDistance = {
    unit: number;
    distanceInKm: number;
    warehouseId: number;
  };
  
export type AllocatedOrder = {
    numberTakenFromWarehouse: number;
    distanceToCustomer: number;
    // shippingCost: number;
    warehouseId: number;
  };

export class AllocationService {
    /**
     * Allocates order items from warehouses based on distance to customer and available stock.
     * @param order - The order request containing shipping address and device order details.
     * @param deviceOrder - The device order containing device identifier and count.
     * @param deviceWeight - The weight of the device in grams.
     * @returns An array of allocated orders with details on how many items were taken from each warehouse, distance to customer, and shipping cost.
     */
  allocate(order: OrderRequest, deviceOrder: DeviceOrder, deviceWeight: number): AllocatedOrder[] {
    // Fetch list of warehouses having this order item
    const inventory: Inventory[] = inventoryService.fetchInventoryForDevice(deviceOrder.deviceIdentifier);

    // Calculate distance from warehouse to customer and sort warehouses by shortest distance to customer's shipping address
    const customerCoordinate: Coordinate = {latitude: order.shippingAddress.coordinate.latitude, longitude: order.shippingAddress.coordinate.longitude}
    const inventoryByDistance: WarehouseSupplyWithDistance[] = inventory.map(inventory => {
      const warehouseCoordinate: Coordinate = {latitude: inventory.warehouseCoordinate.latitude, longitude: inventory.warehouseCoordinate.longitude}
      const distance = distanceService.getDistanceInKm(customerCoordinate, warehouseCoordinate);
      return {
        distanceInKm: distance,
        unit: inventory.unit,
        warehouseId: inventory.warehouseId,
      }
    });
    console.log('[OrderService] distance: ' + JSON.stringify(inventoryByDistance));
    const sortedFromClosestToFurthest = inventoryByDistance.sort((a,b) => a.distanceInKm-b.distanceInKm);
    console.log('[OrderService] sortedFromClosestToFurthest: ' + JSON.stringify(sortedFromClosestToFurthest));

    // Select cheapest possible combination by selecting the closest warehouse first and going to the second-closest warehouse etc.
    // For each warehouse, allocate amount that is available in the warehouse, but not more than needed
    const deviceWeightInKg = deviceWeight / 1000; // convert grams to kg
    const allocatedOrders : AllocatedOrder[] = this.allocateUnits(sortedFromClosestToFurthest, deviceOrder.deviceCount, deviceWeightInKg);
    console.log('[OrderService] allocatedOrders: ' + JSON.stringify(allocatedOrders));

    return allocatedOrders;
  }

  /**
   * Allocates units from sorted warehouses based on the quantity needed and device weight.
   * Allocates units from warehouse by prioritising taking maximum needed and available stock from the closest warehouse
   * before moving to the next closest warehouse.
   * @param sortedUnits
   * @param quantityNeeded
   * @param deviceWeightInKg
   * @return An array of allocated orders with details on how many items were taken from each warehouse, distance to customer, and shipping cost.
   */
    private allocateUnits(
      sortedUnits: WarehouseSupplyWithDistance[],
      quantityNeeded: number,
      deviceWeightInKg: number
    ): AllocatedOrder[] {
      const result: AllocatedOrder[] = [];
      let remaining = quantityNeeded;

      // Assumes that sortedUnits is already sorted by distance from closest to furthest, otherwise this will break
      for (const warehouse of sortedUnits) {
        if (remaining <= 0) break;

        const take = Math.min(warehouse.unit, remaining);
        console.log('[Allocation Service] allocateUnits: take: ' + take);
        // // if the location is the same, we still want to charge shipping cost due to the weight
        // // round up to the next integer value, e.g. 0.05km counts as 1km
        // const normalisedDistance = Math.max(1, Math.ceil(warehouse.distanceInKm));
        // // calculating total weight before the weight is being round up, e.g. 0.365*5=1.825 (no rounding) instead of 1*5=5 (single unit weight rounded up before, yielding wrong total weight)
        // // round up to the next integer value, e.g. 0.05kg counts as 1kg
        // const normalisedWeight = Math.max(1, Math.ceil(take * deviceWeightInKg));
        // const shippingCost = normalisedWeight * normalisedDistance * SHIPPING_COST_PER_KG_PER_KM;
        // console.log('[Allocation Service] allocateUnits: deviceWeightInKg: ' + normalisedWeight);
        // console.log('[Allocation Service] allocateUnits: distance: ' + normalisedDistance);
        // console.log('[Allocation Service] allocateUnits: shippingCost: ' + shippingCost);

        result.push({
          numberTakenFromWarehouse: take,
          distanceToCustomer: warehouse.distanceInKm,
          // shippingCost: shippingCost,
          warehouseId: warehouse.warehouseId
        });

        remaining -= take;
      }

      return result;
    }
}