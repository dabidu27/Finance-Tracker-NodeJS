import express from 'express';
import { loginUser, registerUser, sendForgetPasswordCode, setNewPassword } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot_password_code', sendForgetPasswordCode);
router.post('/reset_password', setNewPassword);

export default router