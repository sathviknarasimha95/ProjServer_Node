'use strict';
module.exports = function(app) {
  var todomysql = require('../controllers/cont.js');


  // todoList Routes
  app.route('/login')
    .post(todomysql.login);
};

