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

export interface Discount {
    id: number,
    deviceId: number,
    type: number,
    minimumQuantity: number,
    discount: number
}

const discounts: Discount[] = [
    {id: 1, deviceId: 1, type: 1, minimumQuantity: 25, discount: 5},
    {id: 2, deviceId: 1, type: 1, minimumQuantity: 50, discount: 10},
    {id: 3, deviceId: 1, type: 1, minimumQuantity: 100, discount: 15},
    {id: 4, deviceId: 1, type: 1, minimumQuantity: 250, discount: 20}
]

export function getStocksByDeviceId(id: number): Stock[] {
    return stocks.filter((stock) => stock.deviceId === id);
}

export function reduceStock(warehouseId: number, stockUnits: number) {
    // TODO: Implementation to reduce stock in the warehouse
}

export function getWarehouseById(id: number): Warehouse | null {
    // TODO: handle case when no warehouse found
    return warehouses.find(w => w.id === id) ?? null;
}

export function getDeviceById(id: number): Device | null {
    return devices.find(device => device.id == id) ?? null;
}

export function getDiscountsByDeviceId(id: number): Discount[] {
    return discounts.filter(discount => discount.deviceId == id);
}

export function addOrder(totalPrice: number, discount: number, shippingCost: number): number {
      // TODO: Implementation to add order to the database
    return 1;
}
