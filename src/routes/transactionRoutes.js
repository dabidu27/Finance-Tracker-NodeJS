import express from 'express';

import { getTransactions, addTransaction } from '../controllers/transactionController';

const router = express.router();
router.get('/', getTransactions); //when the base url is hit with a get request, the getTransactions callback function runs
router.post('/', addTransaction); //when the base url is hit with a post request, the addTransaction callback function runs

export default router; //this is not a named export