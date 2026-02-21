//jwt auth

import bcrypt from 'bcrypt'; //for password hashing
import jwt from 'jsonwebtoken'; //for jwt tokens
import 'dotenv/config';

const ACCESS_EXPIRY_TIME = '1d';

export const hashPassword = async (password) => {

    const saltRounds = 10; //standard security level for bcrypt
    return await bcrypt(password, saltRounds);
}

export const verifyPassword = async (hashedPassword) => {

    return await bcrypt.compare(password, hashedPassword);
}

export const createAccessToken = async (data) => {

    // a JWT token is usually composed of 2 elements: sub - subject, who the token is about; our subject will be the user_id, passed thorugh data as a string
    // and exp - expire_date, when the token expires
    if (!data.sub) {
        throw new Error("Token payload must include sub");
    }

    return jwt.sign(data, process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_EXPIRY_TIME });
}