//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;


var http = require('http');
var https = require('https');
var DomParser = require('dom-parser');
var parser = new DomParser();
var q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var firstImageSearchLoad = require('first-image-search-load');

app.all('/searchSong', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.all('/testRec', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
 app.all('/testSea', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
  });
 app.all('/recommandations', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
  });
app.get('/searchSong', (req, res) => searchSong(req, res));
app.get('/testRec', (req, res) => testRec(req, res));
app.get('/testSea', (req, res) => testSea(req, res));
app.get('/recommandations', (req, res) => recommandations(req, res));

function testRec(req, res){

	res.send({"searchables":["It ain't me" ,"firestone","asdasd" ,"youngblood"]});
}

function testSea(req, res){
  res.send({
    "artist":["Ludo", "Adrien"],
    "songName":"Vient ici mon petit ami",
    "image":"d:/e164358/Bureau/qCY-X_8L_400x400.png",
    "code": req.query.code});
}

function recommandations(req, res){

  if (req.query.songName.replace(' ', '+') != ''){
    console.log('https://ws.audioscrobbler.com/2.0/?method=track.search&track=' + req.query.songName.replace(' ', '+') + '&api_key=7d1f4290c75e677631bb85dd87e40afb&format=json');
  https.get('https://ws.audioscrobbler.com/2.0/?method=track.search&track=' + req.query.songName.replace(' ', '+') + '&api_key=7d1f4290c75e677631bb85dd87e40afb&format=json', (resp4) => {
    let data4 = "";

    // A chunk of data has been recieved.
    resp4.on('data', (chunk2) => {
      let data = Buffer.from(chunk2);
      console.log('buffer');
      console.log(chunk2.toString('utf8'));
      console.log('buffer2');
    });

    // The whole response has been received. Print out the result.
    resp4.on('end', () => {
      console.log(data4);
      res.send(data4);
      var js = JSON.parse(data4);
      var final = [];

      var tracks = [];
      var artists = [];
      for (var i in js.results.trackmatches.track){
          var name = js.results.trackmatches.track[i].name;
          var artist = js.results.trackmatches.track[i].artist;
          console.log(tracks);
          if (name != "" && artist != ""){
          if ((tracks.contains(name) && artists.contains(artist)) || (tracks.contains2(name) && artists.contains(artist)) || (tracks.contains(name) && artists.contains2(artist)) || (tracks.contains2(name) && artists.contains2(artist))) {

          }else{
            tracks.push(name);
            artists.push(artist);
            final.push({
              search: name + " " + artist
            });

          }
        }
      }

      res.send({"searchables":finals});

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
}





function searchSong(req, res){
  https.get('https://www.google.com/search?q=' + req.query.songName.replace(' ', '+') + '+chanson&rlz=1C1GCEA_enCA771CA771&oq=maman+chanson&aqs=chrome.0.69i59j0l5.2689j0j7&sourceid=chrome&ie=UTF-8', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {

      var dict = {};
      var text = '';
      doc = parser.parseFromString(data, "text/xml");
      if (doc.getElementsByClassName('VBt9Dc hp-xpdbox').length == 1){
      for (i = 1; i < doc.getElementsByClassName('V7Q8V').length ; i++){
        if (doc.getElementsByClassName('V7Q8V')[i].childNodes.length > 0){
              if ((doc.getElementsByClassName('V7Q8V')[i].childNodes[0].innerHTML == "Artist: ") ||  (doc.getElementsByClassName('V7Q8V')[i].childNodes[0].innerHTML == "Artists: ")){
                  var artists = [];
                  var arr = doc.getElementsByClassName('V7Q8V')[i].childNodes[1].childNodes;
                  for (j = 0; j < arr.length; j++){
                    var val = doc.getElementsByClassName('V7Q8V')[i].childNodes[1].childNodes[j];
                    if (val.nodeType == 1){
                      artists.push({"artist": val.innerHTML});
                    }
                  }

                  dict.artist = artists;
              }
              if ((doc.getElementsByClassName('V7Q8V')[i].childNodes[0].innerHTML == "Album: ")){
                  var val = doc.getElementsByClassName('V7Q8V')[i].childNodes[1].childNodes[0];
                  dict.album = val.innerHTML;
              }

              if ((doc.getElementsByClassName('V7Q8V')[i].childNodes[0].innerHTML == "Released: ")){
                  var val = doc.getElementsByClassName('V7Q8V')[i].childNodes[1];
                  dict.date = val.innerHTML;
              }
              if ((doc.getElementsByClassName('V7Q8V')[i].childNodes[0].innerHTML == "Genre: ")){
                  var val = doc.getElementsByClassName('V7Q8V')[i].childNodes[1];
                  dict.genre = val.innerHTML;
              }
          }
      }
      var text = "";

      if (dict['album'] != undefined){
        text += dict['album'].replace(' ', '+');

      }else{
        text += req.query.songName.replace(' ', '+');
      }
      if (dict['artist'] != undefined){
        for (k = 0; k<dict['artist'].length; k++){
          text += dict['artist'][k]['artist'].replace(' ', '+');
        }
      }
      https.get('https://www.google.com/search?q=' + text + '+album&hl=fr&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiA48-toYjhAhWkzlkKHZXzAAgQ_AUIDigB&cshid=1552794271517639&biw=362&bih=615', (resp) => {
        let data2 = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk2) => {
          data2 += chunk2;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          doc2 = parser.parseFromString(data2, "text/xml");
          var url = doc2.getElementsByClassName('images_table')[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].getAttribute('src');
          dict.image = url;
          if ((doc.getElementsByClassName('p9j1ue').length != 0)){

              dict.name = doc.getElementsByClassName('p9j1ue')[0].getElementsByTagName('b')[doc.getElementsByClassName('p9j1ue')[0].getElementsByTagName('b').length - 1].innerHTML;
          }


          var text2 = req.query.songName + " ";




          if (dict['artist'] != undefined){
            for (k = 0; k<dict['artist'].length; k++){
              text2 += dict['artist'][k]['artist'].replace(' ', '+');
            }
          }
          text2 = text2.replace(' ', '+');

          https.get('https://www.youtube.com/results?search_query=' + text2 + '+audio', (resp4) => {
            let data4 = '';

            // A chunk of data has been recieved.
            resp4.on('data', (chunk2) => {
              data4 += chunk2;
            });

            // The whole response has been received. Print out the result.
            resp4.on('end', () => {
              doc4 = parser.parseFromString(data4, "text/xml");
              if (doc4.getElementsByClassName(' yt-uix-sessionlink      spf-link ').length != 0){
                  dict.source = 'https://www.youtube.com' + doc4.getElementsByClassName(' yt-uix-sessionlink      spf-link ')[0].getAttribute('href');
              }
              dict.code = req.query.code;
              res.send(dict);
            });

          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });

    }else{
      text = 'no song';
      res.send(text);
    }


    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
Array.prototype.contains = function(element){
    for (i =0; i < this.length; i++){
      console.log(this[i]);
      console.log(element);
      if (element != undefined && this[i] != undefined){
      if (this[i].includes(element) == true){
        return true
      }
    }

    }
    return false
};
Array.prototype.contains2 = function(element){
    for (i =0; i < this.length; i++){
    if (element != undefined && this[i] != undefined){
      if (element.includes(this[i]) == true){
        return true
      }
    }
  }
    return false
};
