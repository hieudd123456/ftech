const express = require('express')
const fs = require('fs')
const multer = require('multer');
const path = require('path');
const app = express();
// const { Client } = require('pg');
// const { Pool } = require('pg');
//import postgres from 'postgres'
var server = require("http").Server(app);
var io = require("socket.io")(server);
const { MongoClient, ServerApiVersion } = require('mongodb');
// Cấu hình multer để lưu ảnh
const storage = multer.memoryStorage(); // Lưu ảnh vào bộ nhớ RAM
const upload = multer({ storage: storage });
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

// app.get('/datadate', (req, res) => {
// 	let machineserial = req.query.machineserial ;
// 	let fromDate = req.query.fromdate ;
    	
// 	if (!machineserial) {
//     		machineserial="5555";
//   	}
// 	let fdate = toTimestamp(fromDate) || new Date();

//  	readDatabyDate(machineserial,toTimestamp(fdate), (data)=>{
// 		res.status(201).json(data);
// 	})
// })
/**
 * Lấy danh sách các bảng
 */
// app.get('/listtable', (req, res) => {
// 	GetListTable((listtb)=>{
// 		res.status(201).json(listtb);
// 	});
// });


// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  API: THEM DU LIEU   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// app.get('/insertdata', (req, res) => {
// 	 console.log("request",req.query);
// 	let machineserial = req.query.machineserial ;
//     	let temperature = parseFloat(req.query.temperature) ;
//     	let humidity 	= parseFloat(req.query.humidity) ; 
// 	if (!machineserial || typeof temperature !== 'number' || typeof humidity !== 'number') {
//     		return res.status(400).json({ error: 'machineserial, Temperature and humidity must be numbers' });
//   	}
// 	insertData(machineserial,temperature, humidity,function(isSuccess){
// 		res.status(201).json(isSuccess);
// 	});
// })

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});


// API POST nhận ảnh và lưu thành file
app.post('/upload', upload.single('image'), (req, res) => {
	//console.log("upload request: ",req);
    if (!req.file) {
	console.log("No file uploaded.");
        return res.status(400).send('No file uploaded.');
    }

    // Tên file lưu trữ (tạo ngẫu nhiên hoặc đặt theo ý)
	let dates = new Date();
      let nameDate = ""+(""+dates.getDate()).padStart(2,"0")+"_"+(""+(dates.getMonth()+1)).padStart(2,"0")+"_"+dates.getFullYear();
    const fileName = `image_${nameDate}.jpg`;

    // Lưu file ảnh
    fs.writeFile(`./public/images_esp32/${fileName}`, req.file.buffer, (err) => {
        if (err) {
	     console.log(`Failed to save image.`,err);
            return res.status(500).send('Failed to save image.');
        }
	    console.log(`Image uploaded and saved as ${fileName}`)
        res.status(200).send(`Image uploaded and saved as ${fileName}`);
	io.sockets.emit("newimage",{imagepath:`./images_esp32/${fileName}`})
    });
});


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
	// báo sự kiện đã có hình up lên server
    //socket.on('newimage',(data)=>{
     //   console.log(`newimage`,data);
     //  io.emit('newimage',data);
    //});
	// sau 3 giây thì đẩy hình hiện tại có dc lên
	setTimeout(function(){
	let dates = new Date();
      let nameDate = ""+(""+dates.getDate()).padStart(2,"0")+"_"+(""+(dates.getMonth()+1)).padStart(2,"0")+"_"+dates.getFullYear();
      let fileName = `image_${nameDate}.jpg`;
	socket.emit("newimage",{imagepath:`./images_esp32/${fileName}`})
	},3000)	
     socket.on('disconnect', () => console.log('Client disconnected'));
})

//app.listen(port, () => {
server.listen(port, () => { 
  console.log(`App is listening on port ${port}`);
});
//});
//-------------------------


var password = encodeURIComponent("Hieu%230355185363");
const uri = `mongodb+srv://hieunguyen00678:Hieu%230355185363@ftechcluster.tl1vi6e.mongodb.net/?appName=ftechcluster`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);
var database =null;
var sensor_table =null;
var machines_table =null;
var IsDBConnected = false;
var IsInserting = false;
async function run() {
	try {
	  // Connect the client to the server	(optional starting in v4.7)
	  let rs= await client.connect().then(function(data){
		  //console.log("Connect :",data);
	  })
	  //console.log("Connect :",rs);
	  //console.log("KQ isSuccess :",client.isSuccess);
	  // Send a ping to confirm a successful connection
	  //await client.db("ftechdb").command({ ping: 1 });
	  database = client.db("ftechdb");
	  
	  try {
		  //await client.db("ftechdb").command({ ping: 1 });
		  database.command({ ping: 1 });
		  console.log("Pinged your deployment. You successf");
		  IsDBConnected=true;
		  sensor_table = database.collection("sensor_table");
		  machines_table = database.collection("machine_table");
		//   let cuser =  sensor_table.find({
		//   	timestamp: {
		//   		$gt: new Date("2024-09-26T13:00:18Z"),
		//   		$lt: new Date("2024-10-01T23:58:18Z")
		//   	} 
		//   });
		//  // let cuser = sensor_table.find({});
		//   //console.log("List rows table sensor :",cuser);
		//   let listRS =[]
		//   await cuser.forEach(function(el){
		// 	  listRS.push(el);
		// 	  //console.log("el:",el);
		//   });
		//   console.log("listRS:",listRS);
		  // listrow.forEach(element => {
		  // 	console.log("forEach:",element);
		  // });
		  
	  } catch (error) {
		  IsDBConnected=false;
		  console.log("Error:",error);
	  }
	  
  
	} finally {
	  // Ensures that the client will close when you finish/error
	  //await client.close();
	}
  }
  
//   setInterval( () => {
	  
//   	if(IsDBConnected && IsInserting==false && sensor_table!=null){
//   	console.log("IsDBConnected:",IsDBConnected);
//   	console.log("IsInserting:",IsInserting);
//   	console.log("sensor_table:",(sensor_table!=null));
//   		IsInserting=true;
//   		const doc = {
//   			machineserial:"5555",
//   			temperature: 20.9,
//   			humidity: 70,
//   			timestamp:new Date()
//   		  }
		  
//   		sensor_table.insertOne(doc).then(function(data){
//   			console.log("Da them 1 dong:",doc);
//   			IsInserting=false;
//   		});
		  
//   	}
//   }, 1000);
  
  run().catch(console.dir);

  
app.get('/insertdata', (req, res) => {
	//console.log("request",req.query);

	if(IsDBConnected){
		let machineserial = req.query.machineserial ;
		let temperature = parseFloat(req.query.temperature) ;
		let humidity 	= parseFloat(req.query.humidity) ; 
		// check dữ liệu đầu vào
	if (!machineserial || typeof temperature !== 'number' || typeof humidity !== 'number') {
			return res.status(400).json({ error: 'machineserial, Temperature and humidity must be numbers' });
	  }

		IsInserting = true;
		sensor_table.insertOne({machineserial:machineserial, temperature: temperature, humidity: humidity, timestamp: new Date() }).then(function (data) {
			//console.log("Da them 1 dong:", data);
			IsInserting = false;
			res.status(201).json(data);
		});

	}else{
		return res.status(400).json({ error: 'Database is disconnected' });
	}
   
})

app.get('/datadate', async (req, res)  => {
	let machineserial = req.query.machineserial ;
	let fromDate = req.query.fromdate ;
    	
	if (!machineserial) {
    		machineserial="5555";
  	}
	let fdate = toTimestamp(fromDate) || new Date();
	fdate.setHours(0,0,0,0);
	console.log("Lấy dữ liệu từ ngày: ",fdate)
 	// readDatabyDate(machineserial,toTimestamp(fdate), (data)=>{
	// 	res.status(201).json(data);
	// })

	
	let cuser =  sensor_table.find({
		timestamp: {
			$gt: fdate
			//,$lt: new Date("2024-10-01T23:58:18Z")
		},
		machineserial: machineserial
	});
   // let cuser = sensor_table.find({});
	//console.log("List rows table sensor :",cuser);
	let listRS =[]
	await cuser.forEach(function(el){
		listRS.push(el);
		//console.log("el:",el);
	});
	console.log("get data :",listRS.length);
	res.status(201).json(listRS);
})


app.get('/listtable', async(req, res) => {
	let cuser =   machines_table.find();
	let listRS =[]
	console.log(" machines_table :",machines_table);
	await cuser.forEach(function(el){
		listRS.push(el);
		//console.log("el:",el);
	});
	console.log("list table :",listRS.length);
	res.status(201).json(listRS);

	
});
