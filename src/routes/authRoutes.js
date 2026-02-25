import express from 'express';
import { loginUser, registerUser, sendForgetPasswordCode } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot_password_code', sendForgetPasswordCode)

export default router