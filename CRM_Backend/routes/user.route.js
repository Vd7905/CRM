import { Router } from "express";
import {
  createCampaign,
  createSegment,
  estimateSegment,
  getCommuniactionLog,
  getUserCampaigns,
  getUserSegments,
} from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

// Segment
router.route("/create-segment").post(authenticate, createSegment);
router.route("/get-segment").get(authenticate, getUserSegments);
router.route("/estimate-segment").post(authenticate, estimateSegment);

//Campaign
router.route("/create-campaign").post(authenticate, createCampaign);
// get capaign specific to user, that created
router.route("/get-campaign").get(authenticate, getUserCampaigns);

router.route("/get-log").get(authenticate, getCommuniactionLog);

export default router;