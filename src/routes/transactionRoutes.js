import express from 'express';

import { getTransactions, addTransaction, editTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { getCurrentUser } from '../middleware/auth_middleware.js';

const router = express.Router();
router.get('/', getCurrentUser, getTransactions); //when the base url is hit with a get request, the getCurrentUser function runs and attaches userId to the request (to req.user), and then the getTransactions callback function runs
router.post('/', getCurrentUser, addTransaction); //when the base url is hit with a post request, the getCurrentUser function runs, we get the userId to the request (to req.user), and then the addTransaction callback function runs
router.put('/:id', getCurrentUser, editTransaction);
router.delete('/:id', getCurrentUser, deleteTransaction);

export default router; //this is not a named export