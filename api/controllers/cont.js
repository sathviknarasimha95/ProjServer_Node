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

exports.list_inventory = function(req, res){
  req.getConnection(function(err,connection){

     connection.query('SELECT * FROM products',function(err,rows)     {

        if(err)
           console.log("Error Selecting : %s ",err );

            res.send(rows);

         });

    });

};

exports.get_orders = function(req,res){
  req.getConnection(function(err,connection){
		var CustomerId = req.param('CustomerId');
		var post = {CustomerId:CustomerId};
		var sql = "SELECT * FROM orders where CustomerId = ?";
		connection.query(sql,post,function(err,rows) {
		if(err) throw err;
		res.send(rows);
		
	});
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
	console.log(OrderIds);
	console.log(CustomerIds);
	console.log(Dates);
	console.log(OrderPrices);
	console.log(itemNames);
	console.log(productId);
	var values = [];
	for(var i =0;i<productId.length;i++)
	{
		values.push([OrderIds,productId[i],itemPrice[i]]);
		console.log(OrderIds,productId[i]);
	}
	console.log(values);
	var post = {id:'',OrderId:OrderIds,CustomerId:CustomerIds,Date:Dates,OrderPrice:OrderPrices};
	//console.log(post);
	connection.query('INSERT INTO orders SET ?',post,function(err,result){
				if(err) throw err;
				//res.send("1 row inserted");
				//console.log("1 row inserted");
		});
	var sql= "INSERT INTO orderproducts(OrderId,ProductId,UnitPrice) VALUES ?";
	connection.query(sql,[values],function(err,result){
				if(err) throw err;	
				console.log("Number of effected rows:"+result.affectedRows);
				res.status(200).json({ status: "Order_Successfull",
						       OrderId:OrderIds});	
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
