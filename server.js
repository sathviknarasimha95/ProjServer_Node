var express = require('express'),
  connection = require('express-myconnection'),
  mysql = require('mysql');
  app = express(),
  port = process.env.PORT || 2304;
  bodyParser = require('body-parser');
  var randtoken = require('rand-token');
  app.use(
    
    connection(mysql,{
        
        host: 'localhost',
        user: 'root',
        password : 'greatgrass',
        database:'sampleDB'
    },'request')
);  




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/users');
routes(app);


app.listen(port);

console.log('todo list RESTful API server started on: ' + port);

