var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'as',
	password : 'mysqlas',
	database : 'nodelogin'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/home.html'));
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/loginpage', function(request, response) {
	response.sendFile(path.join(__dirname + '/loginpage.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				console.log("Loggedin as: " + username);
				response.sendFile(path.join(__dirname + '/home_loggedin.html'));
				// response.redirect('/homeloggedin');
			} else {
				response.send('Incorrect Username and/or Password!');
				response.end();
			}			
			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/signup', function(request, response) {
	var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;
	if (username && password && email) {
        connection.query('SELECT * FROM accounts WHERE email = ?', [email], function(error, results, fields) {
			if (results.length > 0) {
                console.log("This email is already registered with us...");
				response.redirect('/register');
				response.end();
			} else {
                connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(error, results, fields) {}); 
				request.session.loggedin = true;
				request.session.username = username;
				console.log("Loggedin as: " + username);
				response.sendFile(path.join(__dirname + '/home_loggedin.html'));         
			}			
			
		});

	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/logout', function(request, response) {
	if (request.session.loggedin) {
		console.log(request.session.username + " Logged out...");
		request.session.loggedin = false;
		request.session.username = null;
		response.redirect('/');
	} else {
        response.send('Please login to view this page!');
	}
	response.end();
});
app.listen(3000);