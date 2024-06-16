import express from 'express';
import { authorize } from '../controllers/auth.controller.js'

const router = express.Router();

router.get('/signup', authorize);

export default router;