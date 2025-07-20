export interface DeviceOrder {
    deviceIdentifier: string;
    deviceCount: number;
  }

export interface ShippingAddress {
    latitude: number;
    longitude: number;
  }

 export interface OrderRequest {
    deviceOrders: DeviceOrder[];
    shippingAddress: ShippingAddress;
  }