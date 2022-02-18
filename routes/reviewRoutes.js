import express from 'express';
import { accessTo, protect } from '../controllers/authController.js';
import {
  createReviews,
  getAllReviews,
} from '../controllers/reviewController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, accessTo('user'), createReviews);

export default router;
