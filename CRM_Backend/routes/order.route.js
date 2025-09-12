import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";

import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.route("/create").post(createOrder);
router.route("/").get(getOrders);
router.route("/:id").get(getOrder);
router.route("/:id").put(updateOrder);
router.route("/:id").delete(deleteOrder);

export default router;