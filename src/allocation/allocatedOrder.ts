export interface AllocatedOrder {
  stockUnits: number;
  unitsTakenFromWarehouse: number;
  distanceToCustomer: number;
  warehouseId: number;
  deviceId: number;
}
