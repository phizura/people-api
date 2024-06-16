import express from "express";
import {
  listConnectionNames,
  getContact,
  createContact,
  updateContact,
} from "../controllers/contact.controller.js";
import { protectCreate, protectUpdate } from "../middleware/protectRoute.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10,
});

router.get("/", listConnectionNames);
router.get("/:id", getContact);
router.post("/create", protectCreate, limiter, createContact);
router.post("/update", protectUpdate, limiter, updateContact);

export default router;
