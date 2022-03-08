import express from 'express';
import { accessTo, protect } from '../controllers/authController.js';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTopTours,
  getTourStats,
  getMonthlyPlan,
} from '../controllers/tourController.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

// This is bit confusing to use review controller in tour routes so using express we can just use this as a mini app. and trigger review routes whenever hit that url.
// router.route('/:tourId/reviews').post(protect, accessTo('user'), createReviews)

router.use('/:tourId/reviews', reviewRoutes); // But Still this reviewRoutes dont have access to "tourID" params. To have this access we'll go to review routes and pass "mergeParams" to the router.

// BEFORE MERGING PARAMS : /:tourId/reviews <----not connected-----> /:reviewId
// AFTER MERGING PARAMS : /:tourId/reviews <----connected-----> /:reviewId  [now reviewRoutes can access all the previous params in the url]

// router.param('id', checkId);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, accessTo('admin', 'guide'), getMonthlyPlan);
router.route('/top-5-tours').get(getTopTours, getAllTours);
router
  .route('/')
  .get(getAllTours)
  .post(protect, accessTo('admin', 'guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, accessTo('admin', 'guide'), updateTour)
  .delete(protect, accessTo('admin', 'guide'), deleteTour);

export default router;
