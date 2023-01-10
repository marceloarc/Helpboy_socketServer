var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const http = require('http');
var index = require("./routes/index");
var mysql = require('mysql');
const api_url = "galaxydigitalweb.tech/web_service/"
var con  = mysql.createPool({
	connectionLimit : 10,
	acquireTimeout  : 10000,
	host: "galaxydigitalweb.tech",
	user: "u940267718_helpboy",
	password: "Vidaloka123",
	database: "u940267718_helpboy"
  });
  

var app = express();

var port = 3000;

var socket_io = require("socket.io");

var io = socket_io();


//views

app.set("views",  path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

//Body parser MW

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//Routes

app.use("/", index);


io.listen(app.listen(port, function(){
	console.log("Server running on port", port);
}));

app.io = io.on("connection", function(socket){
	console.log("Socket connected: " + socket.id);
	console.log(socket.id);
	var device_token = "";
	const intervalObj = setInterval(() => {
		
		var sql = "SELECT * from driver_location where socket_id = '"+socket.id+"'";
		con.query(sql, function (err, result) {
			if (err) throw err;
			Object.keys(result).forEach(function(key) {
				var row = result[key];
				var sql2 = "SELECT *,id as booking_id,pickup_area as pickup, (3959 * acos(cos(radians("+row.driver_lat+")) * cos(radians(pickup_lat)) * cos(radians(pickup_long) - radians("+row.driver_long+")) + sin(radians("+row.driver_lat+")) * sin(radians(pickup_lat)))) AS distance FROM bookingdetails where status = 1 HAVING distance < 29 ORDER BY distance LIMIT 1;";
				con.query(sql2, function (err, result) {
					if (err) throw err;
					Object.keys(result).forEach(function(key) {
						var row2 = result[key];
						
						var sql4 = "SELECT * from driver_details where id = '"+row.driver_id+"'";
						con.query(sql4, function (err, result4) {
							if (err) throw err;
							Object.keys(result4).forEach(function(key) {
								var row4 = result4[key];
							
								if(!row4.busy){
									socket.emit("Searched Driver Detail",row2);
								}
								var title = "Novas entregas";
								var message = "Você possui novas entregas acesse o app!"
								device_token = row4.device_token;
								console.log(row.driver_id);
							//	setTimeout(function() {
									
							//		http.get(api_url+'send_push?title='+title+'&message='+message+'&id='+device_token, res => {
							//			let data = [];
							//			const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
								
			//
								//		res.on('data', chunk => {
								//			data.push(chunk);
								//		});
			//
								//		res.on('end', () => {
								//			console.log('Response ended: ');
			//
								//		});
									//	}).on('error', err => {
									//	console.log('Error: ', err.message);
									//	});
								//
								
								
								//}, 10 * 60000);
			
								
							})

						})
					});
				});
			});
		});

		con.end();
	  }, 2000);


	//When emited by user on random nearby driver

	var driverRequest = socket.id + "driverRequest";
	io.on(driverRequest, function(passengerData){
		if(passengerData){

			console.log("Passenger looking for a driver", passengerData);

			//Update booking status to confirmed on btn click

		}
	});

	socket.on("Create Driver Data", function(location){
		console.log("teste");
			var index = 0;
		
		 
				var driverCurrentLocation = {
					"locationId":location.driver_id,
					"latitude": location.lat,
					"longitude": location.long
				};
				var sql = "update driver_location set driver_lat = '"+driverCurrentLocation.latitude+"', driver_long = '"+driverCurrentLocation.longitude+"',socket_id = '"+socket.id+"' where driver_id = "+driverCurrentLocation.locationId;
				con.query(sql, function (err, result) {
				  if (err) throw err;
				  console.log(location.driver_status);
				});
				if(location.booking_status){
				
					console.log(location.booking_status);
				
					

						
					
				}
				con.end();
		});
		socket.on("Update Location", function(location){
				var index = 0;
			
			 
					var driverCurrentLocation = {
						"locationId":location.driver_id,
						"latitude": location.lat,
						"longitude": location.long
					};
					var sql = "select * from driver_location where driver_id = "+driverCurrentLocation.locationId;
					con.query(sql, function (err, result) {
					  if (err) throw err;
					 if(typeof result[0] == 'undefined') {
						var sql = "insert into driver_location set driver_id ="+driverCurrentLocation.locationId+", driver_lat = '"+driverCurrentLocation.latitude+"', driver_long = '"+driverCurrentLocation.longitude+"',socket_id = '"+socket.id+"'";
						con.query(sql, function (err, result) {
						  if (err) throw err;
				
						});
					 }else{
						var sql = "update driver_location set driver_lat = '"+driverCurrentLocation.latitude+"', driver_long = '"+driverCurrentLocation.longitude+"',socket_id = '"+socket.id+"' where driver_id = "+driverCurrentLocation.locationId;
						con.query(sql, function (err, result) {
						  if (err) throw err;
				
						});
					 }
					});

					con.end();
			});
		socket.on("New User Register", function(data){
			console.log("teste2");
				var index = 0;
			
				const intervalObj = setInterval(() => {

					var driver_id = data.driver_id
					var sql = "SELECT * FROM driver_details a inner join driver_location b on a.id = b.driver_id  where a.id ="+driver_id;
					con.query(sql, function (err, result) {
					  if (err) throw err;
					  console.log("Table altered");
					  Object.keys(result).forEach(function(key) {
						var row = result[key];
						row['success'] = true;
						row['booking_status'] = 'On Trip';
						socket.emit("Driver Detail",row);
					  });
					});

					
				  }, 3000);


				  con.end();  
			});
});


