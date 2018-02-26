var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var pg = require('pg');

router.get('/status/:status', function(req, res) {
    var projectId = parseInt(req.params.projectId);
    var status = req.params.status;
    var region=config.aws.region;
    var bucket=config.aws.bucket;
    var imgstr="https://s3-"+region+".amazonaws.com/"+bucket+"/images/";  
    var client = new pg.Client(config.database);        
    client.connect();
    //var queryStr = "select * from social_media_creative_view where \"projectId\"=$1 and status=$2 and \"monthYear\"=$3";
    //var params=[projectId, status,req.query.monthYear]; 
    var queryStr = "select * from social_media_creative where status=$1";
    var params=[status]; 
    var query = client.query(queryStr, params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) { 
        for(var i=0;i<result.rows.length;i++)
        {
            result.rows[i].imageUrl=imgstr+result.rows[i].imageCode+".jpeg";
        }          
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(result.rows, null, "    ") + "\n");
            res.end();  
    });

})

router.get('/guidelines', function(req, res) {
    var data = {};
    data.platform = req.query.platform;  
    res.render('pages/guidelines', {data : data});
    res.end();  
})

module.exports = router