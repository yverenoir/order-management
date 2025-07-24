/** @swagger
 * components:
 *   schemas:
 *     OrderVerificationResponse:
 *       type: object
 *       properties:
 *         totalPrice:
 *           type: number
 *           description: Total price of the order after discounts and shipping costs
 *           example: 150.01
 *         discount:
 *           type: number
 *           description: Total discount applied to the order
 *           example: 20.00
 *         shippingCost:
 *           type: number
 *           description: Total shipping cost for the order
 *           example: 0.01
 *         currency:
 *           type: string
 *           description: Currency of the order
 *           example: "USD"
 *         isValid:
 *           type: boolean
 *           description: Indicates whether the order is valid based on shipping costs
 *           example: true
 */
export interface OrderVerificationResponse {
  totalPrice: number;
  discount: number;
  shippingCost: number;
  currency: string;
  isValid: boolean;
}
