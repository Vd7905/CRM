import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
const app = express();
dotenv.config();
// methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : []; // fallback empty array if not set

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import customerRouter from "./routes/customer.route.js";
import orderRouter from "./routes/order.route.js";
import AIRouter from "./routes/ai.route.js";
import globalErrorHandler from "./middleware/errorhandler.middleware.js";
import churnRouter from "./routes/churn.route.js"
import recommendRouter from "./routes/recommendation.route.js"
import enrichRouter from "./routes/enrichCustomers.route.js"
// routes declaration
app.use("/api/auth", authRouter);
app.use("/api/churn", churnRouter);
app.use("/api/recommendations", recommendRouter)
app.use("/api/enrich", enrichRouter)
app.use("/api/user", userRouter);
app.use("/api/customer", customerRouter);
app.use("/api/order", orderRouter);
app.use("/api/ai", AIRouter);
// https://localhost:8000/api/v1/users/xyz

app.use(globalErrorHandler);

export { app };