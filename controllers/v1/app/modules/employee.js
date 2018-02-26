var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var pg = require('pg');

router.get('/:employeeId/project', function(req, res) {
    var employeeId = parseInt(req.params.employeeId);
    var client = new pg.Client(config.database);        
    client.connect();
    var queryStr = "select distinct (\"projectId\", \"employeeId\", \"projectName\") from project_view where \"employeeId\"=$1" ;
    var params=[employeeId]; 
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

router.get('/role/:roleId', function(req, res) {
    var id = parseInt(req.params.roleId);
    var queryStr = "select * from employee where \"roleId\"=$1 AND status=$2";
    var params=[id,true];
    var client = new pg.Client(config.database);
    client.connect();
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