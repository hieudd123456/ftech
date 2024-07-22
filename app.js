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
function insertData(machineserial,temperature, humidity,callback=null) {
	try {
    db.run(`INSERT INTO sensor_data_${machineserial}(temperature, humidity) VALUES(?, ?)`, [ temperature, humidity], function(err) {
    if (err) {
	    callback(false);
    }
    console.log(`Đã chèn một hàng với ID: ${this.lastID} ${temperature} ${humidity}`);
	if(callback){
		 callback(true);
	  }
  });
  } catch (err) {
	callback(false);	
  }
}
// lấy danh sách các bảng
function GetListTable(callback) {
 try {
  db.serialize(function () {
    db.all("select name from sqlite_master where type='table'", function (err, tables) {
        console.log("GetListTable: ",tables);
	    callback(tables);	
    });
});
  } catch (err) {
	callback([]);	
  }
}

// Hàm để đọc dữ liệu từ bảng
function readData(machineserial,callback) {
try {
	GetListTable((listtb)=>{
		if(listtb && (listtb.length>0) && ( listtb.findIndex(x=>x.name==`sensor_data_${machineserial}`) >= 0) )
		{
		db.all(`SELECT * FROM sensor_data_${machineserial}`, [], (err, rows) => {
    			if (err) {
     				callback([]);
    			}else{
				callback(rows) 
			}
  		});
		} else {
			callback([]);
		}
	})

} catch (err) {
	callback(false);	
  }
}
/**
 * Ham lấy dữ liệu từ ngày
 * @param {*} machineserial 
 * @param {*} fromDate 
 * @param {*} callback 
 */
function readDatabyDate(machineserial,fromDate,callback) {
	try {
		GetListTable((listtb)=>{
			if(listtb && (listtb.length>0) && ( listtb.findIndex(x=>x.name==`sensor_data_${machineserial}`) >= 0) )
			{
				let fDate = new Date();
				fDate = toTimestamp(fromDate);
				if(!fDate) fDate = new Date();
				
				let sfromDate = `${fDate.getFullYear()}-${(fDate.getMonth()+1).toString().padStart(2, '0')}-${fDate.getDate().toString().padStart(2, '0')}`
				console.log("lay du lieu tu ngay: "+ sfromDate);
			db.all(`SELECT * FROM sensor_data_${machineserial}  WHERE timestamp > '${sfromDate} 00:00:00' `, [], (err, rows) => {
					if (err) {
						 callback([]);
					}else{
					callback(rows) 
				}
			  });
			} else {
				callback([]);
			}
		})
	
	} catch (err) {
		callback(false);	
	  }
	}

	function toTimestamp(strDate){
		var datum = Date.parse(strDate);
		return datum/1000;
	 }
/*setInterval(function () {
	// Returns a random integer from 0 to 99:
	let temp = Math.floor(Math.random() * 30);
	let humi = Math.floor(Math.random() * 100);
	pool.query('INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2) RETURNING *' , [temp, humi] );
	
	}, 60000);
 */

CreateTable("5555");
CreateTable("4444");
const port = process.env.PORT || 3000;

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  API: LAY VE DU LIEU   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//http://localhost:3000/data?machineserial=5555
app.get('/data', (req, res) => {
	let machineserial = req.query.machineserial ;
    	
	if (!machineserial) {
    		machineserial="5555";
  	}
 	readData(machineserial, (data)=>{
		res.status(201).json(data);
	})
})

app.get('/datadate', (req, res) => {
	let machineserial = req.query.machineserial ;
	let fromDate = req.query.fromdate ;
    	
	if (!machineserial) {
    		machineserial="5555";
  	}
	let fdate = toTimestamp(fromDate) || new Date();

 	readDatabyDate(machineserial,toTimestamp(fdate), (data)=>{
		res.status(201).json(data);
	})
})
/**
 * Lấy danh sách các bảng
 */
app.get('/listtable', (req, res) => {
	GetListTable((listtb)=>{
		res.status(201).json(listtb);
	});
});

app.get('/listtable', (req, res) => {
	GetListTable((listtb)=>{
		res.status(201).json(listtb);
	});
});

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  API: THEM DU LIEU   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
app.get('/insertdata', (req, res) => {
	 console.log("request",req.query);
	let machineserial = req.query.machineserial ;
    	let temperature = parseFloat(req.query.temperature) ;
    	let humidity 	= parseFloat(req.query.humidity) ; 
	if (!machineserial || typeof temperature !== 'number' || typeof humidity !== 'number') {
    		return res.status(400).json({ error: 'machineserial, Temperature and humidity must be numbers' });
  	}
	insertData(machineserial,temperature, humidity,function(isSuccess){
		res.status(201).json(isSuccess);
	});
})

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
})


// app.post('/api/data', async (req, res) => {
//   const { temperature, humidity } = req.body;
//   if (typeof temperature !== 'number' || typeof humidity !== 'number') {
//     return res.status(400).json({ error: 'Temperature and humidity must be numbers' });
//   }
//   try {
//     pool.query('INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2) RETURNING *',[temperature, humidity])
// 	  then((result)=>{
// 		res.status(201).json(result.rows[0]);
// 	  })
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

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
