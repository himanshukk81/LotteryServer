var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var moment = require('moment');
var pg = require('pg');

router.get('/:reportMappingId', function(req, res) {
    var client = new pg.Client(config.database);  
    var id = parseInt(req.params.reportMappingId);   
    client.connect();
    var finalObj={};
    var dateValue;
    var reportId;
    finalObj.dates=[];
    finalObj.attributes=[];
    var filter = parseInt(req.query.filter);
    var queryStr = "select * from project_report_mapping where id=$1";
    var params=[id];
    var query = client.query(queryStr,params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) {   
        reportId=result.rows[0].reportTemplateId;
        getTargetStatus()
             
    });

    var getTargetStatus=function()
    {
        var queryStr = "select * from report_template where id=$1";
        var params=[reportId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            finalObj.target=result.rows[0].target;
            getAttributes(); 
        }); 
    }

    var getAttributes=function()
    {
        var queryStr = "select * from report_attribute where \"reportTemplateId\"=$1 and status=true ORDER BY id";
        var params=[reportId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            finalObj.attributes=result.rows;
            for(var a=0;a<finalObj.attributes.length;a++)
            {
                finalObj.attributes[a].values=[];
            }
            getDates();
            
        }); 
    }

    var getDates=function()
    {
        var queryStr = "select * from report_entry where \"projectReportMappingId\"=$1 and status=$2 ORDER BY \"dateOfEntry\" DESC LIMIT "+filter;
        if (filter==0) 
        {
            queryStr = "select * from report_entry where \"projectReportMappingId\"=$1 and status=$2 ORDER BY \"dateOfEntry\" DESC";
        }
        var params=[id,'A'];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {   
        if(result.rows.length>0)
        {
            finalObj.dates=result.rows;
            dateIdsStr = "";
            for(i=0,j=0,dateIdsStr=""; i<result.rows.length; i++)
            {
               if(result.rows[i].id)
               {
                 dateIdsStr += ((j==0)?"":",") +"'"+result.rows[i].id+"'";
                 j++;
               }
            }
            getDatesValues();
        }  
        else
        {
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj));
            res.end();
        }     
        });
    }

    var getDatesValues=function()
    {
        var queryStr = "select * from report_attribute_value where \"reportEntryId\" in ("+dateIdsStr+")  ORDER BY \"reportEntryId\" DESC";
        var query = client.query(queryStr);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {          
            dateValue=result.rows;
            for (var i=0; i<dateValue.length; i++) {
                dateValue[i].value = parseFloat(dateValue[i].value);
            }
            calculateData();
        });
    }
    

    var calculateData=function()
    {
        for(var i=0;i<finalObj.dates.length;i++)
        {
            for(var j=0;j<finalObj.attributes.length;j++)
            {
                var obj={};
                obj.value=null;
                obj.targetValue=null;
                var count=0;
                for(var k=0;k<dateValue.length;k++)
                {
                    if(finalObj.dates[i].id == dateValue[k].reportEntryId && finalObj.attributes[j].id == dateValue[k].reportAttributeId)
                    {
                        if(dateValue[k].valueType=='A')
                        {
                            obj.value= dateValue[k].value; //finalObj.attributes[j].values.push({value:dateValue[k].value});
                        }
                        if(dateValue[k].valueType=='T')
                        {
                            obj.targetValue= dateValue[k].value; //finalObj.attributes[j].values.push({value:dateValue[k].value});
                        }
                    }
                }
                finalObj.attributes[j].values.push(obj);  
            }
        }
        client.end();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(finalObj));
        res.end();
    }
})

router.get('/:projectReportMappingId/attribute/:attributeId', function(req, res) {
    var client = new pg.Client(config.database);  
    var projectReportMappingId = parseInt(req.params.projectReportMappingId); 
    var attributeId = parseInt(req.params.attributeId);   
    client.connect();
    var finalObj={};
    var reportId;
    var dateValue;
    finalObj.dates=[];
    finalObj.datesObj=[];
    finalObj.tableData=[];
    finalObj.graph={};
    finalObj.graph.actualValues = [];
    finalObj.graph.targetValues = [];
    queryStr = "select distinct \"dateOfEntry\",\"reportEntryId\" from attribute_view where \"reportAttributeId\"=$1 and status=$2 and \"projectReportMappingId\"=$3 ORDER BY \"dateOfEntry\" DESC";
    var params=[attributeId,'A',projectReportMappingId];
    var query = client.query(queryStr,params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) {   
        if(result.rows.length>0)
        { 
            for (var i=0; i<result.rows.length; i++) 
            {   
                finalObj.dates.push(result.rows[i].dateOfEntry);
                finalObj.datesObj.push(result.rows[i]);               
            }
            getAttributeTargetStatus();
        }  
        else
        {
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj));
            res.end();
        }     
    });

    var getAttributeTargetStatus=function()
    {
        var queryStr = "select distinct target,attribute,type,category from attribute_view where \"reportAttributeId\"=$1";
        var params =[attributeId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {
            finalObj.target = result.rows[0].target; 
            finalObj.attribute = result.rows[0].attribute;
            finalObj.category =result.rows[0].category;
            finalObj.type = result.rows[0].type;
            getValues();        
        });
    }

    var getValues=function()
    {
        var queryStr = "select * from attribute_view where \"reportAttributeId\"=$1 AND \"valueType\"=$2 AND status=$3 and \"projectReportMappingId\"=$4 ORDER BY \"dateOfEntry\" DESC";
        var params =[attributeId,'A','A',projectReportMappingId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {            
            for (var i=0;i<finalObj.dates.length;i++) 
            {
                var count=0;
                for(var j=0;j<result.rows.length;j++)
                {
                    if(finalObj.datesObj[i].reportEntryId == result.rows[j].reportEntryId)
                    {
                        count++;
                        finalObj.graph.actualValues.push(result.rows[j].value);
                        finalObj.tableData.push({value:result.rows[j].value});
                    }
                }
                if(count==0)
                {
                    finalObj.graph.actualValues.push(0);
                    finalObj.tableData.push({value:0});
                }
            }

            if(finalObj.target)
            {
                getTargetValues();
            }
            else
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(finalObj));
                res.end(); 
            }
            
        });
    }

    var getTargetValues=function()
    {
        var queryStr = "select * from attribute_view where \"reportAttributeId\"=$1 AND \"valueType\"=$2 AND status=$3 and \"projectReportMappingId\"=$4 ORDER BY \"dateOfEntry\" DESC";
        var params =[attributeId,'T','A',projectReportMappingId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            for (var i=0;i<finalObj.dates.length;i++) 
            {        
                var count=0;   
                for (var j=0; j<result.rows.length; j++) 
                {
                    if(finalObj.datesObj[i].reportEntryId == result.rows[j].reportEntryId)
                    {
                        count++;
                        finalObj.graph.targetValues.push(result.rows[j].value);
                        finalObj.tableData[i].targetValue = result.rows[j].value;
                    }
                }
                if(count==0)
                {
                    finalObj.graph.targetValues.push(0);
                    finalObj.tableData[i].targetValue = 0;
                }
            }

            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj));
            res.end(); 

        });
    }

    
})

// router.get('/:projectReportMappingId/attribute/:attributeId', function(req, res) {
//     var client = new pg.Client(config.database);  
//     var projectReportMappingId = parseInt(req.params.projectReportMappingId); 
//     var attributeId = parseInt(req.params.attributeId);   
//     client.connect();
//     var finalObj={};
//     var reportId;
//     var dateValue;
//     finalObj.dates=[];
//     finalObj.attributes=[];
//     queryStr = "select * from report_entry where \"projectReportMappingId\"=$1 ORDER BY id DESC";
//     var params=[projectReportMappingId];
//     var query = client.query(queryStr,params);
//     query.on("row", function (row, result) { 
//         result.addRow(row); 
//     });
//     query.on("end", function (result) {   
//     if(result.rows.length>0)
//     {
//         finalObj.dates=result.rows;
//         dateIdsStr = "";
//         for(i=0,j=0,dateIdsStr=""; i<result.rows.length; i++)
//         {
//            if(result.rows[i].id)
//            {
//              dateIdsStr += ((j==0)?"":",") +"'"+result.rows[i].id+"'";
//              j++;
//            }
//         }
//         getDatesValues();
//     }  
//     else
//     {
//         client.end();
//         res.writeHead(200, {'Content-Type': 'application/json'});
//         res.write(JSON.stringify(result.rows));
//         res.end();
//     }     
//     });
//     var getDatesValues=function()
//     {
//         var queryStr = "select * from report_attribute_value where \"reportEntryId\" in ("+dateIdsStr+") AND \"reportAttributeId\"=$1 ORDER BY \"reportEntryId\" DESC";
//         var params =[attributeId];
//         var query = client.query(queryStr,params);
//         query.on("row", function (row, result) { 
//             result.addRow(row); 
//         });
//         query.on("end", function (result) {          
//             dateValue=result.rows;
//             //getAttributeName();
//             getReportId();
//         });
//     }
//     var getReportId=function()
//     {
//         var queryStr = "select * from project_report_mapping where id=$1";
//         var params=[projectReportMappingId];
//         var query = client.query(queryStr,params);
//         query.on("row", function (row, result) { 
//             result.addRow(row); 
//         });
//         query.on("end", function (result) { 
//             reportId=result.rows[0].reportTemplateId;
//             getTargetStatus(); 
//         }); 
//     }

//     var getTargetStatus=function()
//     {
//         var queryStr = "select * from report_template where id=$1";
//         var params=[reportId];
//         var query = client.query(queryStr,params);
//         query.on("row", function (row, result) { 
//             result.addRow(row); 
//         });
//         query.on("end", function (result) { 
//             finalObj.target=result.rows[0].target;
//             getAttributeName(); 
//         }); 
//     }

//     var getAttributeName=function()
//     {
//         var queryStr = "select * from report_attribute where id=$1";
//         var params=[attributeId];
//         var query = client.query(queryStr,params);
//         query.on("row", function (row, result) { 
//             result.addRow(row); 
//         });
//         query.on("end", function (result) { 
//             finalObj.attributes=result.rows;
//             for(var a=0;a<finalObj.attributes.length;a++)
//             {
//                 finalObj.attributes[a].actualValues=[];
//                 finalObj.attributes[a].TargetValues=[];
//             }
//             for(var i=0;i<finalObj.dates.length;i++)
//             {
//                 for(var j=0;j<finalObj.attributes.length;j++)
//                 {
//                     var actualValue = null;
//                     var targetValue =null;
//                     for(var k=0;k<dateValue.length;k++)
//                     {
//                         if(finalObj.dates[i].id == dateValue[k].reportEntryId && finalObj.attributes[j].id == dateValue[k].reportAttributeId)
//                         {
//                             if(dateValue[k].valueType=='A')
//                             {
//                                 actualValue=dateValue[k].value;
//                                 //finalObj.attributes[j].actualValues.push(dateValue[k].value); 
//                             }
//                             if(dateValue[k].valueType=='T')
//                             {  
//                                 targetValue=dateValue[k].value;
//                                 //finalObj.attributes[j].TargetValues.push(dateValue[k].value); 
//                             }
//                         }
//                         // else
//                         // {
//                         //     finalObj.attributes[j].actualValues.push(null);
//                         //     finalObj.attributes[j].TargetValues.push(null); 
//                         // }
                        
//                     } 
//                     finalObj.attributes[j].actualValues.push(actualValue);
//                     finalObj.attributes[j].TargetValues.push(targetValue); 
//                 }

//             }
//             client.end();
//             res.writeHead(200, {'Content-Type': 'application/json'});
//             res.write(JSON.stringify(finalObj));
//             res.end();
//         }); 
//     }
// })


module.exports = router