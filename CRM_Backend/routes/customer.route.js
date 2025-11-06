import { Router } from "express";
import express from "express";
import multer from "multer";
import authenticate from "../middleware/auth.middleware.js";
import {
  getAllCustomers,
  insertCustomers,
} from "../controllers/customer.controller.js";


const router = Router();

const upload = multer({ dest: "uploads/" });
router.post("/insert-customers", upload.single("file"), authenticate, insertCustomers);
router.route("/get").get(getAllCustomers);

export default router;