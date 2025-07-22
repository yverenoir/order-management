import * as inventoryService from './inventory.service';
import * as distanceService from './distance.service';
import {DeviceOrder, OrderRequest} from "./orderRequest";
import {Inventory} from "./inventory.service";
import {Coordinate} from "./distance.service";

interface WarehouseSupplyWithDistance {
    unit: number;
    distanceInKm: number;
    warehouseId: number;
  };
  
export interface AllocatedOrder {
    numberTakenFromWarehouse: number;
    distanceToCustomer: number;
    warehouseId: number;
  };

    /**
     * Allocates order items from warehouses based on distance to customer and available stock.
     * @param order - The order request containing shipping address and device order details.
     * @param deviceOrder - The device order containing device identifier and count.
     * @returns An array of allocated orders with details on how many items were taken from each warehouse, distance to customer, and shipping cost.
     */
  export function allocate(order: OrderRequest, deviceOrder: DeviceOrder): AllocatedOrder[] {
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
    const allocatedOrders : AllocatedOrder[] = allocateUnits(sortedFromClosestToFurthest, deviceOrder.deviceCount);
    console.log('[OrderService] allocatedOrders: ' + JSON.stringify(allocatedOrders));

    return allocatedOrders;
  }

  /**
   * Allocates units from sorted warehouses based on the quantity needed and device weight.
   * Allocates units from warehouse by prioritising taking maximum needed and available stock from the closest warehouse
   * before moving to the next closest warehouse.
   * @param sortedUnits
   * @param quantityNeeded
   * @return An array of allocated orders with details on how many items were taken from each warehouse, distance to customer, and shipping cost.
   */
    function allocateUnits(
      sortedUnits: WarehouseSupplyWithDistance[],
      quantityNeeded: number
    ): AllocatedOrder[] {
      const result: AllocatedOrder[] = [];
      let remaining = quantityNeeded;

      // Assumes that sortedUnits is already sorted by distance from closest to furthest, otherwise this will break
      for (const warehouse of sortedUnits) {
        if (remaining <= 0) break;

        const take = Math.min(warehouse.unit, remaining);
        console.log('[Allocation Service] allocateUnits: take: ' + take);

        result.push({
          numberTakenFromWarehouse: take,
          distanceToCustomer: warehouse.distanceInKm,
          warehouseId: warehouse.warehouseId
        });

        remaining -= take;
      }

      return result;
    }