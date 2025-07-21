import { Coordinate } from "./distance.service";
import * as dataProvider from './data.provider'

export class InventoryService {
    fetchInventoryForDevice(deviceId: number): Inventory[] {
        const inventories = dataProvider.getStocksByDeviceId(deviceId)
        .map((stock) => {
            // TODO: change business logic so we don't have to call DB multiple times inside loop
            const warehouse = dataProvider.getWarehouseById(stock.warehouseId);
            
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