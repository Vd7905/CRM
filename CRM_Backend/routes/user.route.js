import { Router } from "express";
import {
  createCampaign,
  createSegment,
  estimateSegment,
  getCommuniactionLog,
  getUserCampaigns,
  getUserSegments,
  getSegmentCustomers,
} from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();
// Segment
//router.delete("/delete-all", deleteAllData);
router.route("/create-segment").post(authenticate, createSegment);
router.route("/get-segment").get(authenticate, getUserSegments);
router.route("/estimate-segment").post(authenticate, estimateSegment);
router.route("/get-all-customers/:segmentId").get(authenticate, getSegmentCustomers);
//Campaign
router.route("/create-campaign").post(authenticate, createCampaign);
// get all campaign specific to user, that he created
router.route("/get-campaign").get(authenticate, getUserCampaigns);

router.route("/get-log").get(authenticate, getCommuniactionLog);

export default router;