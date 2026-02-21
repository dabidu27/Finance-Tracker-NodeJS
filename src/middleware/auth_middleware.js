//in express, middleware sits between the route and the controller
//its job is to verify the JWT before offering access to the DB

import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

export const getCurrentUser = async (req, res, next) => {

    const authHeader = req.headers.authorization; //extract authorization header from request - it contains the phrase Bearer TOKEN, where Token is the JWT which we have to validate
    if (!authHeader || !authHeader.startsWith('Bearer ')) { //if the request does not have authorization header or it has a wrong format (no Bearer word)
        //the authorization header is created (passed) manually in the requests send from the frontend
        //EX: const response = await fetch('http://localhost:5000/api/transactions', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //          this is how the frontend passes the token:
        //         'Authorization': `Bearer ${token}` 
        //     }
        // });

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
        //it works like the Depends in FastAPI; before calling a function for an API endpoint, we get the currentUser so we can verify ownership
        //ex: a user can only get his own transactions, so we have to get his userId (or username)
        //extracting userId is done by decoding the JWT token, because the JWT token is obtained from userId + ACCESS_SECRET_KEY
        next();

    } catch (error) {
        console.error("JWT Verification failed:", error.message);
        return res.status(401).json({ message: "Could not validate credentials" });
    }

}