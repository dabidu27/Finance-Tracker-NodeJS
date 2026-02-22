import { pool } from '../db.js';

export const getTransactions = async (req, res) => {

    try {
        const userId = req.user.id; //getCurrentUser middleware attaches userId to the request
        const query = 'SELECT * from transactions where user_id = $1 order by transaction_date desc'; //add ownership later, after adding JWT auth
        const result = await pool.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Database error: ${error}`);
        res.status(400).json({ 'message': 'Failed to fetch transactions' });
    }
}

export const addTransaction = async (req, res) => {

    try {

        const { description, amount, category, is_expense } = req.body; //destructuring the body into 3 variables
        //equivalent to:
        //description = req.body.description, amount = req.body.amount etc.
        const userId = req.user.id; //getCurrentUser middleware attaches userId to the request
        const query = 'insert into transactions (user_id, description, amount, category, is_expense) values ($1, $2, $3, $4, $5) returning *';
        //returning * means the query returns to use the row it just inserted after the insertion is finished, so we can send it back in the response
        const values = [userId, description, amount, category, is_expense];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);
        res.status(400).json({ 'message': 'Failed to add transaction' });
    }
}


export const editTransaction = async (req, res) => {

    try {

        const { description, amount, category, is_expense } = req.body;
        const userId = req.user.id;
        const transactionId = Number(req.params.id);

        const query = 'update transactions set description = $1, amount = $2, category = $3, is_expense = $4 where user_id = $5 and id = $6 returning *';
        const values = [description, amount, category, is_expense, userId, transactionId];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to edit transaction' });
    }
}

export const deleteTransaction = async (req, res) => {

    try {

        const transactionId = Number(req.params.id);
        const userId = req.user.id;

        const query = 'delete from transactions where user_id = $1 and id = $2 returning *';
        const result = await pool.query(query, [userId, transactionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {

        console.error(error);
        res.status(400).json({ message: 'Failed to delete transaction' });
    }
}