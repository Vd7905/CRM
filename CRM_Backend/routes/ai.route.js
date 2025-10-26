import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import {
  generateCampaignContent,
} from "../controllers/cohereAI.controller.js";

const router = Router();

router
  .route("/generate-campaign-content")
  .post(authenticate, generateCampaignContent);
export default router;