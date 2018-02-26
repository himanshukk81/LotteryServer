var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility = require('../../../../utility');
var pg = require('pg');
var crypto=require('crypto')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateDir = path.join(__dirname, '../../../../templates', 'email')
var moment=require('moment');


// post JSON {date,industryId,projectId}


router.post('/benchMarkInfo', function(req, res) {
    var date = new Date(req.body.date);
    var industryId = req.body.industryId;
    var dates =[];
    var attributeId;
    var reportTemplateId;
    var projectReportMappingId;
    var entries=[];
    var employeeEntryDatesId=[];
    var projectId=req.body.projectId;
    var client = new pg.Client(config.database);
    var benchMarkInfo={};

    client.connect();
    for(var i=0;i<=6;i++)
    {       
            if(i==0)
            {
              date.setMonth(date.getMonth()+0);  
              
            }
            else
            {
              date.setMonth(date.getMonth()+1);  
              
            }
            var startmomentObj = moment(date);
            var startmomentString = startmomentObj.format('YYYY-MM-DD');      
            dates.push(startmomentString);
            var dateStr=""
           
    }

     for(i=0, j=0,dateStr=""; i<dates.length; i++)
          {
            if(dates[i])
            {
              dateStr += ((j==0)?"":",") +"'"+dates[i]+"'";
              j++;
            }
          }

    if(!req.body.attributeId && !req.body.reportTemplateId)      
    {
      var query = "select * from industry_benchmark_view where \"industryId\"=$1 AND \"default\"=$2"
      var params =[industryId,true]
      var query = client.query(query,params, function(err, result)
      {   
        if(err)
        {
          // console.error(JSON.stringify(err));
          console.error(new Error(JSON.stringify(err)));
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify("line 46:"+err));
          res.end();
        }
        else if(result.rows.length>0)
        {
          attributeId = result.rows[0].attributeId;
          reportTemplateId = result.rows[0].reportTemplateId;
          benchMarkInfo.attribute=result.rows[0].attribute;
          benchMarkInfo.category=result.rows[0].category;
          getAdminValues();
        }
        else
        {
                var adminValues=[];
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(adminValues));
                res.end();       
        }
      });  
    }
    else
    {
      attributeId=req.body.attributeId;
      reportTemplateId=req.body.reportTemplateId;
      getAdminValues()
    }
    
    

      function getAdminValues()
      {

        var query = "select * from benchmark_value_attribute_view where date in ("+dateStr+") AND \"attributeId\"=$1"
        var params = [attributeId];
        var query = client.query(query,params, function(err, result)
        {   
          if(err)
          {
            console.log(JSON.stringify(err));
            client.end();
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify("line 78:"+err));
            res.end();
          }
          else
          {
                for(var i=0;i<dates.length;i++)
                {
                        var entryObj={};
                        entryObj.date = dates[i];
                        entryObj.min = null;
                        entryObj.max = null;
                        for(var j=0;j<result.rows.length;j++)
                        {

                                var date = moment(new Date(result.rows[j].date));
                                var dateString = date.format('YYYY-MM-DD');      
                                if(dates[i] == dateString)
                                {
                                        entryObj.min = result.rows[j].min;
                                        entryObj.max = result.rows[j].max;
                                }
                        }
                        entries.push(entryObj);
                } 
              getReportMapping();              
          }        
        });
      }              
      function getReportMapping()
      {
        var query = "select * from project_report_mapping where \"projectId\"=$1 and \"reportTemplateId\"=$2"
        var params = [projectId,reportTemplateId];

        var query = client.query(query,params, function(err, result)
        {   
          if(err)
          {
            console.log(JSON.stringify(err));
            client.end();
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify("line 120:"+err));
            res.end();
          }

          else if(result.rows.length>0)
          {
                  projectReportMappingId = result.rows[0].id;
                  getEmployeeEntries();
          }
          else
          {
                  for(var i=0;i<dates.length;i++)
                  {
                          entries[i].value = null;
                  }

                  benchMarkInfo.employeeEntry=entries;

                  client.end();
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.write(JSON.stringify(benchMarkInfo));
                  res.end();                 
          }
        });
      }
          
      function getEmployeeEntries()
      {
        var queryStr ="select * from report_entry where \"projectReportMappingId\"=$1 and status=$2 and \"dateOfEntry\" in ("+dateStr+") ORDER BY \"dateOfEntry\" DESC";
        var params=[projectReportMappingId,'A'];
        var query = client.query(queryStr,params, function(err, result)
        {   
          if(err)
          {
            console.log(JSON.stringify(err));
            client.end();
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify("line 155:"+err));
            res.end();
          }

          else if(result.rows.length>0)
          {
                  for(var i=0;i<result.rows.length;i++)
                  {
                          employeeEntryDatesId.push(result.rows[i].id);
                  }
                  for(var i=0;i<entries.length;i++)
                  {
                          entries[i].employeeEntryDatesId = null;
                          entries[i].value = null;
                          for(var j=0;j<result.rows.length;j++)
                          {

                                  var dateOfEntry = moment(new Date(result.rows[j].dateOfEntry));
                                  dateOfEntry = dateOfEntry.format('YYYY-MM-DD');      
                                  if(entries[i].date == dateOfEntry)
                                  {
                                          entries[i].employeeEntryDatesId = result.rows[j].id;
                                  }
                          }
                  }
                  getEmployeeEntriesValues();
          }
          else
          {
                  for(var i=0;i<dates.length;i++)
                  {
                          entries[i].value = null;
                  }

                  benchMarkInfo.employeeEntry=entries;

                  client.end();
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.write(JSON.stringify(benchMarkInfo));
                  res.end();                  

                  
          }  
        });

          
      }    
      function  getEmployeeEntriesValues()
      {
        var queryStr = "select * from report_attribute_value where \"reportEntryId\" in ("+employeeEntryDatesId+")  and \"reportAttributeId\" = $1 and \"valueType\"=$2 ORDER BY \"reportEntryId\" DESC";
        var params =[attributeId,'A'];

        var query = client.query(queryStr,params, function(err, result)
        {   
          if(err)
          {
            console.log(JSON.stringify(err));
            client.end();
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify("line 209:"+err));
            res.end();
          }
          else if(result.rows.length>0)
          {
            for(var i=0;i<entries.length;i++)
            {
                  entries[i].value = null;
                  for(var j=0;j<result.rows.length;j++)
                  {
                      if(entries[i].employeeEntryDatesId == result.rows[j].reportEntryId)
                      {
                              entries[i].value = result.rows[j].value;
                      }
                  }
            }
            benchMarkInfo.employeeEntry=entries;
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(benchMarkInfo));
            res.end();                        
          }

        });  
        
      }

})

router.get('/:industryId/attributeList', function (req, res)
{
      var client = new pg.Client(config.database);
      client.connect();
      var industryId=req.params.industryId;
      var query = "select * from industry_benchmark_view where \"industryId\"=$1 AND \"default\"=$2";
      var params =[industryId,true];
      var query = client.query(query,params, function(err, result)
      {   
        if(err)
        {
          console.log(JSON.stringify(err));
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify("line 46:"+err));
          res.end();
        }
        else if(result.rows.length>0)
        {
          client.end();
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(result.rows));
          res.end();
        }
      });  
});



module.exports = router