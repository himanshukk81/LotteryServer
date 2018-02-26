var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility = require('../../../../utility');
var pg = require('pg');
var crypto=require('crypto')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateEmail = path.join(__dirname, '../../../../templates', 'email')
router.get('/', function(req, res) 
{
    // res.writeHead(200, {'Content-Type': 'application/json'});
    // res.write(JSON.stringify("hello"));
    // res.end();   
    var client = new pg.Client(config.database);   
    var projectCounter=0; 
    var mailCounter=0;  
    var managerMailCounter=0;
    var projects;  
    client.connect();
    var queryStr = "select * from project where status=true" ; 
    var query = client.query(queryStr, function(err, result)
    {   
        if(err)
        {
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(err));
          res.end();
        }
        else
        {  
            if(result.rows.length>0)
            {
                projects=result.rows;
                getProjectManager();
            } 
            else
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(result.rows));
                res.end();
            }         
        }    
    });

    var getProjectManager=function()
    {
        var queryStr = "select * from project_client where \"projectId\"=$1 AND \"roleId\"=$2 AND status=$3 AND notify=$4" ; 
        var params=[projects[projectCounter].id,2,true,true];
        var query = client.query(queryStr,params, function(err, result)
        {   
            if(err)
            {
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }
            else
            {
                if(projectCounter==projects.length-1)
                {
                    if(result.rows.length>0)
                    {
                        projects[projectCounter].managers=result.rows;
                        getCreatives();
                    } 
                    else
                    {
                        sendMails();
                    }
                }  
                else
                {
                    if(result.rows.length>0)
                    {
                        projects[projectCounter].managers=result.rows;
                        getCreatives();
                    } 
                    else
                    {
                        projectCounter++;
                        getProjectManager();
                    }
                }         
            }    
        });  
    }

    var getCreatives=function()
    {
        var queryStr = "select * from social_media_creative where \"projectId\"=$1 AND status=$2" ; 
        var params=[projects[projectCounter].id,'P'];
        var query = client.query(queryStr,params, function(err, result)
        {   
            if(err)
            {
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }
            else
            {   if(projectCounter==projects.length-1)
                {
                    if(result.rows.length>0)
                    {
                        projects[projectCounter].newCreatives=true;
                        projects[projectCounter].creatives=result.rows;   
                    } 
                    else
                    {
                        projects[projectCounter].newCreatives=false;
                    } 
                     sendMails();
                }
                else
                {
                    if(result.rows.length>0)
                    {
                        projects[projectCounter].newCreatives=true;
                        projects[projectCounter].creatives=result.rows; 
                        projectCounter++;
                        getProjectManager();
                    } 
                    else
                    {
                        projects[projectCounter].newCreatives=false;
                        projectCounter++;
                        getProjectManager();
                    } 
                }
                 
            }    
        });  
    }
    var sendMails=function()
    {
        if(mailCounter != projects.length)
        {
            if(projects[mailCounter].newCreatives && projects[mailCounter].managers.length>0)
            {
                var newsletter = new EmailTemplate(templateEmail)
                var dataas={};
                dataas.message="Social Media Creative uploaded for review";
                newsletter.render(dataas, function (err, result){
                var dataa = {
                   'to':projects[mailCounter].managers[managerMailCounter].email,
                   'subject':"Social Media Creative uploaded for review",
                   'html':result.html
                  }
                    utility.sendMail(dataa); 
                    //console.log(dataa);
                    managerMailCounter++;
                    if(managerMailCounter != projects[mailCounter].managers.length)
                    {                        
                        sendMails(); 
                    }
                    else
                    {
                        managerMailCounter=0;
                        mailCounter++;
                        sendMails();  
                    }
                    
                }); 
                // client.end(); 
                // var data={};
                // data.paymentStatus="Success";
                // res.render('pages/registration', {data : data}); 
            }
            else
            {
                mailCounter++;
                sendMails();
            }
        }
        else
        {
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(projects));
            res.end();
        } 
        
    }
})

module.exports = router