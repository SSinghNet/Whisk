import { Router } from "express";
import { getDBHealth } from "../controllers/dbController.js";

const router = Router();

router.get("/health", getDBHealth);

export default router;