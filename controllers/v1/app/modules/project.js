var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility = require('../../../../utility');
var moment = require('moment');
var pg = require('pg');
var crypto=require('crypto')
var request = require('request');
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateDir = path.join(__dirname, '../../../../templates', 'email')

router.get('/', function(req, res) {
    var client = new pg.Client(config.database);        
    client.connect();
    var queryStr;
    var agencyId = req.query.agencyId;
    if(req.query.roleId)
    {   
        var roleId = parseInt(req.query.roleId);
        var employeeId = parseInt(req.query.employeeId);
        if(roleId ==1)
        {
            queryStr = "select * from project where status=true and \"agencyId\"="+agencyId; 
        }
        else if(roleId ==2)
        {
            queryStr = "select * from project where status=true and \"projectManagerId\"="+employeeId+" and \"agencyId\"="+agencyId; 
        }
        else if (roleId==3)
        {
            queryStr = "select distinct id,\"city\", \"domain\", \"name\",\"industryId\" from project_employee_view where \"employeeId\"="+employeeId+" and status=true and \"agencyId\"="+agencyId;
        }       
        else   // roleId==4
        {
          queryStr = "select * from project where status=true and \"agencyId\"="+agencyId; 
        }
    }
    else
    {
      queryStr = "select * from project where status=true and \"agencyId\"="+agencyId; 
    }
    
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
            res.write(JSON.stringify(result.rows));
            res.end();
        }    
    });
})

router.get('/project_platform', function(req, res) {
    var client = new pg.Client(config.database);        
    client.connect();
    var finalObj = {};
    var queryStr = "select * from project_platform_view where \"projectId\"=$1";
    var params = [req.query.projectId];  
    var query = client.query(queryStr,params, function(err, result) {
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
          res.write(JSON.stringify(result.rows));
          res.end();     
        } 
    });  
})

router.get('/youtube_statistics',function(req,res){
 var apiKey = req.query.apikey;
 var channelId = req.query.channelid;
 var counter = 0;
 // var apiKey = "AIzaSyCQAmgTMmTtN1d8cUm9-3xERzMWnz4LaPg";
 // var channelId = "UCQjSEbZaDQba2GM2i5sRcFg";
   var youTube = {};
   youTube.channel={};
   var videoId = [];
   request.get("https://www.googleapis.com/youtube/v3/channels?part=statistics&id="+channelId+"&key="+apiKey, function(err,httpResponse,body){
         // console.log(httpResponse); 
         var object = JSON.parse(httpResponse.body);
        
         console.log('object:::' + JSON.stringify(object));
         if(object.items.length>0){
        
         youTube.videos = videoId;
         res.writeHead(200, {'Content-Type': 'application/json'});
         res.write(JSON.stringify(youTube) + "\n");
         res.end();  
         }
         else{
           youTube.channel.viewCount = object.items[0].statistics.viewCount;
           youTube.channel.commentCount = object.items[0].statistics.commentCount;
           youTube.channel.subscriberCount = object.items[0].statistics.subscriberCount;
           youTube.channel.videoCount = object.items[0].statistics.videoCount;

            getChannelVideo();
         }
         // var object = JSON.parse(httpResponse.body);
         // access_token = object.access_token;
          
          
       })

     var getChannelVideo = function()
     {
     request.get("https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId="+channelId+"&maxResults=25&key="+apiKey, function(err,httpResponse,body){
           console.log(httpResponse); 
           var object = JSON.parse(httpResponse.body);
          
           console.log(JSON.stringify(object));
           if(object.items.length>0)
           {
             for(var i = 0;i<object.items.length;i++)
             { 
               if(!object.items[i].id.videoId)
               {
                 youTube.channel.published = object.items[i].snippet.publishedAt;
               youTube.channel.title = object.items[i].snippet.title;
               youTube.channel.url = object.items[i].snippet.thumbnails.medium.url;
               youTube.channel.description = object.items[i].snippet.description;
               }
               else{
           videoId.push({"videoId":object.items[i].id.videoId,
                         "name":object.items[i].snippet.title,
                         "url": object.items[i].snippet.thumbnails.medium.url})
               }
             }
             // console.log(JSON.stringify(youTube));
             // console.log(JSON.stringify(videoId));
             getVideoStatistics(videoId[counter].videoId);
           }
          
            
       })
     }

     var getVideoStatistics = function(vedioId){
       request.get("https://www.googleapis.com/youtube/v3/videos?id="+vedioId+"&key="+apiKey+"&part=statistics", function(err,httpResponse,body){
           console.log(httpResponse); 
           var object = JSON.parse(httpResponse.body);
          
           console.log(JSON.stringify(object));
           if(object.items.length>0){
             for(var i =0;i<videoId.length;i++){
               if(videoId[i].videoId  == vedioId){
                 videoId[i].viewCount = object.items[0].statistics.viewCount;
                 videoId[i].likeCount = object.items[0].statistics.likeCount;
                 videoId[i].dislikeCount = object.items[0].statistics.dislikeCount;
                 videoId[i].favoriteCount = object.items[0].statistics.favoriteCount;
                 videoId[i].commentCount = object.items[0].statistics.commentCount;

               }
             }
           }

           if(++counter==videoId.length){
             counter = 0;
             youTube.videos = videoId;
             res.writeHead(200, {'Content-Type': 'application/json'});
           res.write(JSON.stringify(youTube) + "\n");
           res.end();          
           }
           else{
             getVideoStatistics(videoId[counter].videoId);
           }
          
            
       })
     }


})

router.post('/fb_analytics_for_post', function(req, res) {
    // var client = new pg.Client(config.database);        
    // client.connect();
    var access_token = req.body.accesstoken;
    var pages = [];
    var fbanalyticsData = {};
    var counter = 0;
    var count = 0;
    var posts = [];
    var pagePostdata = function(pageId)
    {
          console.log("https://graph.facebook.com/v2.8/"+pageId+"/posts?fields=picture,message,created_time&access_token="+access_token);
          request.get("https://graph.facebook.com/v2.8/"+pageId+"/posts?fields=picture,message,created_time&access_token="+access_token, function(err,httpResponse,body)
          {


          // https://graph.facebook.com/v2.8/294271960728430/posts?fields=picture,message,created_time&access_token=EAAIsFCBEPy0BALx5azTd7pOzPXimOluxNL4C8qjCoSQRaZCWRLPYAyNLafNWtcPrxsMnSQNim6C4KjtXqUHVO4e85VowysMNhI6FHFrZAUZBGIblZCtwQK8IB8JZBsY1Owr97xhm9iC5cYSKFuhgH5IaWIHtVjKcZD
              // EAAIsFCBEPy0BALx5azTd7pOzPXimOluxNL4C8qjCoSQRaZCWRLPYAyNLafNWtcPrxsMnSQNim6C4KjtXqUHVO4e85VowysMNhI6FHFrZAUZBGIblZCtwQK8IB8JZBsY1Owr97xhm9iC5cYSKFuhgH5IaWIHtVjKcZD

              // 294271960728430



              var startDate = new Date(req.body.startDate);
              var endDate = new Date(req.body.endDate);
              startDate.setHours(0,0,0,0);
              endDate.setHours(0,0,0,0);

              console.log(httpResponse); 
              var obj = JSON.parse(httpResponse.body);

              var countdate = 0;
              for (var i=0; i<obj.data.length;i++) {
                obj.data[i].created_time = new Date(obj.data[i].created_time);
                obj.data[i].created_time.setHours(0,0,0,0);
                if (startDate.getTime()<=obj.data[i].created_time.getTime() && endDate.getTime()>=obj.data[i].created_time.getTime()) {
                  countdate++;
                }
                else {
                  obj.data.splice((i),1);
                  i--;
                }
              }
              console.log(countdate);
              console.log(obj.data);

              pages[counter].posts = [];
              pages[counter].posts = obj.data;
              if(++counter==pages.length)
              {   
                  counter = 0;
                  for (var i=0;i<pages.length;i++) {
                    if (pages[i].posts.length==0 || pages[i].pageId=='411924489160886') {
                      pages.splice(i,1);
                      i--;
                    }
                  }
                  if (pages.length>0) {
                    if (pages[counter].posts.length>0) {
                      getPostCommentCount(pages[counter].posts[count].id);
                    }
                    else{
                      counter++;
                      getPostCommentCount(pages[counter].posts[count].id);
                    }
                  }
                  else {
                    fbanalyticsData.pages = pages;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(fbanalyticsData, null, "    ") + "\n");
                    res.end();
                  }
              }
              else
              {
                pagePostdata(pages[counter].pageId); 
              }
                
            
              // console.log(JSON.stringify(obj));
            
          
          })
    }

    var getPostCommentCount = function(postId)
    { 
      
        request.get("https://graph.facebook.com/v2.8/"+postId+"/comments?access_token="+access_token, function(err,httpResponse,body){
            
            var object = JSON.parse(httpResponse.body);
            pages[counter].posts[count].commentCount = object.data.length;
            if(++count==pages[counter].posts.length)
            {
                if(++counter == pages.length)
                { 
                    counter = 0;
                    count = 0;
                    if (pages[counter].posts.length>0) {
                      getPostLikeCount(pages[counter].posts[count].id);
                    }
                    else{
                      counter++;
                      getPostLikeCount(pages[counter].posts[count].id);
                    }
                    // fbanalyticsData.pages = pages;
                    // res.writeHead(200, {'Content-Type': 'application/json'});
                    // res.write(JSON.stringify(fbanalyticsData, null, "    ") + "\n");
                    // res.end();
                }
                else
                {
                    count = 0;
                    getPostCommentCount(pages[counter].posts[count].id);
                }
                
            }
            else
            { 
                
                getPostCommentCount(pages[counter].posts[count].id);
            }
            
           
        })
    }

    var getPostLikeCount = function(postId)
    { 
      
        request.get("https://graph.facebook.com/v2.8/"+postId+"/likes?access_token="+access_token, function(err,httpResponse,body){
            
            var object = JSON.parse(httpResponse.body);
            pages[counter].posts[count].likeCount = object.data.length;
            if(++count==pages[counter].posts.length)
            {
                if(++counter == pages.length)
                { 
                    counter = 0;
                    count = 0;
                    if (pages[counter].posts.length>0) {
                      getPostSharedCount(pages[counter].posts[count].id);
                    }
                    else{
                      counter++;
                      getPostSharedCount(pages[counter].posts[count].id);
                    }
                    // fbanalyticsData.pages = pages;
                    // res.writeHead(200, {'Content-Type': 'application/json'});
                    // res.write(JSON.stringify(fbanalyticsData, null, "    ") + "\n");
                    // res.end();
                }
                else
                {
                    count = 0;
                    getPostLikeCount(pages[counter].posts[count].id);
                }
                
            }
            else
            { 
                getPostLikeCount(pages[counter].posts[count].id);
            }
            
           
        })
    }

    var getPostSharedCount = function(postId)
    { 
      
        request.get("https://graph.facebook.com/v2.8/"+postId+"/sharedposts?access_token="+access_token, function(err,httpResponse,body){
            
            var object = JSON.parse(httpResponse.body);
            pages[counter].posts[count].shareCount = object.data.length;
            if(++count==pages[counter].posts.length)
            {
                if(++counter == pages.length)
                { 
                    counter = 0;
                    count = 0;
                    fbanalyticsData.pages = pages;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(fbanalyticsData, null, "    ") + "\n");
                    res.end();
                }
                else
                {
                    count = 0;
                    getPostSharedCount(pages[counter].posts[count].id);
                }
                
            }
            else
            { 
                getPostSharedCount(pages[counter].posts[count].id);
            }
            
           
        })
    }



    request.get("https://graph.facebook.com/v2.8/me/accounts?access_token="+access_token, function(err,httpResponse,body){
          console.log(httpResponse); 
          var object = JSON.parse(httpResponse.body);
          console.log(JSON.stringify(object));
              if(object.data.length>0)
              {
                for(var i=0;i<object.data.length;i++)
                {
                    pages.push({"PageCategory":object.data[i].category,"pageId":object.data[i].id,"pageName":object.data[i].name});
                }
                pagePostdata(pages[counter].pageId);
              }
              else
              {
                  fbanalyticsData.pages = [];
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.write(JSON.stringify(fbanalyticsData, null, "    ") + "\n");
                  res.end();
              }
          
          
    })
  
    
})


router.get('/:projectId', function(req, res) {
    var finalObj={};
    var region=config.aws.region;
    var bucket=config.aws.bucket;
    var imgstr="https://s3-"+region+".amazonaws.com/"+bucket+"/images/";
	var projectId = parseInt(req.params.projectId);
    var client = new pg.Client(config.database);		
	client.connect();
	var queryStr = "select * from project_report_view where \"projectId\"=$1" ;	
	var params=[projectId];
    var count=0;
    var query = client.query(queryStr, params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) {  
        for(var i=0;i<result.rows.length;i++)
        {
            result.rows[i].imageUrl=imgstr+result.rows[i].imageCode+".jpeg";
        } 
        finalObj.reports=result.rows;
        getReportsLastUpdatedDate();
        //getSeoSocialMediaStatus();          
    });

    var getReportsLastUpdatedDate=function()
    {
        var queryStr = "select * from report_entry where \"projectReportMappingId\" =$1 and status=$2 ORDER BY \"dateOfEntry\" DESC LIMIT 1"; 
        var params=[finalObj.reports[count].projectReportMappingId,'A'];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            if(result.rows.length>0)
            {
                finalObj.reports[count].lastUpdate=result.rows[0].dateOfEntry;
            }
            count++;
            if(count == finalObj.reports.length)
            {
                getSeoSocialMediaStatus(); 
            } 
            else
            {
               getReportsLastUpdatedDate();
            }
            
        }); 
    }

    var getSeoSocialMediaStatus=function()
    {
        var queryStr = "select * from project where id=$1" ;  
        var params=[projectId];
        var query = client.query(queryStr, params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {  
            finalObj.socialMedia=result.rows[0].socialMedia;
            finalObj.seoReport=result.rows[0].seoReport;
            if(!finalObj.socialMedia && !finalObj.seoReport)
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(finalObj, null, "    ") + "\n");
                res.end();   
            }
            else
            {
                if(finalObj.socialMedia)
                {
                    getSocialMediaLastUpdate();
                }
                else
                {
                    getSeoReportLastUpdate();
                }
            }
             
        }); 
    }

    var getSocialMediaLastUpdate=function()
    {
        var queryStr = "select * from social_media_creative where \"projectId\" =$1 and status=$2 ORDER BY \"postingDate\" DESC LIMIT 1"; 
        var params=[projectId,'A'];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        { 
            if(result.rows.length>0)
            {
                finalObj.lastSocailMediaUpdate=result.rows[0].postingDate;
            }
            if(finalObj.seoReport)
            {
                getSeoReportLastUpdate();
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

    var getSeoReportLastUpdate=function()
    {
        var queryStr = "select * from project_seo_entry where \"projectId\" =$1 ORDER BY \"dateOfEntry\" DESC LIMIT 1"; 
        var params=[projectId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        { 
            if(result.rows.length>0)
            {
                finalObj.lastSeoUpdate=result.rows[0].dateOfEntry;
            }
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj, null, "    ") + "\n");
            res.end();
        });    
    }

})

router.get('/:projectId/details', function(req, res) {
    var data = {};
    var projectId = parseInt(req.params.projectId);
    var client = new pg.Client(config.database);
    client.connect();    
    var queryStr = "select * from project where id=$1";
    var params=[projectId];
    var query = client.query(queryStr,params, function(err, result){   
        if(err)
        {
          console.log(JSON.stringify(err));
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(err));
          res.end();
        }else{
            data = result.rows[0];
            projectClient();
        }    
    });
    var projectClient=function()
    {
        var queryStr = "select * from project_client where \"projectId\"=$1";
        var params=[projectId];
        var query = client.query(queryStr,params, function(err, result){   
            if(err)
            {
              console.log(JSON.stringify(err));
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }else{
                data.clients = result.rows;
                getSeoGroup();
            }    
        });      
    }
    var getSeoGroup=function()
    {
        var queryStr = "select * from project_seo_employee_view where \"projectId\"=$1";
        var params=[projectId];
        var query = client.query(queryStr,params, function(err, result){   
            if(err)
            {
              console.log(JSON.stringify(err));
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }else{
                data.seoWorkGroup = result.rows;
                projectReportMapping();
            }    
        });      
    }
    var projectReportMapping=function()
    {
        
        var queryStr = "select distinct \"reportTemplateId\", \"reportName\",\"projectReportMappingId\" from project_report_view where \"projectId\"=$1";
        var params=[projectId];
        var query = client.query(queryStr,params, function(err, result){   
            if(err)
            {
              console.log(JSON.stringify(err));
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }else{
                // data.reports = [];
                // for (var i=0; i<result.rows.length; i++) {
                //     var obj = {};
                //     obj.reportTemplateId = result.rows[i].reportTemplateId;
                //     obj.projectReportMappingId = result.rows[i].id;
                //     data.reports.push(obj);                    
                // }
                data.reports = result.rows;
                reportEmpMapping();
            }    
        });      
    }
    var reportEmpMapping=function()
    {
        var queryStr = "select * from report_emp_mapping where \"projectReportMappingId\"=$1";
        var counter = 0;
        var params=[data.reports[counter].projectReportMappingId];
        var getReportEmpMapping=function(err,result)
        {   
            //delete data.reports[counter].projectReportMappingId;
            data.reports[counter].workGroup = [];
            for (var i=0; i<result.rows.length; i++) 
            {
                data.reports[counter].workGroup[i] = result.rows[i].employeeId;
            }
            if(++counter==data.reports.length)
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(data, null, "    ") + "\n");
                res.end();
            }
            else{
                    params = [data.reports[counter].projectReportMappingId];
                    query=client.query(queryStr,params,getReportEmpMapping);
            }
        }
        var query=client.query(queryStr,params,getReportEmpMapping);     
    }
})

router.post('/:projectId/social_media_creative/date', function(req, res) {
    var projectId = parseInt(req.params.projectId);
    var client = new pg.Client(config.database); 
    var region=config.aws.region;
    var bucket=config.aws.bucket;
    var imgstr="https://s3-"+region+".amazonaws.com/"+bucket+"/images/";       
    client.connect();
    var queryStr = "select * from social_media_creative where \"projectId\"=$1 and \"postingDate\"=$2 and status=$3";
    var params=[projectId, req.body.date, req.body.status]; 
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

router.get('/:projectId/social_media_creative/status/:status', function(req, res) {
    var projectId = parseInt(req.params.projectId);
    var status = req.params.status;
    var region=config.aws.region;
    var bucket=config.aws.bucket;
    var imgstr="https://s3-"+region+".amazonaws.com/"+bucket+"/images/";  
    var client = new pg.Client(config.database);        
    client.connect();
    var queryStr = "select * from social_media_creative_view where \"projectId\"=$1 and status=$2 and \"monthYear\"=$3 ORDER BY \"postingDate\" DESC";
    //var queryStr = "select * from social_media_creative where \"projectId\"=$1 and status=$2";
    var params=[projectId, status,req.query.monthYear]; 
    //var params=[projectId, status]; 
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


router.get('/:project_id/social_media_creative/:socialMediaCreativeId', function(req, res) {
    var id = parseInt(req.params.socialMediaCreativeId);
    var finalObj;
    var socialMediaFeedbackId;
    var counter = 0;
    var subcounter = 0;
    var client = new pg.Client(config.database);  
    var region=config.aws.region;
    var bucket=config.aws.bucket;
    var imgstr="https://s3-"+region+".amazonaws.com/"+bucket+"/images/";        
    client.connect();
    var queryStr = "select * from social_media_creative where id=$1" ; 
    var params=[id];  
    var query = client.query(queryStr,params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) { 
        if (result.rows[0].creativeType=='V') 
        {
          result.rows[0].videoUrl=imgstr+result.rows[0].imageCode+".mp4";
        }
        else
        {
          result.rows[0].imageUrl=imgstr+result.rows[0].imageCode+".jpeg";
        }
        finalObj=result.rows[0];
        getPlatform();         
    });
    var getPlatform=function()
    {
        var queryStr = "select * from social_media_creative_platform_view where \"socialMediaId\"=$1 ORDER BY \"platformId\""; 
        var params=[id];  
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        { 
            finalObj.description=result.rows;
            if(finalObj.status != 'A')
            {
                getFeedback();
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
    var getFeedback=function()
    {
        var queryStr = "select * from social_media_feedback where \"socialMediaCreativeId\"=$1" ; 
        var params=[id];  
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        { 
            if (result.rows.length>0) {
                for (var i=0; i<result.rows.length; i++) {
                    result.rows[i].adCopy = [];    
                }
                finalObj.feedback=result.rows;
                getCreativeFeedback();    
            }
            else {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(finalObj, null, "    ") + "\n");
                res.end();
            }
                     
        });
    }
    var getCreativeFeedback=function()
    {
        var queryStr = "select * from creative_platform_feedback_view where \"socialMediaFeedbackId\"=$1 and \"socialMediaCreativePlatformId\"=$2" ; 
        var params=[finalObj.feedback[counter].id, finalObj.description[subcounter].id];  
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        { 
            if (result.rows.length>0) 
            {
                finalObj.feedback[counter].adCopy.push(result.rows[0]);
            }
            if (++subcounter==finalObj.description.length) 
            {
                if (counter==finalObj.feedback.length-1) 
                {
                    client.end();
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(finalObj, null, "    ") + "\n");
                    res.end(); 
                }
                else
                {
                    counter++;
                    subcounter = 0;
                    getCreativeFeedback();
                }
            }  
            else {
                getCreativeFeedback();
            }         
        });
    }
})

//Approve Social Media Creatives (Set status to 'A')
router.put('/:projectId/social_media_creative/:socialMediaCreativeId', function(req, res) 
{ 
    var projectId = parseInt(req.params.projectId); 
    var socialMediaCreativeId = parseInt(req.params.socialMediaCreativeId); 
    var socialMediaFeedbackId;
    var review;
    var client = new pg.Client(config.database);
    client.connect();   
    var data=req.body;
    var email=data.email;
    var queryStr;
    var params;
    if(req.body.status=='A')
    {
        queryStr= "update social_media_creative set status=$1,\"approvalDate\"=$2 where id=$3";
        params=[req.body.status,req.body.approvalDate, socialMediaCreativeId];
    } 
    else
    {
        queryStr= "update social_media_creative set status=$1 where id=$2";
        params=[req.body.status, socialMediaCreativeId];
    }
    var query = client.query(queryStr,params, function(err, result){   
        if(err)
        {
          console.log(JSON.stringify(err));
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(err));
          res.end();
        }else{
            if (req.body.status=='R') 
            {
                insertFeedback();   
            }
            else 
            {
               // getProjectManagerId();
                // client.end();
                // res.writeHead(200, {'Content-Type': 'application/json'});
                // res.write(JSON.stringify("Successfully deleted"));
                // res.end();
                 getCreativeName();
            }
        }    
    });
    var insertFeedback=function()
    {
        //var date = new Date();
        var queryStr = "insert into social_media_feedback (\"socialMediaCreativeId\", \"creativeReview\", \"commentDate\", \"commentedBy\") values ($1,$2,$3,$4) RETURNING id";
        var params = [socialMediaCreativeId,req.body.creativeReview,req.body.commentDate, req.body.commentedBy];
        var query = client.query(queryStr,params, function(err, result){   
            if(err)
            {
              console.log(JSON.stringify(err));
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }else{          
                socialMediaFeedbackId = result.rows[0].id;  
                // client.end();
                // res.writeHead(200, {'Content-Type': 'application/json'});
                // res.write(JSON.stringify(result.rows));
                // res.end();
                //getProjectManagerId();
                // getCreativeName();
                insertReview();
            }    
        });
    }
   var insertReview=function()
    {
        review = req.body.adCopyReview;
        var queryStr="insert into creative_platform_feedback (\"socialMediaFeedbackId\",comment,\"socialMediaCreativePlatformId\") values ($1,$2,$3) RETURNING id";
        var counter=0;
        var params=[socialMediaFeedbackId, review[counter].comment, review[counter].socialMediaCreativePlatformId];
        var insertAdCopyReview=function(err,result)
        {
            if(++counter==review.length)
            {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify('success'));
                res.end();
            }
            else
            {
                params=[socialMediaFeedbackId, review[counter].comment, review[counter].socialMediaCreativePlatformId];
                query=client.query(queryStr,params,insertAdCopyReview);
            }
        }
        var query=client.query(queryStr,params,insertAdCopyReview);
    }

    var getCreativeName=function()
    {
        var queryStr = "select * from social_media_creative where id=$1";
        var params = [socialMediaCreativeId];   
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {           
            creativeName=result.rows[0].title;
            getProjectManagerId(); 
        });
    }

    var getProjectManagerId=function()
    {
        var queryStr="select \"projectManagerId\" from project where \"id\"=$1";
        var params = [projectId];
        var query = client.query(queryStr,params, function(err, result){   
            if(err)
            {
              console.log(JSON.stringify(err));
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }else{            
                projectManagerId=result.rows[0].projectManagerId;
                getManagerDetails();
            }    
        });
    }


    var mailToClient=function(){
        var newsletter = new EmailTemplate(templateDir)
        var dataas={};
        if(req.body.status=='R')
        {    
         dataas.message="SM creative reviewed for your action '"+creativeName+"'";
        }
        else
        {
         dataas.message="SM Creative approved'"+creativeName+"'";
        }    
        // dataas.username=userName;
        // dataas.password=password;
        newsletter.render(dataas, function (err, result){
        var dataa = {
           'to':email,
           // 'subject':"HashTagit Buisness View",
           'subject':"HiDigify",
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

    var getManagerDetails=function()
    {
      var queryStr = "select * from employee where id=$1" ;  
      var params = [projectManagerId]; 
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {  
            email=result.rows[0].email;
            mailToClient();
        });
    }
})

router.put('/:projectId/social_media_creative/:socialMediaCreativeId/director_approval', function(req, res) {
    var id = parseInt(req.params.socialMediaCreativeId);
    var projectId = parseInt(req.params.projectId);
    if (req.body.agencyType=='P') {
      if(req.body.status=='P')
      {
        req.body.status='A';
      }
    }
    var queryStr = "update social_media_creative set status=$1  where id=$2"; 
    var params = [req.body.status,id];
    var creativeName;
    var client = new pg.Client(config.database);
    client.connect();
    var data=req.body;
    var employeeEmail = '';
    var email=data.email;
    var query = client.query(queryStr,params, function(err, result){   
        if(err)
        {
          console.log(JSON.stringify(err));
          client.end();
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(err));
          res.end();
        }else
        {
            getCreativeName();
            //getClientDetails();
        }    
    });

    var getCreativeName=function()
    {
        var queryStr="select * from social_media_creative where id=$1";
        var params = [id];
        var query = client.query(queryStr,params, function(err, result)
        {   
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
                creativeName=result.rows[0].title;
                if(req.body.status=='P')
                {
                  if (req.body.agencyType=='A') {
                    getClientDetails();
                  }
                  else {
                    client.end();
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify("Success"));
                    res.end();
                  }
                }
                else
                {
                    // getProjectManagerId();
                    getProjectEmployeeId();
                }
                   
            }
        });
 
    }

    var getClientDetails=function()
    {
        var object={};
        object.deviceData=[];
        var queryStr="select * from project_client where \"projectId\"=$1 AND \"roleId\"=$2";
        var params = [projectId,2];
        var query = client.query(queryStr,params, function(err, result)
        {   
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
                for(var i=0;i<result.rows.length;i++)
                {
                    if(result.rows[i].deviceToken)
                    {
                        object.deviceData.push({"deviceToken":result.rows[i].deviceToken,"notificationType":result.rows[i].notificationType});
                    }
                }   
                    object.title="Creative Uploaded";
                    object.message="SM Creative '"+creativeName+"' uploaded for review";
                    utility.sendNotification(object);
                    client.end();
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify("Successfully sent Notification"));
                    res.end();   
                    //getProjectManagerId();
            }
        });
    }

    // var getProjectManagerId=function()
    // {
    //     var queryStr="select \"projectManagerId\",name from project where \"id\"=$1";
    //     var params = [projectId];
    //     var query = client.query(queryStr,params, function(err, result){   
    //         if(err)
    //         {
    //           console.log(JSON.stringify(err));
    //           client.end();
    //           res.writeHead(500, {'Content-Type': 'application/json'});
    //           res.write(JSON.stringify(err));
    //           res.end();
    //         }else{            
    //             projectManagerId=result.rows[0].projectManagerId;
    //             getManagerDetails();
    //         }    
    //     });
    // }

    var getProjectEmployeeId=function()
    {
        var queryStr="select \"employeeId\" from social_media_employee_mapping where \"projectId\"=$1";
        var params = [projectId];
        var query = client.query(queryStr,params, function(err, result){   
            if(err)
            {
              console.log(JSON.stringify(err));
              client.end();
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.write(JSON.stringify(err));
              res.end();
            }else{  
                if(result.rows.length>0)
                {
                  var employeeIdStr;
                  for(i=0, j=0,employeeIdStr=""; i<result.rows.length; i++)
                  {
                    if(result.rows[i])
                    {
                      employeeIdStr += ((j==0)?"":",") +"'"+result.rows[i].employeeId+"'";
                      j++;
                    }
                  }
                  getEmployeeEmail(employeeIdStr);
                } 
                else
                {
                  client.end();
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.write(JSON.stringify("Success"));
                  res.end();
                }         
            }    
        });
    }

    var mailToClient=function()
    {
        var newsletter = new EmailTemplate(templateDir)
        var dataas={};
        dataas.message="'"+creativeName+"' rejected. Please review and update";   
        newsletter.render(dataas, function (err, result){
        var dataa = {
           'to':employeeEmail,
           // 'subject':"HashTagit Buisness View",
           'subject':"HiDigify",
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

    // var getManagerDetails=function()
    // {
    //   var queryStr = "select * from employee where id=$1" ;  
    //   var params = [projectManagerId]; 
    //     var query = client.query(queryStr,params);
    //     query.on("row", function (row, result) { 
    //         result.addRow(row); 
    //     });
    //     query.on("end", function (result) 
    //     {  
    //         email=result.rows[0].email;
    //         mailToClient();
    //     });
    // } 

    var getEmployeeEmail=function(str)
    {

      var queryStr = "select * from employee where id in ("+str+")";
      // var queryStr = "select * from employee where id in " ;  
      // var params = [projectManagerId]; 
        var query = client.query(queryStr);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {  
            // var emails;
            for (var i=0; i<result.rows.length; i++) {
              employeeEmail += result.rows[i].email;
              if (i!=result.rows.length-1) {
                employeeEmail += ',';
              }
            }
            // email=result.rows[0].email;
            mailToClient();
        });
    }  



})

router.get('/:projectId/seo_graph', function(req, res) {
    var client = new pg.Client(config.database);  
    var projectId = parseInt(req.params.projectId);
    var entryId; 
    var finalObj={};
    finalObj.firstEntry=[];
    finalObj.lastEntry=[];
    var firstDate;
    var lastDate;
    client.connect();
    var queryStr = "select * from project_seo_entry where \"projectId\"=$1 and status='A' ORDER BY \"dateOfEntry\" DESC LIMIT 1";
    // var queryStr = "select * from project_seo_entry where \"projectId\"=$1 and status!='R' ORDER BY id";
    var params=[projectId];
    var query = client.query(queryStr,params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) {   
        if(result.rows.length>0)
        {
            entryId = result.rows[0].id;
            finalObj.lastDate = result.rows[0].dateOfEntry;
            // lastDate = result.rows[0].dateOfEntry;
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
    var getDatesValues=function()
    {
        var queryStr = "select * from project_seo_value where \"projectSeoEntryId\"=$1";
        var params=[entryId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {   
            finalObj.lastEntry = calculateRank(result.rows);            
            // finalObj.lastEntry.date = lastDate;
            getEntriesNumber();
        });
    }
    var calculateRank=function(result)
    {
        var firstRank=0;
        var firstThree=0;
        var firstFive=0;
        var firstPage=0;
        var secondPage=0;
        var thirdPageAndAbove=0;
        var notRanking=0;
        for(var i=0;i<result.length;i++)
        {
            if(result[i].value==0)
            {
                notRanking++;
            }
            if(result[i].value==1)
            {
                firstRank++;
            }
            if(result[i].value>=1 && result[i].value<4)
            {
                firstThree++;
            }
            if(result[i].value>=1 && result[i].value<6)
            {
                firstFive++;
            }
            if(result[i].value>=1 && result[i].value<11)
            {
                firstPage++;
            }
            if(result[i].value>=11 && result[i].value<21)
            {
                secondPage++;
            }
            if(result[i].value>20)
            {
                thirdPageAndAbove++;
            }
        }
        var entries = [firstRank,firstThree,firstFive,firstPage,secondPage,thirdPageAndAbove,notRanking];
        return entries;
    }
    var getEntriesNumber=function()
    {
        var queryStr = "select count (*) from project_seo_entry where \"projectId\"=$1 and status='A'";
        var params = [projectId]; 
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {  
            if (result.rows[0].count>1) {
                getProjectSeoEntry();        
            }
            else {
                client.end();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(finalObj));
                res.end();
            }
        });
    }
    var getProjectSeoEntry=function()
    {
        var queryStr = "select * from project_seo_entry where \"projectId\"=$1 and status='A' ORDER BY \"dateOfEntry\" ASC LIMIT 1";
        var params=[projectId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {   
            if(result.rows.length>0)
            {
                entryId = result.rows[0].id;
                finalObj.firstDate = result.rows[0].dateOfEntry;
                // firstDate = result.rows[0].dateOfEntry;
                getDatesValuesAscending();
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
    var getDatesValuesAscending=function()
    {
        var queryStr = "select * from project_seo_value where \"projectSeoEntryId\"=$1";
        var params=[entryId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {  
            finalObj.firstEntry = calculateRank(result.rows);
            finalObj.firstEntry.date = firstDate;
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj));
            res.end();
        });
    }
})

router.get('/:projectId/seo', function(req, res) {
    var client = new pg.Client(config.database);  
    var projectId = parseInt(req.params.projectId);   
    client.connect();
    var finalObj={};
    var dateValue;
    var reportId;
    finalObj.dates=[];
    var filter = parseInt(req.query.filter);
    var queryStr = "select * from project_seo_entry where \"projectId\"=$1 and status='A' ORDER BY \"dateOfEntry\" DESC LIMIT "+filter;
    if (filter==0) 
    {
        queryStr = "select * from project_seo_entry where \"projectId\"=$1 and status='A' ORDER BY \"dateOfEntry\" DESC";
    }    
    var params=[projectId];
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
        res.write(JSON.stringify(result.rows));
        res.end();
    }     
    });
    var getDatesValues=function()
    {
        var queryStr = "select * from project_seo_value where \"projectSeoEntryId\" in ("+dateIdsStr+")  ORDER BY \"projectSeoEntryId\" DESC";
        var query = client.query(queryStr);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) {          
            dateValue=result.rows;
            getKeywords();
        });
    }
    var getKeywords=function()
    {
        var queryStr = "select * from project_seo_keyword where \"projectId\"=$1 and status=true ORDER BY id";
        var params=[projectId];
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) { 
            finalObj.keywords=result.rows;
            for(var a=0;a<finalObj.keywords.length;a++)
            {
                finalObj.keywords[a].values=[];
            }
            for(var i=0;i<finalObj.dates.length;i++)
            {
                for(var j=0;j<finalObj.keywords.length;j++)
                {
                    var count=0;
                    for(var k=0;k<dateValue.length;k++)
                    {
                        if(finalObj.dates[i].id == dateValue[k].projectSeoEntryId && finalObj.keywords[j].id == dateValue[k].projectSeoKeywordId)
                        {
                            count++;
                            finalObj.keywords[j].values.push(dateValue[k].value);
                        }
                    }
                    if(count==0)
                    {
                      finalObj.keywords[j].values.push(0);  
                    }
                }
            }
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj));
            res.end();
        }); 
    }
})


router.get('/:projectId/seo/keywords/:keywordId', function(req, res) {
    var client = new pg.Client(config.database);  
    var projectId = parseInt(req.params.projectId); 
    var keywordId = parseInt(req.params.keywordId);   
    client.connect();
    var finalObj={};
    var dateValue;
    var reportId;
    finalObj.dates=[];
    finalObj.values=[];
    var queryStr = "select distinct \"dateOfEntry\",\"projectSeoEntryId\" from seo_keyword_view where \"seoKeywordId\"=$1 AND \"seoEntryStatus\"='A' AND value>0 ORDER BY \"dateOfEntry\" DESC";    
    var params=[keywordId];
    var query = client.query(queryStr,params);
    query.on("row", function (row, result) { 
        result.addRow(row); 
    });
    query.on("end", function (result) {   
    if(result.rows.length>0)
    {
        for(var i=0;i<result.rows.length;i++)
        {
            // result.rows[i].dateOfEntry = moment(result.rows[i].dateOfEntry).format('DD-MMM');
            finalObj.dates.push(result.rows[i].dateOfEntry)
        }
        //finalObj.dates=result.rows;
        getKeywordName();
    }  
    else
    {
        client.end();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(finalObj.dates));
        res.end();
    }     
    });

    var getKeywordName=function()
    {
        var queryStr = "select distinct name from seo_keyword_view where \"seoKeywordId\"=$1";
        var params =[keywordId]
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {          
           finalObj.name=result.rows[0].name;
           getDatesValues();
        });
    }

    var getDatesValues=function()
    {
        var queryStr = "select * from seo_keyword_view where \"seoKeywordId\" =$1 AND \"seoEntryStatus\"='A' AND value>0 ORDER BY \"dateOfEntry\" DESC";
        var params =[keywordId]
        var query = client.query(queryStr,params);
        query.on("row", function (row, result) { 
            result.addRow(row); 
        });
        query.on("end", function (result) 
        {          
            for (var i=0;i<result.rows.length; i++) 
            {
                finalObj.values.push(result.rows[i].value)
            }
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(finalObj));
            res.end();
        });
    }
})




module.exports = router