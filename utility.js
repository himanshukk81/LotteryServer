var config = require('./config');
// var transporter = nodemailer.createTransport('SMTP', transport);
var http = require('http');

  function sendApnsNotification(msg, deviceTokens) {

    var options = {
      token: config.apnsToken,
      production:true,
    };

    var apnProvider = new apn.Provider(options);

    //var myDevice = new apn.Device(msg.deviceToken);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    //note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = msg.message;
    if(msg.payload){
      note.payload = msg.payload;      
    }
    note.topic = config.appBundleId;

    //apnProvider.send(note, deviceTokens);

    apnProvider.send(note, deviceTokens).then( (response) => {
        response.sent.forEach( (token) => {
          //console.log("Status---------------------------------------Sucess");
        });
        response.failed.forEach( (failure) => {
            if (failure.error) {
                // A transport-level error occurred (e.g. network problem)
              //console.log("Status---------------------------------------FAIL 1");
            } else {
                // `failure.status` is the HTTP status code
                // `failure.response` is the JSON payload 
              //console.log("Status---------------------------------------FAIL 2");
            }
        });
    });
    // body...
  }

module.exports = {
  getRandomStringWithLength: function(length){
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // var chars = '0123456789';
    length = length || 10;
    var string = '', rnd;
    while (length > 0) {
      rnd = Math.floor(Math.random() * chars.length);
      string += chars.charAt(rnd);
      length--;
    }
    return string;
  },
  sendMail:function(data){
    var mailOptions={
      to : data.to,
      cc : data.cc, 
      subject : data.subject,
      text : data.text,
      html: data.html,
      from: config.email.auth.user
    }      
    transporter.sendMail(mailOptions, function(error, response){
      if(error){
        console.log(error);   
      }else{
        console.log("Message sent: " + response.message);
      }
    });
  },
    // Sample JSON structure required while sending notifcations.

  // {
  //  "title":"Group Message",
  //  "message":"Shahid95 : hello testing message",
  //  "payload":
  //  {
  //    "groupId":65,
  //    "senderId":95
  //  },
  //  "deviceData":
  //  [
  //    {
  //      "deviceToken":"APA91bEi6bjMYiVD966mKa5Jl4aC1eO9J2puIOC-u1l1zswSkU4W_aETLsNgATChuMYpKmXVuSWDvYtQPM6O5u4ktmLOllfzcP7yF5Pw4WN1In-t7SfAosV4shFwKdiZeh-O5WZwILSn",
  //      "notificationType":"gcm"
  //    },
  //    {
  //      "deviceToken":"3e2f5d942c593952062dfb07c238b950b1a8960274a297730e4fb1bef3966218",
  //      "notificationType":"apns"
  //    }
  //  ]
  // }    

  sendNotification :function(msg)
  {
    //console.log("MSG IS -----------------"+JSON.stringify(msg));
    var gcmDeviceTokens = [];
    var apnsDeviceTokens = [];

    var deviceTokens=[];
    for(var i=0;i<msg.deviceData.length;i++)
    {
      if(msg.deviceData[i].notificationType == "gcm"){
          gcmDeviceTokens.push(msg.deviceData[i].deviceToken);  
      }else{
        apnsDeviceTokens.push(msg.deviceData[i].deviceToken);
      }
      // deviceTokens.push(msg.deviceData[i].deviceToken);
    }
    if(gcmDeviceTokens.length>0){
        sendGcmNotification(msg, gcmDeviceTokens);        
    }
    if(apnsDeviceTokens.length>0){
      sendApnsNotification(msg, apnsDeviceTokens);
    }        
 }

};