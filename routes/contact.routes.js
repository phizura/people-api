import express from "express";
import {
  listConnectionNames,
  getContact,
  createContact,
  updateContact,
} from "../controllers/contact.controller.js";
import { protectCreate, protectUpdate } from "../middleware/protectRoute.js";
import rateLimit from "express-rate-limit";
import apicache from 'apicache';

const router = express.Router();
let cache = apicache.middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10,
});

router.get("/", cache('30 second'), listConnectionNames);
router.get("/:id", cache('30 second'), getContact);
router.post("/create", protectCreate, limiter, createContact);
router.post("/update", protectUpdate, limiter, updateContact);

export default router;
