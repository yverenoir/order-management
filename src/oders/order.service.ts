import { InventoryService } from "./inventory.service";
import { OrderRequest } from "./orderRequest";
import { OrderVerificationResponse } from "./orderVerificationResponse";

const inventoryService = new InventoryService();

export class OrderService {
    constructor(/* inject DB, logger */) {}

  verifyOrder(order: OrderRequest): OrderVerificationResponse {
    // Fetch list of warehouses having this order item
    inventoryService.fetchInventoryForDevice();
    // Select cheapest possible combination by selecting the closest warehouse first and going to the second closest warehouse etc.
    // Calculate possible discounts
    // Calculate shipping costs
    // Order validity check
    
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