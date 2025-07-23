import { Coordinate } from "../shipping/shippingAddress";

export interface Inventory {
  deviceId: number;
  unit: number;
  warehouseId: number;
  warehouseName: string;
  warehouseCoordinate: Coordinate;
}
