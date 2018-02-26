var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility= require('../../../../utility');
var pg = require('pg');
var crypto=require('crypto')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateDir = path.join(__dirname, '../../../../templates', 'forgotPassword')

router.get('/forgotPassword', function(req, res) {
	var client = new pg.Client(config.database);		
	client.connect();
	var userDetails={};
	var email;
	var userName = req.query.userName;
	var userFound = false;
    if (userName.toLowerCase().indexOf("emp")==0) {
		var queryStr = "select * from employee where \"userName\"=$1";
    }
    else {	
		var queryStr = "select * from project_client where \"userName\"=$1";
    }
	var params = [userName];
	var query = client.query(queryStr,params);
    query.on("row", function (row, result) { 
        result.addRow(row);
        userDetails = result.rows[0];
    });
    query.on("end", function (result) {  
    	if (result.rows.length>0) {
    		userFound = true;
    		email = result.rows[0].email;
    		mailPassword();
    	}   
    	else {
    		client.end();
	        res.writeHead(200, {'Content-Type': 'application/json'});
	        res.write(JSON.stringify(userFound, null, "    ") + "\n");
	        res.end();
    	}       
    });
    var mailPassword =function()
	{
		var newsletter = new EmailTemplate(templateDir)
		var data ={};
		data.password = userDetails.password;
		data.name = userDetails.name;
		newsletter.render(data, function (err, result) {
		var data = {
			'to':email,
			// 'subject':"New Password for HashTagit Business View",
			'subject':"New Password HiDigify",
			'html':result.html
		}
		utility.sendMail(data);
		})
		client.end();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(userFound, null, "    ") + "\n");
        res.end();
	}
})

module.exports = router