const express = require('express')
const fs = require('fs')
const path = require('path');
const app = express();
const { Client } = require('pg');
const { Pool } = require('pg');
//import postgres from 'postgres'
var server = require("http").Server(app);
var io = require("socket.io")(server);
app.use(express.static(__dirname + '/public'));
// cau hinh database 
const sqlite3 = require('sqlite3').verbose();
// Mở kết nối đến cơ sở dữ liệu SQLite
const dbPath = path.resolve(__dirname, 'sensor_data.db');
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Đã kết nối tới cơ sở dữ liệu SQLite.');
});
//Tạo bảng để lưu trữ dữ liệu nhiệt độ và độ ẩm
function CreateTable(machineserial){
	db.run(`CREATE TABLE IF NOT EXISTS sensor_data_${machineserial} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL,
        humidity REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log(`Đã tạo bảng sensor_data_${machineserial}`);
});
}
// Hàm để ghi dữ liệu vào bảng
function insertData(machineserial,temperature, humidity) {
  db.run(`INSERT INTO sensor_data_${machineserial}(temperature, humidity) VALUES(?, ?)`, [ temperature, humidity], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Đã chèn một hàng với ID: ${this.lastID}`);
  });
}

// Hàm để đọc dữ liệu từ bảng
function readData(machineserial) {
  db.all(`SELECT * FROM sensor_data_${machineserial}`, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(`${row.id}: ${row.temperature}°C, ${row.humidity}%, ${row.timestamp}`);
    });
  });
}

/*setInterval(function () {
	// Returns a random integer from 0 to 99:
	let temp = Math.floor(Math.random() * 30);
	let humi = Math.floor(Math.random() * 100);
	pool.query('INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2) RETURNING *' , [temp, humi] );
	
	}, 60000);
 */
CreateTable("5555");
const port = process.env.PORT || 3000;

app.get('/data', (req, res) => {
  pool.query('SELECT * FROM sensor_data').then((data)=>{
	   res.json(data.rows);
  })
})

app.get('/insertdata', (req, res) => {
	 console.log(req.query);
	let machineserial = req.query.machineserial ;
    	let temperature = parseInt(req.query.temperature) ;
    	let humidity 	= parseInt(req.query.humidity) ; 
	if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    		return res.status(400).json({ error: 'Temperature and humidity must be numbers' });
  	}
	pool.query('INSERT INTO sensor_data (machineserial,temperature, humidity) VALUES ($1, $2) RETURNING *',[machineserial,temperature, humidity]).then((result)=>{
		res.status(201).json(result.rows[0]);
	  })
})

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
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

//app.listen(port, () => {
server.listen(port, () => { 
  console.log(`App is listening on port ${port}`);
});
//});
