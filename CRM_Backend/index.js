// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/db.js";

import { app } from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8002, () => {
      console.log(`Running server successfully at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connnecrtion failed !!", err);
  });