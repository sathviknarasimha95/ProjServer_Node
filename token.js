var randtoken = require('rand-token');

//var token = randtoken.generate(16);


var uid = require('rand-token').uid;

var token = uid(16);


console.log(token);

