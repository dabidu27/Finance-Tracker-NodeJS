import express from 'express';
import 'dotenv/config';
import transactionRoutes from './routes/transactionRoutes.js';
import authRoutes from './routes/authRoutes.js';
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

//we will use the following request flow
//1. Request hits the backend
//2. Every request that has /api/transactions goes through transactionRoutes
//3. Depending on the request, transactionRoutes runs a specific callback function

app.use('/api/transactions', transactionRoutes); //this represents step 2
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is alive on port ${PORT}`);
})

