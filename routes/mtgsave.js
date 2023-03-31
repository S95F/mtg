






function setCookie(socket){
	socket.cookie = socket.request.headers.cookie;
	socket.cookie = socket.cookie.split(";");
	socket.cookie = socket.cookie[0].split("=")[1];
}






module.exports = (io) => {
	const save = function(data,cb){
		if(this.cookie != undefined){
			setCookie(this);
			io.dbroutines.execSql("select email from users where cookie = ?",[this.cookie]).then((r,err) => {
				if(err){
					console.log(error);
					cb({"success":false});
				}
				else{
					const email = r[0].email;
					io.dbroutines.execSql("delete from decks where uuid = ?",[email]).then((r,err) => {
						if(err){
							console.log(error);
							cb({"success":false});
						}
						else{
							io.dbroutines.execSql("insert into decks values (?,?)",[email,JSON.stringify(data.objs)]).then((r,err) => {
								if(err){
									console.log(error);
									cb({"success":false});
								}
								else{
									cb({"success":true});
								}
							}).catch(err => console.log(err));
						}
					}).catch((err) => console.log(err));
				}
			}).catch(err => console.log(err));
		}else{
			cb({"success":false});
		}
		
	}
	const load = function(cb) {
		setCookie(this);
		io.dbroutines.execSql("select email from users where cookie = ?",[this.cookie]).then((r,err) => {
			if(err){
				console.log(error);
				cb({"success":false});
			}
			else if(r.length > 0){
				const email = r[0].email;
				io.dbroutines.execSql("select * from decks where uuid = ?",[email]).then((r,err) => {
					if(err){
						console.log(error);
						cb({"success":false});
					}
					else{
						cb({"success":true,"data":JSON.parse(r[0].decks)});
					}
				}).catch((err) => console.log(err));
			}else{
				cb({"success":false});
			}
		}).catch(err => console.log(err));
	}
	
	
	
	return {	
		save,
		load,
	}
}
