import { Router } from "express";
import { getDBHealth } from "../controllers/dbController.js";

const router = Router();

/**
 * @openapi
 * /db/health:
 *   get:
 *     summary: Check database health
 *     tags:
 *       - Database
 *     responses:
 *       200:
 *         description: Database is connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 db:
 *                   type: string
 *                   example: connected
 *       500:
 *         description: Database connection failed
 */
router.get("/health", getDBHealth);

export default router;