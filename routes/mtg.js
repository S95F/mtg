
//const https = require('https');
//const zlib = require('zlib');
//const JSONStream = require('JSONStream');
const request = require('request');


const MIN_REQUEST_DELAY_MS = 110; // minimum delay in milliseconds between API requests
let lastRequestTime = 0; // the timestamp of the last API request

async function delayRequest() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < MIN_REQUEST_DELAY_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_DELAY_MS - elapsed));
  }

  lastRequestTime = Date.now(); // update the timestamp of the last API request
  return Promise.resolve();
}


module.exports = (io) => {

	const search = function (input,res){
		const socket = this;

		const pageSize = 12; // the number of results to return per page
		input.p = input.p!=undefined?input.p:1;
		let gpage = input.p;
		function fuzzySearch(query) {
		  const options = {
			url: 'https://api.scryfall.com/cards/search',
			qs: {
			  q: query,
			  fuzzy: true,
			},
		  };

		  let allRows = []; // array to store all rows
		  function fetchPage(page) {
			return delayRequest().then(() => {
			  options.qs.page = page;
			  return new Promise((resolve, reject) => {
				request(options, (error, response, body) => {
				  if (error) {
					reject(error);
				  } else {
					const data = JSON.parse(body);
					allRows = allRows.concat(data.data);

					if (data.has_more && allRows.length < pageSize * page) {
					  fetchPage(page + 1).then(resolve).catch(reject);
					} else {
					  const start = pageSize * (page - 1);
					  const end = Math.min(pageSize * page, allRows.length);
					  const rows = allRows.slice(start, end);

					  resolve(rows);
					}
				  }
				});
			  });
			});
		  }

		  return fetchPage(1);
		}
		fuzzySearch(input.s).then((r) => {
			r.length === 0 && input.p > 1?input.p--:false;
			res({'rows':r,'p':input.p});
		}).catch((err) => console.log(err));
		
	}
	const searchbyids = function (input,res){
		const socket = this;
		function searchCardsByIds(ids) {
			var options = {
				uri: `https://api.scryfall.com/cards/collection`,
				method: 'POST',
				json:true,
				body:{
					"identifiers":[]
				}
			}
			ids.forEach(i => options.body.identifiers.push({"id":i}));
			console.log(options);
			return delayRequest().then(() => {
			  return new Promise((resolve, reject) => {
				request(options, (err, res, body) => {
				  if (err) {
					reject(err);
				  } else {
					lastRequestTime = Date.now(); // update the timestamp of the last API request
					resolve(body);
				  }
				});
			  });
			});
		}
		searchCardsByIds(input.arr).then((r) => {
			res(r.data);
			console.log(r.data);
		}).catch(err => console.log(err));
	}
	const searchbynames = function (input,res){
		const socket = this;
		const searchCards = (names) => {
		  const promises = names.map((name) => {
			return delayRequest().then(() => {
			  return new Promise((resolve, reject) => {
				request(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`, (error, response, body) => {
				  if (error) {
					reject(error);
				  } else {
					resolve(JSON.parse(body));
				  }
				});
			  });
			});
		  });
		  
		  return Promise.all(promises);
		};
		searchCards(input.arr).then((cards) => {
			res(cards);
		  }).catch((error) => {
			console.error(error);
			res(error);
		});
		
	}
	return{
		search,
		searchbyids,
		searchbynames
	}
}
