// generate swagger component
/**
 * @swagger
 * components:
 *   schemas:
 *     OrderSubmissionResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: number
 *           description: Unique identifier for the submitted order
 *           example: 12345
 */
export interface OrderSubmissionResponse {
  orderId: number;
}
