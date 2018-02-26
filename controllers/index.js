var express = require('express')
  , router = express.Router()

//  var google = require('googleapis')
// var webmaster = google.webmasters('v3');
// var request = require('request');

// var key = {};
// key.client_email = 'hashtagit@hashtagit-161908.iam.gserviceaccount.com'; 
// key.private_key = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4S5QXO7hHSH/b\n8g469jgIIw8gVVeNNVdp22lVpA/g7c/5DdNdEdgreZp8va4v0SH2noU6wsDap2ei\nN6PSUrSViDNBbiyp/l43r3UKXuieRglfVYBtwNxueZYnRWn5VyeybyZNFOfAORfF\n9s+14/x8ODunJQpUnEG3ulcS2xLUGGRXdIrZ6RrOUG6WepCEFwMz2fmKU6AtlFkJ\nOGHeKT5Kv5JHg2vC1G9ArTqr69mcd/wUdi8GczKtKEWgp5Ecr31BSfo+TPD0qCaM\nsTL83TMnJz66K0SEgO2zZIL+64imBL8sk9D2Rx/VEkyv63ldNnOPQiaeI32mAPES\ngJM73CyNAgMBAAECggEAaEFj1zWONPAuL649Z2iHMnN2IH91GaeyIpKscfdHa4yv\nbMXvX/7kI60VvxbuEsnfVuxMyNWJoMX179kpAmETzk24J9sZCe/yo7Mak9YyGnMR\n8GO4X11BsWmAMNEmpDmCQ5wEGw2SGdZfMxJlONyX4ZjDA3W8FrbdqUWm1hYCm+cm\nULi9J2bh/BlmCx4Bs06MBBp/RLp8Vcx4ihmNdEsbHe4EYKpfrREeXkHxymFVrdXS\nTwrnhaH0Rb299ul1KUVKhdy9SWWZQ5ieSSfTe3k7rbfArfrK2URVqxPzZgsRzDDU\nTsYuZ6nDWpsYhkbovFViiHVD9OXpqi2BAptXIlLDiQKBgQD9Tml9j7QOSEs/IAh5\npIE9AODznC/SabHv4jcq51QwKAG9J4+y6b1qiwe1mMUX7jRkvcoDVkyzTSzyv5DD\npB2JJbwlKkF3g+MPAcJj922SPRNU6NS+X9DwxkaE9blYA7JI5ahSCeIKVWwiaL4R\nQe5kBD9WEIPOQ1gI+vuMwlB45wKBgQD674ZH13ayVMHeGAUM8bR6/NMSoHGHni5g\nPBpkjOJreO6+rfu4LvMAnz31VyVXiouOzxkQ+8UiGxooGRR1JDmTsv7ClSmJGHxJ\nq1ywlpyufOcuSlGyhKCqoyluOuzwniFDWyifyHcRB54ZJdJze1ycvtShdbwg4ZQ+\nLkpFGxC8awKBgHceP6dnQ5IP1yrZQoMJpCju19pXkXmOcLnRFIZdgI6g0aiFCSNm\nnceTl82DCPRm9UaGpZAKLkmHOmLxSP9nluge0apcg6rTX5x4BFUETwedJxEf6KOZ\n5WTEqPbvovhLzLRRI2Vo9l5Lq21G+lKdQaDRCoPLgmAl9SlL9a1M15DzAoGBAJgi\nYcHqko75rfPtkhpP7ADoiTtwxIPZVfqIVeQCOj+4ON6n8sWuySrmYJT++afCWmwB\niQvv6IuN7OTEl8+RX8r5KVVlQ6JXkvrDBtYU6fcryKka678Ug6gQdczbss0KwdXp\nTY7Z5b4QZTyP3rCe6P4rABTHoYA54ztzqxmMmC/zAoGBAMFMkPhVZVZaghtglmSn\n4DsKcShte1CVeZO0Tkh2rn8I+lMyqwSGHT+igrNXmsCexBgyxkDqNPIUZzIAFbN1\nTjGKI7J5LRnJCsmpJGZKnMQV2vDBSv7DxE+57yeuwhqud/lI/0X/n+jA17b6ODx5\nsxA9FfOQKuYRlk4MXH1tkcd2\n-----END PRIVATE KEY-----\n';
// var OAuth2 = google.auth.OAuth2;

// var oauth2Client = new OAuth2(
//  '276356780944-5pec56qlafhpd93ga5rknlt9nem196is.apps.googleusercontent.com',
//  'WFV6TTTcJPegSldo3Vv1gzDx',
//  'http://proapptive.in'
// );

// var scopes = [
//   'https://www.googleapis.com/auth/webmasters',
//   'https://www.googleapis.com/auth/webmasters.readonly'
// ];

// var url = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: scopes,
// });

// console.log("hfhff"+url);
  

// // console.log("hello");
// var code='4/HyuDHnPd9qZS9Fi6ByLmK0XpGxZcGa4_6iUjOO3UssY#';

// var API_KEY = 'AIzaSyDxpYDA3YbyHuFdcLwS1BGPN2rwUCUb7GI';
// // var accessToken;

// oauth2Client.getToken(code, function (err, tokens) {
//   // Now tokens contains an access_token and an optional refresh_token. Save them.
//   if (!err) {
//     console.log("token:::::::;"+JSON.stringify(tokens));
//     oauth2Client.setCredentials(tokens);
//     accessToken=tokens;
//   }
// });



// // var access_token = 'ya29.GlwfBH7peyC1TrOwbVEMiIoZ_Yv_jEmRehaMv7Up0-Xxo57Hqz_TRihohRDuC_j2gMOQZaOmE9xPEeFMrtH051wbc9YAgtnvG2nUGTZ2mB0kPZuRKTZsXrKOjArJBw';

// // { access_token: 'ya29.GlsgBK-0Nue9Qjdjq3SDe-6oJ9_s_qjsOR4bCX_plzMz7-Tgoai4CC8YwkDKryK3e2rmBLljjZ1xesyNvCghPZNpJ_vZgD7bwG4e7qacikp_5SDsPNTSaIXHUyAp',
// //   refresh_token: '1/1JEWW4dHtn8XyplhxMZemCsjdm7SMRkmwXLoIrVW9yM',
// //   token_type: 'Bearer',
// //   expiry_date: 1491030481826 
// // }


// // var access_token='ya29.GlwnBJGMxilO9t9TGkmAoIoMF0XmPEc4e22tSor7pNhz6OdPG0u5a2uEphX6-vkhYfzPQyCnjI3gpKDefmXulxeOK1Ds7IJI4jmivlJYFuW7sg6WHxHUa3xpx8reQ',

// 	oauth2Client.setCredentials({
//   	access_token:'ya29.GlwnBJGMxilO9t9TGkmAoIoMF0XmPEc4e22tSor7pNhz6OdPG0u5a2uEphX6-vkhYfzPQyCnjI3gpKDefmXulxeOK1Ds7IJI4jmivlJYFuW7sg6WHxHUa3xpx8reQ',
//   	refresh_token: '1/JcLekBaCs5_3JeU0yMP-LGrqXnSyPIilfxn8uyJlWc3F6ZLJ0UpQeL_XNu8FEgYG',
//   	// Optional, provide an expiry_date (milliseconds since the Unix Epoch)
//   	expiry_date: (new Date()).getTime() + (50000 * 60 * 60 * 24 * 7)
// });

// oauth2Client.refreshAccessToken(function(err, accessToken) {
//   // your access_token is now refreshed and stored in oauth2Client
//   // store these new tokens in a safe place (e.g. database)
//   console.log("new acccess"+accessToken);
//   request(options, callback);
// });




// // { access_token: 'ya29.GlwiBJk1t-k1B6orvyXByp325X_xsZynrgxLMvzi1zNKgeoZIWjCmEuhhVo7EUZ6nIQ68u0asyb1mVHceISeZxiLNAJNXsBa_3UAVC0s7LupUkGPZL64PIb5Z78Ueg',          


// // console.log("HIII");

// var options = {
//   url: 'https://www.googleapis.com/webmasters/v3/sites/http%3A%2F%2Fhashtagit.in/urlCrawlErrorsSamples?category=soft404&platform=web&fields=urlCrawlErrorSample%2FpageUrl&key='+API_KEY,
//   headers: {
//     'User-Agent': 'request',
//     'Auth':'ya29.GlwnBMHUYJvOX7Pci4nWyycTwuhPF5UFjELNsZ3LMe_YucfIEYe5vdUlmdhVtuxUaxjSXUTJ8fdKD2y63PsC5rZXBnUKUTS9hMQa4zberMpTcUEZXFbhhujUiiangQ'
//   }


// };
// function callback(error, response, body) {


//   if (!error) {
//     var info = JSON.parse(body);
//     console.log("hiiiiiii:::   "+JSON.stringify(info));
//   }
//   else {
//     console.log(error);
//   }
// }

// request(options, callback);

router.use('/v1/app', require('./v1/app/mapping'))
router.use('/v2/admin', require('./v2/admin/mapping'))
router.use('/v2/app', require('./v2/app/mapping'))

router.get('/', function(req, res) {
  res.send('Home page')
})

router.get('/about', function(req, res) {
  res.send('Learn about us')
})
router.get('/signup', function(req, res) {
  res.send('sign up page')
})

module.exports = router