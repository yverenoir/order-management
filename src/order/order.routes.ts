import express from "express";
import { verifyOrder, submitOrder } from "./order.controller";

const router = express.Router();

/**
 * @swagger
 * /orders/verify:
 *   post:
 *     summary: Verify an order
 *     description: This endpoint verifies an order based on the provided order details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       200:
 *         description: Order verification response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderVerificationResponse'
 */
router.post("/verify", verifyOrder);

/**
 * @swagger
 * /orders/submit:
 *   post:
 *     summary: Submit an order
 *     description: This endpoint submits an order based on the provided order details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       200:
 *         description: Order submission response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderSubmissionResponse'
 */
router.post("/submit", submitOrder);

export default router;
