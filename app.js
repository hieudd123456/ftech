const express = require('express')
const app = express();
const { Client } = require('pg');
//import postgres from 'postgres'

const DATABASE_HOST='ep-broad-mud-a1d8bq9s.ap-southeast-1.pg.koyeb.app';
const DATABASE_USER='ftechadmin';
const DATABASE_PASSWORD='LNZix9TwBkQ3';
const DATABASE_NAME='koyebdb';

const client = new Client({
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
client.connect().then(() => {
		console.log('Connected to PostgreSQL database');
	}).catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
	});

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!: H port running:  '+port,
    sql:client
})})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
