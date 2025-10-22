import express from "express";
import {enrichCustomers} from "../controllers/enrichCustomers.controller.js";
import { enrichAllCustomers } from "../controllers/enrichAllCustomers.controller.js";

const router = express.Router();

// POST endpoint
router.post("/analyse", enrichCustomers);
router.post("/analyse-all",enrichAllCustomers);

export default router;
