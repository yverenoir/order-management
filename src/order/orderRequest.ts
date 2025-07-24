import { Coordinate } from "../shipping/shippingAddress";

export interface DeviceOrder {
  deviceIdentifier: number;
  deviceCount: number;
}

// This can be extended to exclude the actual address of the customer
export interface ShippingAddress {
  coordinate: Coordinate;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderRequest:
 *       type: object
 *       properties:
 *         deviceOrders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               deviceIdentifier:
 *                 type: number
 *                 description: Unique identifier for the device
 *                 example: 1
 *               deviceCount:
 *                 type: number
 *                 description: Number of devices ordered
 *                 example: 2
 *         shippingAddress:
 *           type: object
 *           properties:
 *             coordinate:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   description: Latitude of the shipping address
 *                   example: 49.009722
 *                 longitude:
 *                   type: number
 *                   description: Longitude of the shipping address
 *                   example: 2.547778
 */
export interface OrderRequest {
  deviceOrders: DeviceOrder[];
  shippingAddress: ShippingAddress;
}
