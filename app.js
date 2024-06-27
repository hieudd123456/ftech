const express = require('express')
const app = express();
const { Client } = require('pg');
const { Pool } = require('pg');
//import postgres from 'postgres'

const DATABASE_HOST='ep-broad-mud-a1d8bq9s.ap-southeast-1.pg.koyeb.app';
const DATABASE_USER='ftechadmin';
const DATABASE_PASSWORD='LNZix9TwBkQ3';
const DATABASE_NAME='koyebdb';

/*const client = new Client({
	user: DATABASE_USER,
	password: DATABASE_PASSWORD,
	host: DATABASE_HOST,
	port: 5432,
	database: DATABASE_NAME,
	ssl: true
});
*/
const pool = new Pool({
  	user: DATABASE_USER,
	password: DATABASE_PASSWORD,
	host: DATABASE_HOST,
	port: 5432,
	database: DATABASE_NAME,
	ssl: true
});
// const sql = postgres({
//  host: DATABASE_HOST,
//  database: DATABASE_NAME,
//  username: DATABASE_USER,
//  password: DATABASE_PASSWORD,
//  ssl: 'require',
// })
/*client.connect().then(() => {
		console.log('Connected to PostgreSQL database');
	}).catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
	});
 */

setInterval(function () {
	// Returns a random integer from 0 to 99:
	let temp = Math.floor(Math.random() * 30);
	let humi = Math.floor(Math.random() * 100);	
}, 5000);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!: H port running:  '+port,
    pool:pool
})})


app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
  const result = await pool.query( 'CREATE TABLE sensor_data ( id SERIAL PRIMARY KEY, temperature REAL NOT NULL, humidity REAL NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);' );
  console.log(result);
})
