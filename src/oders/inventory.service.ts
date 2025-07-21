import { Coordinate } from "./distance.provider";

export class InventoryService {
    fetchInventoryForDevice(deviceId: number): Inventory[] {
        // TODO: need to fetch this from DB

        stocks.filter(stock => stock.deviceId == deviceId);

        const inventories = stocks
        .filter((stock) => stock.deviceId === deviceId)
        .map((stock) => {
            const warehouse = warehouses.find(w => w.id === stock.warehouseId);
            // TODO: better handling when warehouse couldn't be found
            return {
            deviceId: stock.deviceId,
            unit: stock.unit,
            warehouseId: stock.warehouseId,
            warehouseName: warehouse?.name ?? 'Unknown',
            warehouseCoordinate: {latitude: warehouse?.latitude ?? 0, longitude: warehouse?.longitude ?? 0}
            };
        });

        console.log('[Inventory Service] fetchInventoryForDevice: ' + inventories);
        
        return inventories;
    }
}

interface Inventory {
    deviceId: number,
    unit: number,
    warehouseId: number,
    warehouseName: string,
    warehouseCoordinate: Coordinate
}

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