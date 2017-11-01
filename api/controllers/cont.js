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

     connection.query('SELECT * FROM inventory',function(err,rows)     {

        if(err)
           console.log("Error Selecting : %s ",err );

            res.send(rows);

         });

    });

};



exports.creat_users = function(req,res) { 
  req.getConnection(function(err,connection){
	
	var id = req.param('id');
	var name = req.param('name');;
	console.log(id);
	console.log(name);
	var post = {id:id,name:name};
	console.log(post.id);
	connection.query('INSERT INTO sample SET ?',post,function(err,result) {
				if(err) throw err;
				res.send("1 row inserted");
			});
	});
};

exports.login = function(req,res) { 
  req.getConnection(function(err,connection){
	
	var email = req.param('email');
	var password = req.param('password'); 
	connection.query('SELECT * FROM login WHERE email = ?',email,function(err,result){
				if(err) throw err;
				if(!result.length){
					res.json({ status:"No_such_users_found",
						   token: "NULL",
						   username:"NULL"});	
				} else if(!(result[0].password == password)) {
				    	res.json({ status:"password_is_incorrect",
						   token:"NULL",
						   username:"NULL"});
				  } else{
					 var tokens = randtoken.generate(16);
					 connection.query("UPDATE login SET token = '"+tokens+"' WHERE email = ?",email,function(errs,result){
					 		if(errs) throw errs;
							console.log('success');
					 });
						 	console.log(result[0].name);
					 res.status(200).json({ status: "login_successfull",
								token:tokens,
								username:result[0].name,
								role:result[0].role});	
					}
			});
	});
};
