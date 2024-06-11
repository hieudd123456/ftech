const express = require('express')
const app = express()
//const { Client } = require('pg');
import postgres from 'postgres'

const DATABASE_HOST='ep-broad-mud-a1d8bq9s.ap-southeast-1.pg.koyeb.app';
const DATABASE_USER='ftechadmin';
const DATABASE_PASSWORD='LNZix9TwBkQ3';
const DATABASE_NAME='koyebdb';

const sql = postgres({
  host: DATABASE_HOST,
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  ssl: 'require',
})

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!: port running: '+port ,
    postgres:sql
  })
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
