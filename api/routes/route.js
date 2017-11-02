'use strict';
module.exports = function(app) {
  var todomysql = require('../controllers/cont.js');


  // routes
app.route('/placeorder')
    .post(todomysql.place_order);

app.route('/login')
    .post(todomysql.login);
 
app.route('/inventory')
    .get(todomysql.list_inventory);

app.route('/getorders')
    .post(todomysql.get_orders);

};
