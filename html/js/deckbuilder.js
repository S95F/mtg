

var socket = null;
var st = null;



export function makeDeck(s = null){
	s!=null?socket=s:false;
	const newDiv = document.createElement("div");
	const newInput = document.createElement("input");
	const deckContainer = document.createElement("div");
	deckContainer.classList.add("deckContainer");
	newInput.classList.add("deckExpandBtn");
	newInput.classList.add("green");
	newInput.setAttribute('type', 'button');
	newDiv.classList.add("decks");
	newInput.value = '+';
	newDiv.innerHTML = "new deck";
	const newWrapper = document.createElement("div");
	newWrapper.appendChild(newInput);
	newWrapper.appendChild(newDiv);
	newWrapper.appendChild(deckContainer);
	newDiv.contentEditable = false;
	newDiv.addEventListener('dblclick', (e) => {
		newDiv.contentEditable = !(newDiv.contentEditable === "true");	
	});
	newDiv.addEventListener('click', (e) => selectThis(e,newDiv,socket));
	newInput.addEventListener('click', (e) => {
		var container = Array.prototype.slice.call(newInput.parentNode.children);
		container = container.filter((e) => e.classList.contains('deckContainer'))[0];
		container.style.maxHeight = container.style.maxHeight==='0px'?'100%':'0px';
		newInput.value=newInput.value=='+'?'--':'+';
		newInput.classList.contains("green")?newInput.classList.remove("green"):newInput.classList.add("green");
		newInput.classList.contains("red")?newInput.classList.remove("red"):newInput.classList.add("red");
	});
	return newWrapper;
}


function toggleImg(container,e=false){
	e?e.preventDefault():false;
	container = Array.prototype.slice.call(container.children);
	container.forEach(c => {
		if(c.style.minWidth == "0px"){
			c.style.minWidth = "228px";
			c.style.maxWidth = "228px";
		}else{
			c.style.minWidth = "0px";
			c.style.maxWidth = "0px";
		}
	});
	
}

export function selectThis(e,newItem,s){
	s.selected!=undefined?s.selected.classList.remove("rainbow-text"):false;
	s.selected = newItem;
	s.selected.classList.add("rainbow-text");
}
function copyAttributes(sourceElement, destinationElement) {
  // Get all attributes from source element
  const attributes = sourceElement.attributes;

  // Loop through attributes and copy to destination element
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    
    // Check if attribute is not a class
    if (attribute.nodeName !== 'class') {
      destinationElement.setAttribute(attribute.nodeName, attribute.nodeValue);
    }
  }
}

function dragEle(event,container){
  event.preventDefault();
  const x = event.clientX;
  const y = event.clientY;
  
  // Create a new div element
  const newElement = document.createElement('div');
  
  // Position the new element at the click position
  newElement.style.position = 'absolute';
  newElement.style.left = x + 'px';
  newElement.style.top = y + 'px';
  
  // Set the class of the new element
  newElement.className = 'draggable';
  
  // Attach event listeners to make the new element draggable
  function dragger(event) {
	   newElement.style.left = event.clientX + 'px';
	   newElement.style.top = event.clientY + 'px';
  }

  function addCardToEle(ele){
	  var ne = document.createElement('div');
	  var p = [].slice.call(ele.parentNode.children).filter((e) => e.classList.contains('deckContainer'));
	  p = p.length > 0 ? p[0] : document.createElement('div');
	  p.classList.contains('deckContainer') ? true : p.classList.add('deckContainer');
	  ne.innerHTML = container.getAttribute("name");
	  copyAttributes(container,ne);
	  ne.classList.add("card");
	  ne.addEventListener('click',(e) => selectThis(e,ne,socket));
	  p.appendChild(ne);
	  if(p.parentNode != ele.parentNode){
		  ele.parentNode.appendChild(p);
		  var expando = [].slice.call(ele.parentNode.children).filter((e) => e.classList.contains('deckExpandBtn'))[0];
		  expando.value = '--';
		  expando.classList.remove('green');
		  expando.classList.add('red');
	  }
  }
  function endDrag(event) {
		event.preventDefault();
		window.removeEventListener('mousemove',dragger);
		// Check if there is an element with the class 'target' at the destination
		var elementsAtDestination = [].slice.call(document.elementsFromPoint(event.clientX, event.clientY));
		elementsAtDestination = elementsAtDestination.filter((e) => e.classList.contains('decks'));
		if (elementsAtDestination.length > 0) {
		  // The element has been dropped on a target element
		  addCardToEle(elementsAtDestination[0]);
		}
		// Remove the draggable element from the DOM
		newElement.remove();
		window.removeEventListener('mouseup',endDrag);
  }
  
  window,addEventListener('mousemove',dragger);
  window.addEventListener('mouseup',endDrag);
  
  // Add the new element to the DOM
  document.body.appendChild(newElement);
}



function search(e,s=false,p=false){
	e.preventDefault();
	st = s?s:document.getElementById("search").value;
	var obj = {"s":st};
	p?(obj["p"]=p<0?0:p):false;
	if((st === s) || !s){
		socket.emit("mtg:search",obj,(r) => {
			var SearchOP = document.getElementById("SearchOP");
			r.rows.length>0?SearchOP.innerHTML = "":false;
			document.getElementById("currPage").innerHTML = r.rows.length===0?document.getElementById("currPage").innerHTML:r.page;
			r.rows.length>0?(socket.batch = r.rows):false;
			r.rows.forEach(i => {
				var container = document.createElement("div");
				container.classList = "cardcontainer";
				var newEle = new Image();
				container.appendChild(newEle);
				container.style.zindex=10;
				container.setAttribute('name',i.name);
				container.setAttribute('qty',1);
				if(i.all_parts != undefined){
					container.setAttribute('allparts',JSON.stringify(i.all_parts));
				}
				if(i.image_uris){
					newEle.src = i.image_uris.png;
					newEle.alt = i.name;
					container.setAttribute('frontFace',i.image_uris.png);
				}else{
					if(i.card_faces[0].image_uris){
						newEle.src = i.card_faces[0].image_uris.png;
						container.setAttribute('frontFace',i.card_faces[0].image_uris.png);
						container.setAttribute('name',i.card_faces[0].name);
					}else{
						newEle.style.background_color = "black";
					}
					newEle.alt = i.card_faces[0].name;
					if(i.card_faces[1].image_uris){
						var newEle2 = new Image();
						container.setAttribute('backFace',i.card_faces[1].image_uris.png);
						container.setAttribute('backname',i.card_faces[1].name);
						newEle2.src = i.card_faces[1].image_uris.png;
						newEle2.alt = i.card_faces[1].name;
						newEle2.style.minWidth = "0px";
						newEle2.style.maxWidth = "0px";
						container.appendChild(newEle2);
						container.addEventListener("dblclick", (e) => toggleImg(container,e));	
						newEle2.addEventListener("dragstart", (e) => dragEle(e,container));
					}	
				}
				newEle.addEventListener("dragstart", (e) => dragEle(e,container));
				container.setAttribute('id',i.id);
				SearchOP.appendChild(container);
			});
		});
	}
}



function addDeck(e){
	e.preventDefault();
	document.getElementById("dIb").appendChild(makeDeck());
}
function addDraftKit(e){
	e.preventDefault();
	const dibContainer = document.getElementById("dIb");
	const newDiv = document.createElement("div");
	const newInput = document.createElement("input");
	newInput.classList.add("draftExpandBtn");
	newInput.classList.add("green");
	newInput.setAttribute('type', 'button');
	newDiv.classList.add("draftkit");
	newInput.value = '+';
	newDiv.innerHTML = "new draft kit";
	const newWrapper = document.createElement("div");
	newWrapper.appendChild(newInput);
	newWrapper.appendChild(newDiv);
	dibContainer.appendChild(newWrapper);
	newDiv.contentEditable = false;
	newDiv.addEventListener('dblclick', (e) => {
		newDiv.contentEditable = !(newDiv.contentEditable === "true");	
	});
	newInput.addEventListener('click', (e) => {
		var container = Array.prototype.slice.call(newInput.parentNode.children);
		container = container.filter((e) => e.classList.contains('deckContainer'))[0];
		container.style.maxHeight = container.style.maxHeight==='0px'?'100%':'0px';
		newInput.value=newInput.value=='+'?'--':'+';
		newInput.classList.contains("green")?newInput.classList.remove("green"):newInput.classList.add("green");
		newInput.classList.contains("red")?newInput.classList.remove("red"):newInput.classList.add("red");
	});
}


export function initDeckbuilder(s){
	socket = s;
	document.getElementById("dIh_add").addEventListener("click",(e) => addDeck(e));
	document.getElementById("searchBtn").addEventListener("click",(e) => search(e));
	document.getElementById("search").addEventListener("keypress",(e) => e.keyCode === 13 ? search(e) : false);
	document.getElementById("pageLeft").addEventListener("click",(e) => search(e,st,parseFloat(document.getElementById("currPage").innerHTML)-1));
	document.getElementById("pageRight").addEventListener("click",(e) => search(e,st,parseFloat(document.getElementById("currPage").innerHTML)+1));
	var buttons = [].slice.call(document.getElementsByClassName("dIh_b"));
	var tt = undefined;
	function dragger(event) {
		tt.style.left = event.clientX + 'px';
		tt.style.top = event.clientY - 20 + 'px';
	}
	function mouseEnd(event){
		event.preventDefault();
		window.removeEventListener('mousemove',dragger);
		tt.remove();
		window.removeEventListener('mouseup',mouseEnd);
	}
	
	buttons.forEach((b) => {
		b.addEventListener("mouseover", (e) => {
			e.preventDefault();
			const x = e.clientX;
			const y = e.clientY;
			tt = document.createElement("div");
			tt.innerHTML = b.getAttribute("tt");
			tt.classList.add("tt");
			tt.style.left = x + 'px';
			tt.style.top = y + 'px';
			window,addEventListener('mousemove',dragger);
			document.body.appendChild(tt);
		});
		b.addEventListener("mouseout",mouseEnd);
	});
}
