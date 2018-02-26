var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility = require('../../../../utility');
var pg = require('pg');
var path = require('path')

router.post('/verify',function(req,res){
    var client = new pg.Client(config.connection);   
    client.connect();   
    var queryStr = "select * from \"Admin\" where \"uniqueId\"=$1"; 
    var params=[req.body.uniqueId];
    var query = client.query(queryStr,params, function(err, result){
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
})

router.post('/insert',function(req,res){
    var client = new pg.Client(config.connection);   
    client.connect();   
    var queryStr = "INSERT INTO \"Admin\" (name,\"uniqueId\") VALUES ($1,$2) returning id";
    var params=[req.body.name,req.body.uniqueId];
    
    var query = client.query(queryStr,params, function(err, result){
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
})
    
module.exports = router