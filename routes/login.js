


const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');


function successLogin(data,cb,io,emitF,newAcc=false){
	bcrypt.genSalt(10, (err,saltpass) =>{
		if(err){
			throw err;
		}
		bcrypt.hash(data.password, saltpass, (err, hash) =>{
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(data.email, salt, (err, hashacc) => {
					const expires = new Date(Date.now() + 60 * 60 * 1000 * 4);
					var sql = newAcc?"insert into users (email,password,cookie,timeout) values (?,?,?,?)":"update users set password = ?, cookie = ?, timeout = ? where email = ?;";
					var values = newAcc?[data.email,hash,hashacc,expires]:[hash,hashacc,expires,data.email];
					io.dbroutines.execSql(sql,values).then((r) => {
						emitF("cookieSet",'cookie=' + hashacc + ';expires=' + expires + '; path=/');
						cb({success:true});
					}).catch(err => console.log(err));
				});
			});
		});
	});
}


module.exports = (io) => {

	const createAccount = function(data,cb){
		const socket = this;
		// Generate salt for the password hash
		bcrypt.genSalt(10, (err, salt) => {
			if (err) {
				throw err;
			}
			// Store the hashed password in the database
			io.dbroutines.execSql("select * from users where email = ?",[data.email]).then((r) => {
				if(r && r.length > 0){
					cb({success:false,email:true});
				}else{
					function emitThis(f,d){
						socket.emit(f,d)
						socket.handshake.headers.cookie = d;
					}
					successLogin(data,cb,io,emitThis,true);
					
				}
			}).catch(err => {
				console.log(err);
				cb({success:false});
			});
		});
	}
	const loginAccount = function(data,cb){
		const socket = this;
		io.dbroutines.execSql("select * from users where email = ?",[data.email]).then((r) => {
		if(!r || r.length == 0){
			cb({success:false,email:true});
		}else{
			bcrypt.compare(data.password,r[0].password,function(err,isMatch){
				if(err){
					throw new Error('Error while comparing the password');
				}
				if(isMatch){
					function emitThis(f,d){
						socket.emit(f,d);
						socket.handshake.headers.cookie = d;
					}
					successLogin(data,cb,io,emitThis);
				}
			});
		}
		}).catch(err => {
			console.log(err);
			cb({success:false});
		});
	}



	return {
		createAccount,
		loginAccount
	
	}


}
