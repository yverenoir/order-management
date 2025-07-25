import * as dataProvider from "../db/data.provider";
import { Inventory } from "./inventory";

/** Retrieves the inventory for a specific device by its ID
 * @param deviceId
 * @return A promise that resolves to an array of Inventory objects
 */
export async function fetchInventoryForDevice(
  deviceId: number,
): Promise<Inventory[]> {
  const stocks = await dataProvider.getStocksByDeviceId(deviceId);
  return await Promise.all(
    stocks.map(async (stock) => {
      // TODO: change business logic so we don't have to call DB multiple times inside loop
      const warehouse = await dataProvider.getWarehouseById(stock.warehouseId);

      return {
        deviceId: stock.deviceId,
        unit: stock.unit,
        warehouseId: stock.warehouseId,
        warehouseName: warehouse?.name ?? "Unknown",
        warehouseCoordinate: {
          latitude: warehouse?.latitude ?? 0,
          longitude: warehouse?.longitude ?? 0,
        },
      };
    }),
  );
}
