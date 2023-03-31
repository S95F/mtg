


function stringify(input){
		if(input instanceof Array){
			var temp = '['
			for(const i in input){
				temp += stringify(input[i]) + ','
			}
			if(temp[temp.length-1] == ','){
				temp = temp.slice(0,temp.length-1) + ']'
			}else{
				temp += ']'
			}
			return temp
		}else if(input instanceof Object){
			var temp = '{'
			for(const property in input){
				temp += '"'+property+'"' + ':' +stringify(input[property])+',';
			}
			if(temp[temp.length-1] == ','){
				temp = temp.slice(0,temp.length-1) + '}'
			}else{
				temp += '}'
			}
			return temp;
		}else if(typeof input == 'number'){
			return input.toString();
		}else if(typeof input == 'string'){
			return '"' + input.replace('\n','').replace('\n','').replace('\n','') + '"'
		}else if(typeof input == 'boolean'){
			return input.toString();
		}else if(typeof input == 'object'){
			var temp = '{'
			for(const property in input){
				temp += '"'+property+'"' + ':' +stringify(input[property])+',';
			}
			if(temp[temp.length-1] == ','){
				temp = temp.slice(0,temp.length-1) + '}'
			}else{
				temp += '}'
			}
			return temp;	
		}else{
			console.log(input+ ' ' + typeof input);
			return "ERROR IN JSON TO STRING"
		}
}


var socket;

function getAttributes(element) {
  const attributes = element.attributes;
  const result = {};
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    if (attribute.nodeName !== 'class') {
      result[attribute.nodeName] = attribute.nodeValue;
    }
  }
  return result;
}


function download(content, fileName, contentType = 'text/plain') {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function saveDeck(e){
	e.preventDefault();
	var c = [].slice.call(document.getElementById('dIb').children);
	var json = {"objs":[]};
	c.forEach(d => {
		var containers = [].slice.call(d.children).filter(e => e.classList.contains("deckContainer"));
		var name = [].slice.call(d.children).filter(e => e.classList.contains("decks"))[0];
		var jTemp = {"name":name.innerHTML}
		containers.forEach((dc,i) => {
			var n2 = [].slice.call(dc.children).filter(e => e.classList.contains("decks"));
			if(n2.length==0){
				n2 = containers.length>1?"Pack #"+i:"Deck";
			}else{
				console.log(n2);
				n2 = n2[0].innerHTML;
			}
			var cj = [];
			var cards = [].slice.call(dc.children).filter(e => e.classList.contains("card"));
			cards.forEach(card => {
				var c = getAttributes(card);
				if('allparts' in c){
					c['allparts'] = JSON.parse(c['allparts']);
				}
				cj.push(c);
			});
			jTemp[n2] = cj;
		});

		json["objs"].push(jTemp);
	});
	socket.emit("mtg:save",json,(res) => {
		console.log(res);

	});
}

function exportDeck(e){
	e.preventDefault();
	if(socket != null && socket.selected != undefined && socket.selected.classList.contains("decks")){
		var cardBack = "https://preview.redd.it/dm8s72bg1zf51.jpg?width=1632&format=pjpg&auto=webp&s=77acaefbbfef40c240a13b7ef6006974b19cf6f9";
		var containers = [].slice.call(socket.selected.parentNode.children).filter(e => e.classList.contains("deckContainer"));
		var arr = [];
		var deckTemplate = {"SaveName":"","GameMode":"","Gravity":0.5,"PlayArea":0.5,"Date":"","Table":"","Sky":"","Note":"","Rules":"","XmlUI":"","LuaScript":"","LuaScriptState":"","ObjectStates":[{"Name":"Deck","Transform":{"posX":0,"posY":1,"posZ":0,"rotX":0,"rotY":180,"rotZ":0,"scaleX":1,"scaleY":1,"scaleZ":1},"Nickname":"","Description":"","GMNotes":"","ColorDiffuse":{"r":1,"g":1,"b":1},"Locked":false,"Grid":true,"Snap":true,"IgnoreFoW":false,"Autoraise":true,"Sticky":true,"Tooltip":true,"GridProjection":false,"HideWhenFaceDown":true,"Hands":false,"SidewaysCard":false,"DeckIDs":[],"CustomDeck":{},"XmlUI":"","LuaScript":"","LuaScriptState":"","ContainedObjects":[]}],"TabStates":{},"VersionNumber":""};
		var cardTemplate = {"Name":"CardCustom","Transform":{"posX":0,"posY":0,"posZ":0,"rotX":0,"rotY":0,"rotZ":0,"scaleX":1,"scaleY":1,"scaleZ":1},"Nickname":"","Description":"","GMNotes":"","ColorDiffuse":{"r":1,"g":1,"b":1},"Locked":false,"Grid":true,"Snap":true,"IgnoreFoW":false,"Autoraise":true,"Sticky":true,"Tooltip":true,"GridProjection":false,"HideWhenFaceDown":true,"Hands":true,"CardID":100,"SidewaysCard":false,"CustomDeck":{"1":{"FaceURL":"","BackURL":"","NumWidth":1,"NumHeight":1,"BackIsHidden":true,"UniqueBack":false}},"XmlUI":"","LuaScript":"","LuaScriptState":""};
		deckTemplate.ObjectStates[0].ContainedObjects = new Array();
		deckTemplate.ObjectStates[0].CustomDeck = new Object();
		deckTemplate.ObjectStates[0].DeckIDs = new Array();
		deckTemplate.ObjectStates[0].Nickname = socket.selected.innerHTML;
		const offSet = 2.5;
		var DSDeck = JSON.parse(stringify(deckTemplate.ObjectStates[0]));
		DSDeck.Nickname = 'Double Sided Cards';
		DSDeck.Transform.posX = offSet;
		var side = JSON.parse(stringify(deckTemplate.ObjectStates[0]));
		side.Nickname = 'Useful Cards';
		side.Transform.posX = -1 * offSet;
		
		var t = 1;
		
		function addCardtoExport(fronturl,backurl,deck,nickname=false,hideWhenfacedown=true){
			var temp = JSON.parse(stringify(cardTemplate.CustomDeck['1']));
			var tempCtemp = JSON.parse(stringify(cardTemplate));
			delete tempCtemp.CustomDeck['1'];
			temp.FaceURL = fronturl;
			temp.BackURL = backurl;
			nickname!=false?tempCtemp.Nickname = nickname:false;
			tempCtemp.CustomDeck[t.toString()] = temp;
			tempCtemp.CardID = t * 100;
			tempCtemp.HideWhenFaceDown = hideWhenfacedown;
			if(deck.ObjectStates != undefined){
				deck.ObjectStates[0].DeckIDs.push(tempCtemp.CardID);
				deck.ObjectStates[0].ContainedObjects.push(tempCtemp);
				deck.ObjectStates[0].CustomDeck[t.toString()] = temp;
			}else{
				deck.DeckIDs.push(tempCtemp.CardID);
				deck.ContainedObjects.push(tempCtemp);
				deck.CustomDeck[t.toString()] = temp;
			}
			t = t + 1;
			return deck;
		}
		var sideCards = [];
		containers.forEach((c) => {
			var children = [].slice.call(c.children);
			children.forEach((h) => {
				var s = getAttributes(h);
				if('allparts' in s){
					s['allparts'] = JSON.parse(s['allparts']);
					s['allparts'].forEach((part) => {
						(part.id != s.id) && (part.name != s.name)?sideCards.push(part.id):false;
					});
				}
				for(var j = 0; j < s.qty; j++){
					// one sided cards
					if(s.frontface != null){
						deckTemplate = addCardtoExport(s.frontface,cardBack,deckTemplate,s.name);
					}
					//double
					if(s.backface != null){
						DSDeck = addCardtoExport(s.frontface,s.backface,DSDeck,s.name,false);
					}
				}
			});
			
		});
		if(deckTemplate.ObjectStates[0].ContainedObjects.length == 1){
			deckTemplate.ObjectStates[0] = deckTemplate.ObjectStates[0].ContainedObjects[0];
			deckTemplate.ObjectStates[0].Transform.rotY = 180;
		}
		if(DSDeck.ContainedObjects.length > 1){
			deckTemplate.ObjectStates.push(DSDeck);
		}
		else if(DSDeck.ContainedObjects.length == 1){
			DSDeck = DSDeck.ContainedObjects[0];
			DSDeck.Transform.posX = offSet;
			DSDeck.Transform.rotY = 180;
			deckTemplate.ObjectStates.push(DSDeck);
		}
		if(sideCards.length > 0){
			socket.emit("mtg:searchbyids",{"arr":sideCards}, (rows) => {
				rows.rows.forEach((r) => {
					if(r.image_uris && r.image_uris.png){
						side = addCardtoExport(r.image_uris.png,cardBack,side,r.name);
					}
					
				});
				if(side.ContainedObjects.length == 1){
					side = side.ContainedObjects[0];
					side.Transform.posX = -1 * offSet;
					side.Transform.rotY = 180;
				}
				deckTemplate.ObjectStates.push(side);
				deckTemplate = JSON.stringify(deckTemplate,null,2);
				download(deckTemplate,socket.selected.innerHTML+".json");
				alert("Save it under Documents\\My Games\\Tabletop Simulator\\Saves\\Saved Objects!");
			});
			
		}
		else{
			deckTemplate = JSON.stringify(deckTemplate,null,2);
			download(deckTemplate,socket.selected.innerHTML+".json");
			alert("Save it under Documents\\My Games\\Tabletop Simulator\\Saves\\Saved Objects!");
		}
		
		
		
	}
}

function deleteItem(e){
	if(socket.selected.classList.contains("decks") && confirm("This is a deck, are you sure you want to delete it?")){
		socket.selected.parentNode.remove();
		socket.selected = undefined;
	}else{
		socket.selected.remove();
		socket.selected = undefined;
	}
}





export function initSaveFuncs(s){
	socket = s;
	document.getElementById("dIh_save").addEventListener("click",(e) => saveDeck(e));
	document.getElementById("dIh_export").addEventListener("click",(e) => exportDeck(e));
	document.getElementById("dIh_delete").addEventListener("click",deleteItem);
}
