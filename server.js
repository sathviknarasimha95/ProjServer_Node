var express = require('express'),
  connection = require('express-myconnection'),
  mysql = require('mysql');
  app = express(),
  port = process.env.PORT || 8087;
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

var routes = require('./api/routes/route');
routes(app);


app.listen(port);

console.log('Sanjanaa Pharama RESTful API server started on: ' + port);

