import express from 'express';
import { accessTo, protect } from '../controllers/authController.js';
import {
  createReviews,
  deleteReview,
  getAllReviews,
  getReview,
  updateReview,
} from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });
// BEFORE MERGING PARAMS : /:tourId/reviews <----not connected-----> /:reviewId
// AFTER MERGING PARAMS : /:tourId/reviews <----connected-----> /:reviewId  [now reviewRoutes can access all the previous params in the url]

router.use(protect);

router.route('/').get(getAllReviews).post(accessTo('user'), createReviews);
router
  .route('/:id')
  .get(getReview)
  .delete(accessTo('user', 'admin'), deleteReview)
  .patch(accessTo('user', 'admin'), updateReview);

export default router;
