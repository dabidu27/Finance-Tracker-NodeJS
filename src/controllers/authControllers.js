
import { createAccessToken, hashPassword, verifyPassword } from "../utils/auth.js";
import Joi from 'joi';
import { pool } from '../db.js';

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const registerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required(),
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

            return res.status(409).json({ message: "Username or email already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }

}