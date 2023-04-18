
const https = require('https');
const zlib = require('zlib');



const insertDB = async function(io,sql,vals) {
  try {
    const result = io.dbroutines.execSql(sql.substring(0,sql.length-6), vals);
  } catch (error) {
    console.log(error);
  }
}

const updateMTGlocalLib = async function(io,inhn,inpath){
	var options = {
		hostname:inhn,
		path:inpath,
		metho:'GET',
		headers: {
			'Content-Type': 'application/json',
			'Accept-Encoding':'gzip',
		},
		timeout:2147483647,
	};
	(async() => {
	  await io.dbroutines.execSql("delete from cards",[]).catch((error) => {
			console.error(error);
		});
	})();
	const req = https.request(options, res => {
		let data = '';
		const encoding = res.headers['content-encoding'];
		let stream = res;
		// Accumulate the response data
		if (encoding === 'gzip') {
			stream = res.pipe(zlib.createGunzip()); // decode gzip-encoded response
		}
		stream.on('data', (chunk) => {
			data += chunk;
		});
		stream.on('end', () => {
			var bData = JSON.parse(data);
			var sql = 'insert into cards values (?,?)';
			var template = sql;
			var vals = [];
			while(0 < bData.length){
				vals.push(bData[0].id);
				delete bData[0].uri;
				delete bData[0].prices;
				vals.push(JSON.stringify(bData[0]));
				sql += ',(?,?)'
				bData.splice(0,1);
				if(vals.length == 6){
					(async() => {
					  await insertDB(io,sql,vals);
					})();
					vals = [];
					sql = template;
				}
			}
			
		});
	});
	req.setTimeout(options.timeout);
	req.end();
}			




module.exports = (io) => {
	const init = function (){
		const options = {
		  hostname: 'api.scryfall.com',
		  path: '/bulk-data',
		  method: 'GET',
		  headers: {
			'Content-Type': 'application/json',
		  },
		};
		// Make the request
		const req = https.request(options, res => {
		  let data = '';

		  // Accumulate the response data
		  res.on('data', chunk => {
			data += chunk;
		  });

		  // Parse the JSON response when the request is complete
		  res.on('end', () => {
			const bulkData = JSON.parse(data);
			const fbd = bulkData.data.filter(l => {return l.type === 'default_cards'});
			const upDatedLast = new Date(fbd[0].updated_at);
			const parts = fbd[0].download_uri.split('/');
			io.dbroutines.execSql('select * from settings where setting = "updated"',[]).then(r => {
				if((r == undefined || r.length == 0) || (r && new Date(r[0]['setting val']).getTime() < upDatedLast.getTime())){
					if(r.length == 0){
						io.dbroutines.execSql("insert into settings values (?,?)",["updated",upDatedLast.getTime()]).then((r) => r);
					}else{
						io.dbroutines.execSql("update settings set setting_val = '?' where setting = ?",[upDatedLast.getTime(),"updated"]).then((r) => r);
					}
					
					updateMTGlocalLib(io,parts.slice(0, 3).join('/').slice(8), '/' + parts.slice(3).join('/'));
				}
			}).catch((error) => {
				console.error(error);
				updateMTGlocalLib(io,parts.slice(0, 3).join('/').slice(8), '/' + parts.slice(3).join('/'));
				});
		  });
		});

		// Handle any errors that occur during the request
		req.on('error', error => {
		  console.error(error);
		});

		// Send the request
		req.end();
		//io.dbroutines.execSql.(""
	}
	const search = function (input,res){
		const socket = this;
		var sql = "SELECT * FROM cards WHERE" +
			" NOT JSON_EXTRACT(json, '$.layout') LIKE '%token%' AND " +
			"(LOWER(JSON_EXTRACT(json, '$.name')) LIKE CONCAT('%', ?, '%') OR " +
			"LOWER(JSON_EXTRACT(json, '$.set')) LIKE CONCAT('%', ?, '%') OR " +
			"LOWER(JSON_EXTRACT(json, '$.set_name')) LIKE CONCAT('%', ?, '%') OR " +
			"LOWER(JSON_EXTRACT(json, '$.oracle_text')) LIKE CONCAT('%', ?, '%')) LIMIT 12";
		if(input.p){
			sql += " OFFSET " + (input.p * 12).toString();
		}
		const values = [input.s.toLowerCase(), input.s.toLowerCase(), input.s.toLowerCase(), input.s.toLowerCase()];
		var ret = [];
		io.dbroutines.execSql(sql,values).then(r => {
			r.forEach(re => {
				ret.push(JSON.parse(re.json));
			});
			res({"rows":ret,"page":!input.p?0:input.p});
		});
	}
	const searchbyids = function (input,res){
		const socket = this;
		var sql = "SELECT * FROM cards WHERE idcards in ("
		input.arr.forEach((e) => sql += "?,");
		sql = sql.substring(0,sql.length-1) + ");";
		var ret = [];
		io.dbroutines.execSql(sql,input.arr).then(r => {
			r.forEach(re => {
				ret.push(JSON.parse(re.json));
			});
			res({"rows":ret});
		});
	}
	return{
		init,
		search,
		searchbyids
	}
}
