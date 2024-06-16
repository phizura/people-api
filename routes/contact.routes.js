import express from "express";
import {
  listConnectionNames,
  getContact,
  createContact,
  updateContact,
} from "../controllers/contact.controller.js";
import authRoute from "../middleware/protectRoute.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10,
});

router.get("/contacts", authRoute, listConnectionNames);
router.get("/contact/:id", authRoute, getContact);
router.post("/contact/create", authRoute, limiter, createContact);
router.post("/contact/update", authRoute, limiter, updateContact);

export default router;
