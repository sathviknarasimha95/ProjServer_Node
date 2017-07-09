'use strict';
module.exports = function(app) {
  var todomysql = require('../controllers/cont.js');


  // todoList Routes
  app.route('/users')
    .get(todomysql.list_all_users)
    .post(todomysql.creat_users);

  app.route('/login')
    .post(todomysql.login);
};

