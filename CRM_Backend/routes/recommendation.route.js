import express from "express";
import { recommendations } from "../controllers/recommendation.controller.js";

const router = express.Router();

// POST endpoint
router.post("/recommend-customers", recommendations);

export default router;
