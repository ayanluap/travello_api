import express from 'express';
import {
  accessTo,
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
  updatePassword,
} from '../controllers/authController.js';
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateMe,
  updateUser,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);

router.route('/me').get(protect, getMe, getUser);
router.route('/updatePassword').patch(protect, updatePassword);
router.route('/updateMe').patch(protect, updateMe);
router.route('/deleteMe').delete(protect, deleteMe);

router.route('/').get(protect, accessTo('admin'), getAllUsers);
router
  .route('/:id')
  .get(protect, accessTo('admin'), getUser)
  .patch(protect, accessTo('admin'), updateUser)
  .delete(protect, accessTo('admin'), deleteUser);

export default router;
