const express = require('express')
const fs = require('fs')
const app = express();
const { Client } = require('pg');
const { Pool } = require('pg');
//import postgres from 'postgres'
var server = require("http").Server(app);
var io = require("socket.io")(server);
app.use(express.static(__dirname + '/public'));
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
	pool.query('INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2) RETURNING *' , [temp, humi] );
	}, 60000);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  pool.query('SELECT * FROM sensor_data').then((data)=>{
	   res.json(data.rows);
  })
 
})
app.get('/home', (req, res) => {
    var html = fs.readFileSync('./public/index.html', 'utf8')
    res.render('test', { html: html })
    // or res.send(html)
 
})
app.post('/api/data', async (req, res) => {
  const { temperature, humidity } = req.body;
  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return res.status(400).json({ error: 'Temperature and humidity must be numbers' });
  }
  try {
    pool.query('INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2) RETURNING *',[temperature, humidity])
	  then((result)=>{
		res.status(201).json(result.rows[0]);
	  })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

io.on('connection', (socket) => {
    console.log('New connection')
    socket.on('data',(data)=>{
        console.log(`Clent gui`,data);
       io.emit('data',data);
    });
     socket.on('disconnect', () => console.log('Client disconnected'));
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
})
