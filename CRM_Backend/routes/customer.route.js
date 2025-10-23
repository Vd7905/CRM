import { Router } from "express";
import express from "express";
import multer from "multer";
import authenticate from "../middleware/auth.middleware.js";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomer,
  getCustomers,
  updateCustomer,
  insertCustomers
} from "../controllers/customer.controller.js";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/insert-customers", upload.single("file"), insertCustomers);
router.route("/create").post(createCustomer);
router.route("/").get(getCustomers);
router.route("/get").get(getAllCustomers);
router.route("/:id").get(getCustomer);
router.route("/:id").put(updateCustomer);
router.route("/:id").delete(deleteCustomer);

export default router;