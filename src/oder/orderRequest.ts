import { Coordinate } from "../shipping/shippingAddress";

export interface DeviceOrder {
  deviceIdentifier: number;
  deviceCount: number;
}

// This can be extended to exclude the actual address of the customer
export interface ShippingAddress {
  coordinate: Coordinate;
}

export interface OrderRequest {
  deviceOrders: DeviceOrder[];
  shippingAddress: ShippingAddress;
}
