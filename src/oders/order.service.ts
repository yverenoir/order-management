import { OrderRequest } from "./orderRequest";
import { OrderVerificationResponse } from "./orderVerificationResponse";

export class OrderService {
    constructor(/* inject DB, logger */) {}

  verifyOrder(order: OrderRequest): OrderVerificationResponse {
    // 
    
    return {
        totalPrice: 100,
        discount: 0,
        shippingCost: 20,
        currency: "USD",
        isValid: true
    };
  }
}

interface Device {
    id: number,
    name: string,
    weightInGram: number,
    price: number,
    currency: string
}

const devices: Device[] = [
    { id: 1, name: 'SCOS Station P1 Pro', weightInGram: 365, currency: "USD", price: 150 },
  ];

interface Discount {
    id: number,
    deviceId: number,
    type: number,
    unit: number,
    discount: number
}

const discounts: Discount[] = [
    {id: 1, deviceId: 1, type: 1, unit: 25, discount: 5},
    {id: 2, deviceId: 1, type: 1, unit: 50, discount: 10},
    {id: 3, deviceId: 1, type: 1, unit: 100, discount: 15},
    {id: 4, deviceId: 1, type: 1, unit: 250, discount: 20}
]

interface Stock {
    id: number,
    deviceId: number,
    unit: number,
    warehouseId: number
}

const stocks: Stock[] = [
    {id: 1, deviceId: 1, unit: 355, warehouseId: 1},
    {id: 2, deviceId: 1, unit: 578, warehouseId: 2},
    {id: 3, deviceId: 1, unit: 265, warehouseId: 3},
    {id: 4, deviceId: 1, unit: 694, warehouseId: 4},
    {id: 5, deviceId: 1, unit: 245, warehouseId: 5},
    {id: 6, deviceId: 1, unit: 419, warehouseId: 6},
]

interface Warehouse {
    id: number,
    name: string,
    latitude: number,
    longitude: number
}

const warehouses: Warehouse[] = [
    {id: 1, name: "Los Angeles", latitude: 33.9425, longitude: -118.408056},
    {id: 2, name: "New York", latitude: 40.639722, longitude: -73.778889},
    {id: 3, name: "Sao Paulo", latitude: -23.435556, longitude: -46.473056},
    {id: 4, name: "Paris", latitude: 49.009722, longitude: 2.547778},
    {id: 5, name: "Warsaw", latitude: 52.165833, longitude: 20.967222},
    {id: 6, name: "Hong Kong", latitude: 22.308889, longitude: 113.914444},
]