import { getUserMedia } from 'getusermedia-js';
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var public = __dirname + "/public/";
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/node_modules'));
var directoryPath = path.join(__dirname, 'aiml');
var xml2js       = require('xml2js');
var requestify = require('requestify'); 
var parser       = new xml2js.Parser();
app.use(express.static(public));
app.use(express.static( __dirname + "/public/trainingVideo/"));
app.set("view engine","pug")  
app.use('/', express.static(public));
app.use(express.static(__dirname + '/logs'));
var botName = "ChatBot";
var userName = "User";
var io = require('socket.io').listen(server);
aimlHigh = require('aiml-high');
var interpreter = new aimlHigh({name:botName}, 'Goodbye');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: "703265807665-5bd953g155btk0vn0ao4nksbgsv8ngb5.apps.googleusercontent.com",
    clientSecret: "vw5j0lFIvinFo54BmWmupQ7V",
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ googleId: profile.id }, function (err, user) {
		console.log(profile.id); 
		return done(err, user);
       });
  }
));

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email'] }));
 

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  //passport.authenticate('google', { failureRedirect: '/index' }),
  function(req, res) {
	//console.log(res);
	res.redirect(307,'/chat');
  });

app.post('/chat', function(req, res) {
	fs.readdir(directoryPath, function (err, files) {
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		} 
		fs.readFile(__dirname + '/views/questions.xml', "utf-8", function (error, text) {
			if (error) {
				throw error;
			}else {
				parser.parseString(text, function (err, result) {
					var categories = result['categories']['category'];
					//console.log(categories);
					res.render('index', { categories:categories, botName:"Ted" });
				});
			}
		});

	});


});

app.get('/chat', function(req, res) {
	fs.readdir(directoryPath, function (err, files) {
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		} 
		fs.readFile(__dirname + '/views/questions.xml', "utf-8", function (error, text) {
			if (error) {
				throw error;
			}else {
				parser.parseString(text, function (err, result) {
					var categories = result['categories']['category'];
					//console.log(categories);
					res.render('index', { categories:categories, botName:"Ted" });
				});
			}
		});

	});

});

const capture = () => {
    // add canvas element
    const canvas = document.createElement('canvas');
    document.querySelector('body').appendChild(canvas);

    // set canvas dimensions to video ones to not truncate picture
    const videoElement = document.querySelector('#stream video');
    canvas.width = videoElement.width;
    canvas.height = videoElement.height;

    // copy full video frame into the canvas
    canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

    // get image data URL and remove canvas
    const snapshot = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);

    // update grid picture source
    document.querySelector('#grid').setAttribute('src', snapshot);
};

getUserMedia({
	video: true,
	audio: false,
	width: 640,
	height: 480,
	el: 'stream', // render live video in #stream
	swffile: require('getusermedia-js/dist/fallback/jscam_canvas_only.swf'),
  }, stream => {
	  startVideo(stream);
	  document.getElementById('capture').addEventListener('click', () => {
		  capture();
		  stopVideo(stream);
	  });
  }, err => console.error(err));

app.get('/python', function(req, res) {
	var spawn = require("child_process").spawn;
	var process = spawn("python", ["./demo.py",]);
	process.stdout.on("data", function (data) {
		res.send(data.toString());
	});
});


app.post('/', function(req, res) {
     res.render('login',{Error:''});
});
app.get('/', function(req, res) {
	 res.render('login',{Error:''});
});
app.post('/*', function(req, res) {
     res.render('login',{Error:''});
});
app.get('/*', function(req, res) {
     res.render('login',{Error:''});
})

var listFiles =[];
fs.readdir(__dirname+'/aiml/', function(err, items) {
	for (var i=0; i<items.length; i++) {
        var file = __dirname+'/aiml/'+ items[i];
        listFiles.push(file);
    }
	interpreter.loadFiles(listFiles);
});

io.sockets.on('connection', function (socket, username) {
	
	
    socket.on('little_newbie', function(username) {
		socket.username = userName;
		console.log('Client is Connected' + socket.username);
		socket.emit('message', 'Hi '+ socket.username + ', How Can I help You?');
		
	});
	socket.on('feedback', function(feedback) {
		console.log(socket.id + "|"+  feedback);
		fs.appendFile(__dirname + '/logs/feedback.csv',  socket.id + "|"+  feedback + '\r\n', function (err) {
		if (err) 
			return console.log(err);
		});
		socket.emit('feedback', 'Thank you for your feedback;'+feedback.split('|')[0]);
	});
	socket.on('message', function (message) {
	fs.appendFile(__dirname + '/logs/data.txt',  socket.username + '|'+message + '\r\n'		, function (err) {
		if (err) 
			return console.log(err);
	});
	var callback = function(answer, wildCardArray, input){
		console.log(answer + ' | ' + wildCardArray + ' | ' + input);
		if(answer == null || answer =="undefined"){
			if(message.length < 6){	
				answer ="D-uh! To make sense of it, I need your message to be at least 6 characters long.";
			}else{
				var undefinedAnswers = ["Sorry I didn’t get that! <b>" +socket.username+ "</b>. It might help if you tried re-wording that for me?",
										"Sorry, I didn’t get that. Can you give me some more context here?",
										"I don’t think I got you there. I can try again if you can ask it differently.",
				];
				answer= undefinedAnswers[Math.floor(Math.random() * undefinedAnswers.length)];	
			}
			fs.appendFile(__dirname + '/logs/undefined_questions.txt',  socket.username + '|'+message + '\r\n'		, function (err) {
				if (err) 
					return console.log(err);
			});
			
		}
		while(answer.indexOf("hyperlink")> 0){
			answer = answer.replace("hyperlink" , "a");
		}
		while(answer.indexOf(" &amp;lt ")> 0){
			answer = answer.replace(" &amp;lt " , "<");
		}
		while(answer.indexOf(" &amp;gt")> 0){
			answer = answer.replace(" &amp;gt" , ">");
		}
		while(answer.indexOf("break")> 0){
			answer = answer.replace("break" , "br/");
		}
		io.to(socket.id).emit('message', answer);
	};
	interpreter.findAnswer(message.toUpperCase(), callback);
	});
});
server.listen(8080);