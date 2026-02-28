
import { createAccessToken, hashPassword, verifyPassword } from "../utils/auth.js";
import Joi from 'joi';
import { pool } from '../db.js';
import nodemailer from 'nodemailer';

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const registerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const loginUser = async (req, res) => {

    try {
        const { error, value: user } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const username = user.username
        const password = user.password

        const query = 'select id, password_hash from users where username = $1';
        const result = await pool.query(query, [username]);
        if (result.rows.length == 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const hashedPassword = result.rows[0].password_hash;
        const isMatch = await verifyPassword(password, hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userId = result.rows[0].id
        const token = await createAccessToken({ sub: userId });

        res.status(200).json({ access_token: token, 'token_type': 'bearer' });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

export const registerUser = async (req, res) => {

    try {

        const { error, value: userData } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { username, email, password } = userData;
        const hashedPassword = await hashPassword(password);
        const query = 'insert into users (username, email, password_hash) values ($1, $2, $3) returning id, username, email';
        const result = await pool.query(query, [username, email, hashedPassword]);
        return res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error("Registration error:", error);
        if (error.code === '23505') { //postgre code for unique constraint violation

            return res.status(400).json({ message: "Username or email already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }

}

export const sendForgetPasswordCode = async (req, res) => {

    try {

        const { email } = req.body;
        //check if email exists

        const emailQuery = 'select id from users where email = $1';
        const emailQueryResult = await pool.query(emailQuery, [email]);
        if (emailQueryResult.rows.length == 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        //generate a code of 6 random digits
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

        //make the expiry time 15 minutes from when the code is generated
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);

        const updateCodeQuery = 'update users set reset_code = $1, reset_code_exp = $2 where email = $3 returning *';
        const updateCodeQueryResult = await pool.query(updateCodeQuery, [resetCode, expirationTime, email]);
        if (updateCodeQueryResult.rows.length == 0) {
            return res.status(400).json({ message: 'Error with the code' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Finance Tracker Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Password Reset Code',
            text: `You requested a password reset. Your 6-digit code is: ${resetCode}. It will expire in 15 minutes.`,
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested a password reset. Your 6-digit code is:</p>
                <h1 style="letter-spacing: 5px; color: #2ecc71;">${resetCode}</h1>
                <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Reset password code was sent" });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

export const setNewPassword = async (req, res) => {

    try {

        const { email, code, newPassword } = req.body;

        let query = 'select reset_code, reset_code_exp from users where email = $1';
        const ResetCodeResult = await pool.query(query, [email]);
        if (ResetCodeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        if (code !== ResetCodeResult.rows[0].reset_code) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        const expiryTime = ResetCodeResult.rows[0].reset_code_exp;
        const now = new Date();
        const expired = expiryTime < now ? true : false;
        if (expired === true) {
            return res.status(400).json({ message: 'Reset password code is expired' });
        }

        const newPasswordHash = await hashPassword(newPassword);
        query = 'update users set password_hash = $1, reset_code = NULL, reset_code_exp = NULL where email = $2 returning *';
        const result = await pool.query(query, [newPasswordHash, email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Failed to update password' });
        }

        res.status(200).json({ message: 'Password updated' });
    } catch (error) {

        console.error("Reset password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}