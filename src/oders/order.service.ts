import { AllocationService } from "./allocation.service";
import { DisCountService } from "./discount.service";
import { DistanceProvider } from "./distance.service";
import { InventoryService } from "./inventory.service";
import { OrderRequest } from "./orderRequest";
import { OrderVerificationResponse } from "./orderVerificationResponse";
import * as dataProvider from './data.provider';

const inventoryService = new InventoryService();
const distanceProvider = new DistanceProvider();
const allocationService = new AllocationService();
const discountService = new DisCountService();

export class OrderService {
    constructor(/* inject DB, logger */) {}

    /*
    * We can optimise for lowest shipping cost when we optimise for getting the maximum amount of stock from the closest warehouse
    */
  verifyOrder(order: OrderRequest): OrderVerificationResponse {
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalShipping = 0;
    console.log('[OrderService] order' + JSON.stringify(order.deviceOrders));

    // Iterate over all device orders
    order.deviceOrders.forEach(deviceOrder => {
        // Get device information
        // TODO: handle null case
        const device = dataProvider.getDeviceById(deviceOrder.deviceIdentifier);
        console.log('[OrderService] device: ' + device);
        const unitPrice = device?.price ?? 0;
        const totalDevicePriceWithoutDiscount = unitPrice * deviceOrder.deviceCount;
        console.log('[OrderService] Total without discount: ' + totalDevicePriceWithoutDiscount);

        const deviceWeight = device?.weightInGram ?? 0;
        console.log('[OrderService] Device weight: ' + deviceWeight);

        // Fetch list of warehouses having this order item
        const inventory = inventoryService.fetchInventoryForDevice(deviceOrder.deviceIdentifier);
        // Sort warehouses by shortest distance
        // This works because we have a limited, small amount of warehouses and calculating the distance is not expensive either, if any of the conditions change, we need to change this mechanism
        // TODO: extract sorting logic to allocation service and write tests
        const sourceCoordinate = {latitude: order.shippingAddress.coordinate.latitude, longitude: order.shippingAddress.coordinate.longitude}
        const inventoryByDistance = inventory.map(inventory => {
            const destinationCoordinate = {latitude: inventory.warehouseCoordinate.latitude, longitude: inventory.warehouseCoordinate.longitude}
            const distance = distanceProvider.getDistanceInKm(sourceCoordinate, destinationCoordinate);
            return {
                distanceInKm: distance,
                unit: inventory.unit
            }
        });
        console.log('[OrderService] distance: ' + JSON.stringify(inventoryByDistance));
        const sortedFromClosestToFurthest = inventoryByDistance.sort((a,b) => a.distanceInKm-b.distanceInKm);
        console.log('[OrderService] sortedFromClosestToFurthest: ' + JSON.stringify(sortedFromClosestToFurthest));
        // Select cheapest possible combination by selecting the closest warehouse first and going to the second closest warehouse etc.
        // For each warehouse, get maximum amount and take note of (distance to warehouse, how many units)
        // TODO: Need to add weight of device into this!!!
        const fulfilledUnit = allocationService.allocateUnits(sortedFromClosestToFurthest, deviceOrder.deviceCount, deviceWeight/1000);
        console.log('[OrderService] fulfilledUnit: ' + JSON.stringify(fulfilledUnit));

        // Calculate possible discounts
        const priceAfterDiscount = discountService.applyDiscount(deviceOrder, unitPrice);
        console.log('[OrderService] Total after discount: ' + priceAfterDiscount);

        // Calculate shipping costs
        // TODO separate concerns between allocation and shipment cost, create shipping cost service
        const totalShippingCost = fulfilledUnit.reduce((sum, entry) => sum + entry.shippingCost, 0);
        console.log('[OrderService] Shipping: ' + totalShippingCost);
        
        // Add individual device item order to total order
        totalPrice += priceAfterDiscount + totalShippingCost;
        totalDiscount += totalDevicePriceWithoutDiscount - priceAfterDiscount;
        totalShipping += totalShippingCost;
    }
    );
    
    // Order validity check
    const thresholdForShipping = (totalPrice - totalDiscount) * 0.15;
    const isValid = totalShipping <= thresholdForShipping ? true : false;

    return {
        totalPrice: this.roundUp(totalPrice),
        discount: this.roundUp(totalDiscount),
        shippingCost: this.roundUp(totalShipping),
        currency: "USD",
        isValid: isValid
    };
  }

  roundUp(num: number) {
    return Math.ceil(num * 100) / 100;
  }
  
}