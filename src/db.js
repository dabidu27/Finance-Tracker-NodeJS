import pg from 'pg';
import 'dotenv/config';

//pg is the driver for node.js <-> sql communication
const { Pool } = pg; //this means "look into the pg object, find the Pool property, and pool it into it s own variable" <=> const Pool = pg.Pool
export const pool = new Pool({ connectionString: process.env.DBURL }); //we instantiate an object of the Pool class
//a pool is a connection with more workers for speed and crash prevention