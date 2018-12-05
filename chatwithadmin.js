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
app.set("view engine","pug")  
app.use('/', express.static(public));
var botName = "ChatBot";
var userName = "User";
var io = require('socket.io').listen(server);
aimlHigh = require('aiml-high');
var interpreter = new aimlHigh({name:botName}, 'Goodbye');

app.post('/chat', function(req, res) {
		var respBTdir = null;
		userName = req.body.username.trim();
		var strBTDir = requestify.get('http://directory.intra.bt.com/pls/ids/people.csv?bid='+userName+'&all_data_items=Y&mydata=Y&qry_info=N').then(function(response) {
			respBTdir = response.getBody().trim();
			respBTdir = respBTdir.split("\n");
			
			// Get first row for column headers
			if(respBTdir.length == 2){
				headers = respBTdir.shift().split(",");
				values = respBTdir[0].split(",");
				boatID = values[21].replace(/"/g, '');
				console.log(boatID);
				if(userName.toUpperCase() == boatID.toUpperCase()){	
					
					userName = values[2].replace(/"/g, '');
					companyName = values[43].replace(/"/g, '');
					console.log("Company Name:"+companyName);
					 
					if(companyName =="Accenture" ){
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
									res.render('index', { categories:categories, botName:"asKed" });
								});
							}
						});

					});
					}else{
						fs.readdir(directoryPath, function (err, files) {
						if (err) {
							return console.log('Unable to scan directory: ' + err);
						} 
						fs.readFile(__dirname + '/views/questionsBT.xml', "utf-8", function (error, text) {
							if (error) {
								throw error;
							}else {
								parser.parseString(text, function (err, result) {
									var categories = result['categories']['category'];
									//console.log(categories);
									res.render('index', { categories:categories, botName:"asKed" });
								});
							}
						});

					});
					}
						
				}else{
					res.render('login', {Error:"Please Enter Valid Boat ID"});
				}
		}else{
			 res.render('login', {Error:"Please Enter Valid Boat ID"});
		}
	});
		
});

app.get('/chat', function(req, res) {
     res.render('login', {Error:''});
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
server.listen(3030);