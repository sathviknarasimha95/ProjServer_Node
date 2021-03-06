'use strict';
var randtoken = require('rand-token');

exports.list_all_users = function(req, res){
  req.getConnection(function(err,connection){
       
     connection.query('SELECT * FROM sample',function(err,rows)     {
            
        if(err)
           console.log("Error Selecting : %s ",err );
     
            res.send(rows);
                           
         });
       
    });
  
};

exports.get_pending_users = function(req,res){
  req.getConnection(function(err,connection){
		var sql = "select CustomerId,CustomerName,CustomerAdd,email,CustomerMob from customer WHERE Status = 'Pending'"
		connection.query(sql,function(err,rows){
			if(err) throw err;
			res.send(rows);
		});

	});
};

exports.create_users = function(req,res){
  req.getConnection(function(err,connection){
		var name = req.param('name');
		var email = req.param('email');
		var address = req.param('address');
		var phno = req.param('phno');
		var dob = req.param('dob');
		var country = 'India';
		var state = 'karnataka';
		var post = {CustomerId:'',CustomerName:name,CustomerDob:dob,CustomerAdd:address,email:email,password:'',CustomerState:state,CustomerCuntory:country,token:'',role:'user',FirebaseToken:'',CustomerMob:phno,Status:'Pending'};
		var sql = "INSERT INTO customer SET ?";
		connection.query(sql,post,function(err,rows){
			if(err) throw err;
			res.status(200).json({status:"Registeration success"});
		});	

	});
};

exports.confirm_user = function(req,res){
    req.getConnection(function(err,connection){
		var CustomerId = req.param('CustomerId');
		var status = req.param('status');
		var email = req.param('email');
		if(status.toString() == 'Approved')
		{
			var rn = require('random-number');
			var option = {
					min:10000,
					max:99999,
					integer:true
				     }
			var password = rn(option);
			req.getConnection(function(err,connection){
				var sql = "UPDATE customer SET password = ?,Status = 'Approved' WHERE CustomerId = ?";
				connection.query(sql,[password,CustomerId],function(err,rows){
					if(err) throw err;
					res.status(200).json({status:"Updation Successful"});
					var body="Your password is "+password;
					sendmail('Conformation',email,body);
				});
			}); 		
		}
		else if(status.toString() == 'Rejected')
		{
			req.getConnection(function(err,connection){
				var sql1 = "DELETE FROM customer WHERE CustomerId = ?";
				connection.query(sql1,CustomerId,function(err,rows){
				if(err) throw err;
				res.status(200).json({status:"Deletion Successful"});
				var body = "Your Requested has been Rejected By Sanjanaa Pharma";
				sendmail('Rejected',email,body);
				});
			});
		}
	});
};
exports.otp_gen = function(req,res){
	var rn = require('random-number');
	var options = {
	  min:1000,
	  max:9999,
	  integer:true
  	}
	var rand = rn(options);
	console.log(rand);
	var OrderId = req.param('OrderId');
	req.getConnection(function(err,connection){
		var sql = "Update orders SET Otp = ? WHERE OrderId = ?";
		connection.query(sql,[rand,OrderId],function(err,rows){
			if(err) throw err;
			res.status(200).json({status:"Otp Generation Successfull",
					      OrderId:OrderId,
					      Otp:rand});
		});
		var email;
		var token;
	req.getConnection(function(err,connection){
		var sqls = "select customer.FirebaseToken,customer.email FROM customer INNER JOIN orders ON orders.CustomerId = customer.CustomerId WHERE orders.OrderId = ?";
		connection.query(sqls,OrderId,function(err,rows){
				if(err) throw err;
				email = rows[0].email;
				token = rows[0].FirebaseToken;
				console.log(email);
				console.log(token);
				var body = "Your one time password is ="+rand;
				sendnotification('Sanjanaa pharma',body,token);
				sendmail('OTP',email,body);			
			});
		});
	});
};

exports.list_inventory = function(req, res){
  req.getConnection(function(err,connection){

     connection.query('SELECT * FROM products',function(err,rows)     {

        if(err)
           console.log("Error Selecting : %s ",err );

            res.send(rows);

         });

    });

};


exports.list_products = function(req,res){
  req.getConnection(function(err,connection){
		var productType = req.param('ProductType');
		if(productType.toString() == 'All')
		{
			var sql = "SELECT * FROM products ORDER BY ProductName";
			connection.query(sql,function(err,result){
				if(err)
					console.log("Error:%s",err);
				res.send(result);
			});
		}
		else
		{
			var sql = "SELECT * FROM products WHERE ProductType = ? ORDER BY ProductName";
			connection.query(sql,productType,function(err,result){
				if(err) throw err;
				res.send(result);
			});
		}
	});
};

exports.get_orders = function(req,res){
  req.getConnection(function(err,connection){
		var CustomerId = req.param('CustomerId');
		var status= req.param('OrderStatus');
		var post = {CustomerId:CustomerId};
		if(status.toString() == 'All')
		{
			var sql = "SELECT * FROM orders where CustomerId = ? ORDER BY Date DESC";
			connection.query(sql,post,function(err,rows) {
			if(err) throw err;
			res.send(rows);
			});
		}
		else
		{
			var sql = "SELECT * FROM orders where CustomerId = ? AND OrderStatus = ? ORDER BY Date DESC";
                        connection.query(sql,[CustomerId,status],function(err,rows) {
                        if(err) throw err;
                        res.send(rows);
                        });
		}
    });
};

exports.get_orders_admin = function(req,res){
  req.getConnection(function(err,connection){
		var sql = "SELECT customer.CustomerName,orders.OrderId,orders.Date,orders.OrderPrice,orders.OrderStatus FROM (orders JOIN customer ON orders.CustomerId = customer.CustomerID)";
		connection.query(sql,function(err,rows){
		if(err) throw err;
		res.send(rows);
		});		
	});
};
exports.get_payment_history = function(req,res){
  req.getConnection(function(err,connection){
		var CustomerId = req.param('CustomerId');
		var type = req.param('Type');
		if(type.toString() == 'customer')
		{
		var sql = "select orders.OrderId,orders.OrderPrice,orders.PaymentStatus,payments.PaymentType,payments.PaymentDate FROM(orders JOIN payments ON orders.PaymentId = payments.PaymentId)WHERE orders.CustomerId = ?";
		connection.query(sql,CustomerId,function(err,rows){
		if(err) throw err;
		res.send(rows);
		});
		}
		else if(type.toString() == 'all')
		{
			var sql1 = "select orders.OrderId,orders.OrderPrice,orders.PaymentStatus,payments.PaymentType,payments.PaymentDate FROM(orders JOIN payments ON orders.PaymentId = payments.PaymentId)";
			connection.query(sql1,function(err,rows){
				if(err) throw err;
				res.send(rows);
			});
		}
	});
};
exports.get_order_admin = function(req,res){
  req.getConnection(function(err,connection){
		var status = req.param('OrderStatus');
		if(status.toString() == 'All')
		{
			var sql =" SELECT customer.CustomerName,orders.OrderId,orders.Date,orders.OrderPrice,orders.OrderStatus FROM (orders JOIN customer ON orders.CustomerId = customer.CustomerID)";
			connection.query(sql,function(err,rows){
                	if(err) throw err;
                	res.send(rows);
                	});		
		}
		else
		{
			var sql = "SELECT customer.CustomerName,orders.OrderId,orders.Date,orders.OrderPrice,orders.OrderStatus,orders.PaymentStatus FROM (orders JOIN customer ON orders.CustomerId = customer.CustomerID) WHERE orders.OrderStatus = ?";
			connection.query(sql,status,function(err,rows){
			if(err) throw err;
			res.send(rows);
			});
		}		
	});
};



exports.get_order_details = function(req,res){
  req.getConnection(function(err,connection){
		var OrderId = req.param('OrderId');
		var post = {OrderId:OrderId};
		var sql = 'SELECT orders.OrderId,orderproducts.ProductId,products.ProductName,orderproducts.UnitPrice,orders.OrderPrice,orderproducts.ProductNo FROM (((orders INNER JOIN customer ON orders.CustomerId = customer.CustomerID) JOIN orderproducts ON orders.OrderId = orderproducts.OrderId) JOIN products ON orderproducts.ProductId = products.ProductId) WHERE orders.OrderId = ? ';
		connection.query(sql,OrderId,function(err,rows) {
		if(err) throw err;
		res.send(rows);
		
	});
    });
};

exports.update_order_status = function(req,res){
  req.getConnection(function(err,connection){
		var OrderId = req.param('OrderId');
		var status = req.param('OrderStatus');
		var paymentstatus = req.param('PaymentStatus');
		var date = req.param('Date');
		console.log("Date="+date);
		var sql = "UPDATE orders SET OrderStatus = ? WHERE OrderId = ?";
		connection.query(sql,[status,OrderId],function(err,rows){
		if(err) throw err;
		res.status(200).json({ status: "Update_Successfull",
					OrderId:OrderId});
		});
		if(status.toString() == 'Completed')
		{
			if(paymentstatus == 'Unpaid')
			{
				var rn = require('random-number');
				var option = { 
					min:100,
					max:999,
					integer:true
				}
				var paymentId = rn(option);
				console.log(paymentId);
				console.log(OrderId);
				var type = 'CASH';
				console.log("Date="+date);
				var post = {PaymentId:paymentId,PaymentType:type,PaymentDate:date};
				var sql2 = "INSERT INTO payments SET ?";
				connection.query(sql2,post,function(err,rows){
					if(err) throw err;
					console.log("payments table updated");
				});
				var sql1 = "UPDATE orders SET PaymentStatus = 'Paid',PaymentId = ? WHERE OrderId = ?";
				connection.query(sql1,[paymentId,OrderId],function(err,rows){
					if(err) throw err;
					console.log(rows);
				});
			}
			
		}
		var firebasetoken;
		var email_to;
		var sql_token = "select customer.FirebaseToken,customer.email FROM customer INNER JOIN orders ON orders.CustomerId = customer.CustomerId WHERE orders.OrderId = ?";
		connection.query(sql_token,OrderId,function(err,rows){
		if(err) throw err;
		firebasetoken = rows[0].FirebaseToken;
		email_to = rows[0].email;
		if(status.toString() == 'Ongoing')
		{
			var orderstatus = "Your Order ID :"+OrderId+"Has been Accepelected";
		}
		else if(status.toString() == 'Completed')
		{
			var orderstatus = "Your Order ID:"+OrderId+"Has been Delivered";
		}
		else if(status.toString() == 'Cancelled')
		{
			var orderstatus = "Your Order ID:"+OrderId+"Has been Cancelled by Sanjanaa Pharma";
		}
		sendnotification('Sanjanaa Pharma',orderstatus,firebasetoken);
	        sendmail('Order Status',email_to,orderstatus);	
		});	
	});
};

exports.update_firebase_token = function(req,res){
  req.getConnection(function(err,connection){
		var token = req.param('token');
		var CustomerId = req.param('CustomerId');
		var sql = "UPDATE customer SET FirebaseToken = ? WHERE CustomerId = ?";
		connection.query(sql,[token,CustomerId],function(err,rows){
			if(err) throw err;
			res.status(200).json({status:"update success"});
		});
	});
};

exports.update_payment_info_razorpay = function(req,res){
  req.getConnection(function(err,connection){
				var OrderId = req.param('OrderId');
				var date = req.param('date');
				var TransactionId = req.param('transid');
				var rn = require('random-number');
                                var option = {
                                        min:100,
                                        max:999,
                                        integer:true
                                }
                                var paymentId = rn(option);
                                console.log(paymentId);
                                console.log(OrderId);
                                var type = 'CARD';
                                console.log("Date="+date);
                                var post = {PaymentId:paymentId,PaymentType:type,PaymentDate:date,TransactionId:TransactionId};
                                var sql2 = "INSERT INTO payments SET ?";
                                connection.query(sql2,post,function(err,rows){
                                        if(err) throw err;
                                        console.log("payments table updated");
                                });
                                var sql1 = "UPDATE orders SET PaymentStatus = 'Paid',PaymentId = ? WHERE OrderId = ?";
                                connection.query(sql1,[paymentId,OrderId],function(err,rows){
                                        if(err) throw err;
                                        console.log(rows);
					res.status(200).json({status:"Successfull"});	
					
                                });
	});
};
exports.get_payment_details = function(req,res){
  req.getConnection(function(err,connection){
		var CustomerId = req.param('CustomerId');
		var status = req.param('status');
		console.log(CustomerId);
		console.log(status);
		var sql = "select orders.OrderId,orders.OrderPrice,orders.Date,orders.OrderStatus,orders.PaymentStatus from orders WHERE orders.CustomerId = ? AND orders.PaymentStatus = ?";
		connection.query(sql,[CustomerId,status],function(err,rows){
			if(err)throw err;
			res.send(rows);
		});
	});
};

function sendmail(subject,to,text){
 	var nodemailer = require('nodemailer');

	let transporter = nodemailer.createTransport({
  	service: 'gmail',
  	secure: false,
  	port: 25,
  	auth: {
    	user: 'sanjanaapharma@gmail.com',
    	pass: '23061960'
  	},
  	tls: {
    		rejectUnauthorized: false
  	}
	});

	let HelperOptions = {
  	from: '"Sanjanaa Pharma" <sanjanaapharma@gmail.com',
  	to: to,
 	subject: subject,
  	text: text
	};



  	transporter.sendMail(HelperOptions, (error, info) => {
    	if (error) {
      		return console.log(error);
    	}
    	console.log("The message was sent!");
    	console.log(info);
  	});
};

exports.place_order = function(req,res) { 
  req.getConnection(function(err,connection){
	
	//var id = req.param('id');
	var OrderIds = req.param('OrderId');
	var CustomerIds = req.param('CustomerId');
	var Dates = req.param('Date');
	var OrderPrices = req.param('OrderPrice');
	var itemNames = req.param('itemName');
	var itemPrice = req.param('itemPrice');
	var productId = req.param('ProductId');
	var productNo = req.param('ProductNo');
	console.log(OrderIds);
	console.log(CustomerIds);
	console.log(Dates);
	console.log(OrderPrices);
	console.log(itemNames);
	console.log(productId);
	console.log(itemPrice);
	console.log(productNo);
	console.log("length="+productId.length);
	console.log("is array="+Array.isArray(productId));
	var values = [];
	if(Array.isArray(productId))
	{
		for(var i =0;i<productId.length;i++)
		{
		values.push([OrderIds,productId[i],itemPrice[i],productNo[i]]);
		console.log(OrderIds,productId[i]);
		}
	}
	else
	{
		values.push([OrderIds,productId,itemPrice,productNo]);
	}
	console.log(productId);
	console.log("valus="+values);
	var post = {id:'',OrderId:OrderIds,CustomerId:CustomerIds,Date:Dates,OrderPrice:OrderPrices,OrderStatus:'Pending'};
	//console.log(post);
	connection.query('INSERT INTO orders SET ?',post,function(err,result){
				if(err) throw err;
				//res.send("1 row inserted");
				//console.log("1 row inserted");
		});
	var sql= "INSERT INTO orderproducts(OrderId,ProductId,UnitPrice,ProductNo) VALUES ?";
	connection.query(sql,[values],function(err,result){
				if(err) throw err;	
				console.log("Number of effected rows:"+result.affectedRows);
				res.status(200).json({ status: "Order_Successfull",
						       OrderId:OrderIds});	
		});
	var firebasetoken;
	var sqls = "SELECT FirebaseToken FROM customer WHERE CustomerId = ?";
	connection.query(sqls,CustomerIds,function(err,result){
			if(err) throw err;
			firebasetoken = result[0].FirebaseToken;
			console.log(firebasetoken);
			sendnotification('sanjanaa pharma','Order Successfully placed',firebasetoken);
		});
	});

};

exports.login = function(req,res) { 
  req.getConnection(function(err,connection){
	
	var email = req.param('email');
	var password = req.param('password'); 
	connection.query('SELECT * FROM customer WHERE email = ?',email,function(err,result){
				if(err) throw err;
				if(!result.length){
					res.json({ status:"No_such_users_found",
						   token: "NULL",
						   username:"NULL",
						   role:"NULL",
						   CustomerId:"NULL"});	
				} else if(!(result[0].password == password)) {
				    	res.json({ status:"password_is_incorrect",
						   token:"NULL",
						   username:"NULL",
						   role:"NULL",
						   CustomerId:"NULL"});
				  } else{
					 var tokens = randtoken.generate(16);
					 connection.query("UPDATE customer SET token = '"+tokens+"' WHERE email = ?",email,function(errs,result){
					 		if(errs) throw errs;
							console.log('success');
					 });
						 	console.log(result[0].CustomerName);
					 res.status(200).json({ status: "login_successfull",
								token:tokens,
								username:result[0].CustomerName,
								role:result[0].role,
								CustomerId:result[0].CustomerId});	
					}
			});
	});
};


function getFirebase(CustomerId,connection,err,cb)
{
	var firetoken;
	console.log(CustomerId);
	connection.query('SELECT FirebaseToken FROM customer WHERE CustomerId = ?',CustomerId,function(Err,result){
		firetoken = result[0].FirebaseToken;
		});
	 cb(firetoken);
}

function sendnotification(title,body,token)
{
	var FCM = require('fcm-push');

	var serverKey = 'AIzaSyCJlkmkuaWJh9s7iUTThOXFbGnhMfvUtGk';
	var fcm = new FCM(serverKey);

	var message = {
    	to: token, // required fill with device token or topics
    	collapse_key: 'new_messages', 
    	data: {
        	id:1
    	},
    	notification: {
        	title: title,
        	body: body
    		}
	};

	//callback style
	fcm.send(message, function(err, response){
    	if (err) {
        	console.log("Something has gone wrong!");
    	} else {
        	console.log("Successfully sent with response: ", response);
 	}
  });
}
