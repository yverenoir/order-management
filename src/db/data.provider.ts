import {Discount} from "../discount/discount";
import * as dbClient from "./db.client";
import {Warehouse} from "../inventory/warehouse";
import {Stock} from "../inventory/stock";
import {Device} from "../inventory/device";

export async function getStocksByDeviceId(id: number): Promise<Stock[]> {
    // return stocks.filter((stock) => stock.deviceId === id);
    const stocks = await dbClient.getStocksByDeviceId(id);
    if (!stocks) throw new Error("[Data Provider] Could not fetch stocks from database");

    return stocks.map(stock => {
        if (
            stock.unit == null ||
            stock.deviceId == null ||
            stock.warehouseId == null
        ) {
            throw new Error("[Data Provider] Stock object contains null fields");
        }
        return {
            id: stock.id,
            deviceId: stock.deviceId,
            warehouseId: stock.warehouseId,
            unit: stock.unit
        }});
}

export async function reduceStock(warehouseId: number, updatedStockUnits: number, deviceId: number) {
    const updatedStock = await dbClient.updateStock(warehouseId, updatedStockUnits, deviceId);

    if (!updatedStock) {
        throw new Error("[Data Provider] Could not update stock in database");
    }
    return;
}

export async function getWarehouseById(id: number): Promise<Warehouse> {
    const warehouse = await dbClient.getWarehouseById(id);
    if (!warehouse) throw new Error("[Data Provider] Could not fetch warehouse from database");

    if (
        warehouse.name == null ||
        warehouse.latitude == null ||
        warehouse.longitude == null
    ) {
        throw new Error("[Data Provider] Device object contains null fields");
    }

    return {
        id: warehouse.id,
        name: warehouse.name,
        latitude: warehouse.latitude,
        longitude: warehouse.longitude
    };
}

export async function getDeviceById(id: number): Promise<Device> {
    const device = await dbClient.getDeviceById(id);
    if (!device) throw new Error("[Data Provider] Could not fetch device from database");

    if (
        device.name == null ||
        device.weightInGram == null ||
        device.price == null ||
        device.currency == null
    ) {
        throw new Error("[Data Provider] Device object contains null fields");
    }

    return {
        id: device.id,
        name: device.name,
        weightInGram: device.weightInGram,
        price: device.price,
        currency: device.currency
    };
}

export async function getDiscountsByDeviceId(id: number): Promise<Discount[]> {
    const discounts = await dbClient.getDiscountByDeviceId(id);
    if (!discounts) throw new Error("[Data Provider] Could not fetch discounts from database");

    return discounts.map(discount => {
        if (
            discount.deviceId == null ||
            discount.type == null ||
            discount.minimumQuantity == null ||
            discount.discount == null
        ) {
            throw new Error("[Data Provider] Discount object contains null fields");
        }
        return {
        id: discount.id,
        deviceId: discount.deviceId,
        type: discount.type,
        minimumQuantity: discount.minimumQuantity,
        discount: discount.discount
    }});
}

export async function addOrder(totalPrice: number, discount: number, shippingCost: number): Promise<number> {
    const id = await dbClient.addOrder(totalPrice, discount, shippingCost);

    if (!id) {
        throw new Error("[Data Provider] Could not add order to database");
    }

    return id;
}
