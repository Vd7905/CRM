import express from "express";
import { predictChurn } from "../controllers/churn.controller.js";

const router = express.Router();

// POST endpoint
router.post("/predict", predictChurn);

export default router;
