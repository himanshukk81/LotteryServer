var express = require('express')
  , router = express.Router()
var config = require('../../../../config');
var utility = require('../../../../utility');
var pg = require('pg');
var crypto=require('crypto')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateDir = path.join(__dirname, '../../../../templates', 'client')
var templateEmail = path.join(__dirname, '../../../../templates', 'forgotPassword')
var https = require("https");

router.post('/', function(req, res) {
    
    var client = new pg.Client(config.database);    
    client.connect();
    var linkedin = {};

    var companyId = req.body.companyId;
    var access_token = req.body.access_token;


    var startDate = new Date(req.body.startDate);
    var endDate = new Date(req.body.endDate);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);
    var startTimestamp=startDate.getTime();
    var endTimestamp=endDate.getTime();

    var request=function()
    {
      var options2 = {
          hostname: 'api.linkedin.com',
          // path: '/v1/people/~',
          // path: '/v1/companies/5163495/updates?format=json',
          // path: '/v1/companies/5163495/company-statistics?format=json',
          // path: '/v1/companies/5163495/historical-status-update-statistics?format=json&time-granularity=month&start-timestamp='+timestamp,
          path: '/v1/companies/'+companyId+'/historical-status-update-statistics:(time,like-count,impression-count,click-count,comment-count,share-count)?time-granularity=month&start-timestamp='+startTimestamp+'&end-timestamp='+endTimestamp+'&format=json',
          // path: '/v1/companies/5163495/historical-status-update-statistics:(time,like-count,impression-count,click-count,comment-count,share-count)?time-granularity=month&key=UPDATE-c9228333-6245519942939217920&format=json&start-timestamp='+timestamp,
          // path: '/v1/companies/5163495/updates/key=UPDATE-c9228333-6245519942939217920?format=json',
          headers: {
              'Content-Type': 'application/json',
              Connection: 'Keep-Alive',
              Authorization: 'Bearer ' + access_token
          }
      };
      var body="";
      var req = https.request(options2, function(res) {
        res.setEncoding('utf8');
        res.on("data", function (data) {
          body += data.toString();
        });
        res.on('end', function () {
          //body.replace('\"'{'\"');
          //body = JSON.parse(JSON.stringify(body));
          body = JSON.parse(body);
          // console.log("Values ++"+body.values);
          linkedin.analytics = {};
          if (body.values) {
            for (var i=0;i<body.values.length;i++) {
              linkedin.analytics.impressions = body.values[i].impressionCount;
              linkedin.analytics.clicks = body.values[i].clickCount;
              linkedin.analytics.interactions = body.values[i].commentCount + body.values[i].likeCount + body.values[i].shareCount;
            }
          }
          // console.log(linkedin);
          getPosts();
        });
      });
      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      req.end();
    };

    request();
    
    var start = 0;
    linkedin.posts = [];

    var getPosts=function()
    {
      var date = new Date();
      var timestamp = date.getTime();
      var options2 = {
          hostname: 'api.linkedin.com',
          // path: '/v1/people/~',
          path: '/v1/companies/'+companyId+'/updates?format=json&count=100&start='+start,
          // path: '/v1/companies/5163495/company-statistics?format=json',
          // path: '/v1/companies/5163495/historical-status-update-statistics?format=json&time-granularity=month&start-timestamp='+timestamp,
          // path: '/v1/companies/5163495/historical-status-update-statistics:(time,like-count,impression-count,click-count)?time-granularity=month&start-timestamp=1388514600000&end-timestamp=1433097000000&format=json',
          // path: '/v1/companies/5163495/historical-status-update-statistics:(time,like-count,impression-count,click-count,comment-count,share-count)?time-granularity=month&format=json&start-timestamp='+timestamp,
          headers: {
              'Content-Type': 'application/json',
              Connection: 'Keep-Alive',
              Authorization: 'Bearer ' + access_token
          }
      };

      var body="";
      var req = https.request(options2, function(result) {
        result.setEncoding('utf8');

         result.on("data", function (data) {
          body += data.toString();
        });

        result.on('end', function () {
           //console.log(body);
           //body +='}}}}}]}';
          //body = JSON.parse(JSON.stringify(body));
          // console.log(body);
          body = JSON.parse(body);
          if (body.values) {
            for (var i=0;i<body.values.length;i++) {    
              var date = new Date(body.values[i].updateContent.companyStatusUpdate.share.timestamp);
              date.toString("MMM dd");
              var obj = {};
              obj.name = body.values[i].updateContent.companyStatusUpdate.share.comment;              
              obj.date = date;
              obj.timestamp = body.values[i].updateContent.companyStatusUpdate.share.timestamp;
              if(body.values[i].updateContent.companyStatusUpdate.share.content)
              {
                obj.imageUrl = body.values[i].updateContent.companyStatusUpdate.share.content.submittedImageUrl;
              }
              linkedin.posts.push(obj);
            }
          }
          if (start<body._total) {
            start = start + 100;
            getPosts();
          }
          else {
            client.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(linkedin, null, "    ") + "\n");
            res.end();
          }
          // console.log(linkedin);
          
        });
      });
      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      req.end();
    };

})


module.exports = router