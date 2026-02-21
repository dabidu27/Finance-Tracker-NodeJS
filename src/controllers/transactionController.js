import { pool } from '../db.js';

export const getTransactions = async (req, res) => {

    try {
        const query = 'SELECT * from transactions order by transaction_date desc'; //add ownership later, after adding JWT auth
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Database error: ${error}`);
        res.status(400).json({ 'message': 'Failed to fetch transactions' });
    }
}