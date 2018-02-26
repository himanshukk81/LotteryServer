// const express = require('express')
// const path = require('path')
const PORT = process.env.PORT || 5000
var express = require('express');
var app = express();
var http=require('http');
var cors = require('cors');
var bodyParser = require('body-parser');
const path = require('path')
var config = require('./config');
var pg = require('pg');
app.get('/Admin', function(req, res) {
    // res.send("Hi this is Random");
    var client = new pg.Client(config.connection);   
	 //    var client = new pg.Client({
	//     user: "sdcsbyslxzflfa",
	//     password: "b710b03536b592c49e741573beae726b4ca4f24c85a2e33d7e1b3ae5a89ad1ae",
	//     database: "d63ju44m76dlhe",
	//     port: 5432,
	//     host: "ec2-54-235-146-184.compute-1.amazonaws.com",
	//     ssl: true
	// }); 
	// client.connect();     
    client.connect();   
    var queryStr = "select * from \"Admin\""; 
     var query = client.query(queryStr, function(err, result){
		if(err)
		{
		  console.log(JSON.stringify(err));
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(err));
          res.end();
		}else{
	        client.end();
	        res.writeHead(200, {'Content-Type': 'application/json'});
	        res.write(JSON.stringify(result.rows, null, "    ") + "\n");
	        res.end();  			
		}
	});

   //  console.log("Database url==="+process.env.DATABASE_URL);
   //  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	  //   client.query('SELECT * FROM \"Admin\"', function(err, result) {
	  //     done();
	  //     if (err)
	  //      { console.error(err); response.send("Error " + err); }
	  //     else
	  //      {
	  //        response.send("Hi this is Random"+json.stringify(result.rows));
	  //  	   };
	  //   });
  	// });

})

app.use(bodyParser.json({limit: '50mb'}));

app.use(bodyParser.urlencoded({
 extended: true
}));

app.use(cors());

app.use('/api',require('./controllers'))

app.set('port', 3000);
http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
