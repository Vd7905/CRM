import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import {
  generateCampaignContent,
  generateCustomerInsights,
} from "../controllers/cohereAI.controller.js";

const router = Router();

router
  .route("/generate-campaign-content")
  .post(authenticate, generateCampaignContent);
router
  .route("/generate-customer-insights")
  .post(authenticate, generateCustomerInsights);

export default router;