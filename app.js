const express = require('express')
const app = express()
const { Client } = require('pg');

const DATABASE_HOST='ep-broad-mud-a1d8bq9s.ap-southeast-1.pg.koyeb.app';
const DATABASE_USER='ftechadmin';
const DATABASE_PASSWORD='LNZix9TwBkQ3';
const DATABASE_NAME='koyebdb';

const port = process.env.PORT || 3000;
var client = new Client({
	user: DATABASE_USER,
	password: DATABASE_PASSWORD,
	host: DATABASE_HOST,
	port: 5432,
	database: DATABASE_NAME,
});

client.connect().then(() => {
		console.log('Connected to PostgreSQL database');
	}).catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
	});

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!: port running: '+port ,
    postgres:client
  })
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
