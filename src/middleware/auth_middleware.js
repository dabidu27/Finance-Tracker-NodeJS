//in express, middleware sits between the route and the controller
//its job is to verify the JWT before offering access to the DB

import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

export const getCurrentUser = async (req, res, next) => {

    const authHeader = req.headers.authorization; //extract authorization header from request - it contains the phrase Bearer TOKEN, where Token is the JWT which we have to validate
    if (!authHeader || !authHeader.startsWith('Bearer ')) { //if the request does not have authorization header or it has a wrong format (no Bearer word)

        //the validation fails
        return res.status(401).json({ message: "Could not validate credentials", headers: { 'WWW-Authenticate': 'Bearer' } });
    }

    const token = authHeader.split(' ')[1]; //we split the phrase Bearer TOKEN by space and extract the JWT

    try {
        const payload = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        const userId = payload.sub
        if (!userId) {
            return res.status(401).json({ message: 'Could not validate credentials' });
        }

        const query = 'select id, username from users where id = $1'
        const result = await pool.query(query, [userId])
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Could not validate credentials' });
        }

        //attach the user data to the request, because the request will be passed further to the controller (because of the next parameter)
        req.user = { id: result.rows[0].id, username: result.rows[0].username };

        //call next() so request moves to the controller
        next();

    } catch (error) {
        console.error("JWT Verification failed:", error.message);
        return res.status(401).json({ message: "Could not validate credentials" });
    }

}