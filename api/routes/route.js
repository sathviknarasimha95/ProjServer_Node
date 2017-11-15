'use strict';
module.exports = function(app) {
  var todomysql = require('../controllers/cont.js');


  // routes
app.route('/placeorder')
    .post(todomysql.place_order);

app.route('/login')
    .post(todomysql.login);


app.route('/otpgen')
    .post(todomysql.otp_gen);
 
app.route('/inventory')
    .get(todomysql.list_inventory)
    .post(todomysql.list_products);

app.route('/getorders')
    .post(todomysql.get_orders)
    .get(todomysql.get_orders_admin);

app.route('/getorderadmin')
    .post(todomysql.get_order_admin);

app.route('/updatetoken')
    .post(todomysql.update_firebase_token);

app.route('/getorderdetails')
    .post(todomysql.get_order_details);

app.route('/updateorderstatus')
    .post(todomysql.update_order_status);

app.route('/getpaymentdetails')
    .post(todomysql.get_payment_details);

app.route('/getpaymenthistory')
    .post(todomysql.get_payment_history);

app.route('/updatepaymentrazor')
    .post(todomysql.update_payment_info_razorpay);

app.route('/createusers')
    .post(todomysql.create_users);

app.route('/confirmusers')
    .post(todomysql.confirm_user);

app.route('/getpendingusers')
    .get(todomysql.get_pending_users);
};

