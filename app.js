var express = require('express');
var app = express();
var http=require('http');
var cors = require('cors');
var vhost=require('vhost');
var bodyParser = require('body-parser');
var utility = require('./utility');
app.set('view engine', 'ejs');


app.use(bodyParser.json({limit: '50mb'}));

app.use(bodyParser.urlencoded({
 extended: true
}));

app.use(cors());

app.use('/api',require('./controllers'))


app.set('port', 3000);
http.createServer(app).listen(app.get('port'), function(){
console.log('Express server listening on port ' + app.get('port')+'dasda');
});