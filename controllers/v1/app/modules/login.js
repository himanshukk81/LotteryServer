var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility = require('../../../../utility');
var pg = require('pg');
var crypto=require('crypto')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateEmail = path.join(__dirname, '../../../../templates', 'forgotPassword')

router.post('/', function(req, res) {
    var client = new pg.Client(config.database);        
    client.connect();
    var finalObj = {};
    req.body.email = req.body.email.toLowerCase();
    var queryStr = "select * from employee where email=$1 and password=$2" ; 
    var params=[req.body.email, req.body.password];  
    var query = client.query(queryStr, params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) { 
        if (result.rows.length>0) 
        {
            result.rows[0].type="employee";
            finalObj = result.rows;
            getAgencyType();
            // client.end();
            // res.writeHead(200, {'Content-Type': 'application/json'});
            // res.write(JSON.stringify(finalObj, null, "    ") + "\n");
            // res.end(); 
        }
        else
        {
            searchInProjectClient();
        }
    });
    var searchInProjectClient=function()
    {
        var queryStr = "select * from project_client where email=$1 and password=$2" ; 
        var params=[req.body.email, req.body.password];  
        var query = client.query(queryStr, params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            if (result.rows.length>0) 
            {
                result.rows[0].type="client";
                finalObj = result.rows;
                getAgencyType();
                // client.end();
                // res.writeHead(200, {'Content-Type': 'application/json'});
                // res.write(JSON.stringify(finalObj, null, "    ") + "\n");
                // res.end(); 
            }
            else
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(result.rows, null, "    ") + "\n");
                res.end(); 
            }
        });
    }
    var getAgencyType=function()
    {
        var queryStr = "select type from agency where id=$1" ; 
        var params=[finalObj[0].agencyId];  
        var query = client.query(queryStr, params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            if (result.rows.length>0) 
            {
                finalObj[0].agencyType = result.rows[0].type;
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(finalObj, null, "    ") + "\n");
                res.end(); 
            }
            else
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(finalObj, null, "    ") + "\n");
                res.end(); 
            }
        });
    }
})

router.put('/device_token', function(req, res) {
    var queryStr;
    if (req.body.type=="client") 
    {
        queryStr = "update project_client set \"deviceToken\"=$1,\"notificationType\"=$2 where id=$3"; 
    }
    else
    {
        queryStr = "update employee set \"deviceToken\"=$1,\"notificationType\"=$2 where id=$3";
    }
    
    var params = [req.body.deviceToken, req.body.notificationType,req.body.id];
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
        }
        else
        {
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(result.rows));
            res.end();
        }    
    });
})

router.put('/change_password', function(req, res) {
    var queryStr;
    var email;
    if (req.body.type=="client") 
    {
        queryStr = "update project_client set password=$1 where email=$2";
    }
    else
    {
        queryStr = "update employee set password=$1 where email=$2";
    } 
    var params = [req.body.password, req.body.email];
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
              getprojectClient();
        }    
    });
    var getprojectClient=function()
    {  
        if (req.body.type=="client") 
        {
            queryStr = "select * from project_client where email=$1" ;
        }
        else
        {
            queryStr = "select * from employee where email=$1" ;
        }  
        var params = [req.body.email]; 
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {  
            email=result.rows[0].email;
            clientDetails = result.rows[0];
            mailToClient();
        });
    }

    var mailToClient=function()
    {
        var newsletter = new EmailTemplate(templateEmail)
        var dataas={};
        // dataas.message="'"+creativeName+"' rejected. Please review and update";   
        dataas.name = clientDetails.name;  
        dataas.password = clientDetails.password;  
        newsletter.render(dataas, function (err, result){
        var dataa = {
           'to':email,
           // 'subject':"New Password for HashTagit Business View",
           'subject':"New Password for HiDigify",
           'html':result.html
          }
        utility.sendMail(dataa);
        }); 

        client.end();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify("Success"));
        res.end();
        
        // client.end(); 
        // var data={};
        // data.paymentStatus="Success";
        // res.render('pages/registration', {data : data});    
    }  
})

router.put('/notification_setting', function(req, res) {
    var queryStr;
    if (req.body.type=="client") 
    {
        queryStr = "update project_client set \"appNotification\"=$1,\"emailNotification\"=$2 where id=$3"; 
    }
    else
    {
        queryStr = "update employee set \"appNotification\"=$1,\"emailNotification\"=$2 where id=$3";
    }    
    var params = [req.body.appNotification, req.body.emailNotification,req.body.id];
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
        }
        else
        {
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(result.rows));
            res.end();
        }    
    });
})

module.exports = router