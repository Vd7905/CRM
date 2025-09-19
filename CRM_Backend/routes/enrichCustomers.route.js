import express from "express";
import {enrichCustomers} from "../controllers/enrichCustomers.controller.js";

const router = express.Router();

// POST endpoint
router.post("/analyse", enrichCustomers);

export default router;
