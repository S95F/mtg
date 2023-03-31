import {dotheSlide} from './slide.js';
import {selectThis, makeDeck} from './deckBuilder.js';

var forms;
var usrInf = {};
var socket;

function toggleForm(form,e=false){
	e?e.preventDefault():false;
	form = document.getElementById(form);
	forms.forEach(f => {
		f.style.minHeight = "0vh";
		f.style.maxHeight = "0vh";
	});
	form.style.minHeight = "100vh";
	form.style.maxHeight = "100vh";
}
function setUsr(email){
  dotheSlide(0,0);
  var loginCtrlr = document.getElementById("loginCtrlr");
  var children = Array.prototype.slice.call(loginCtrlr.children);
  children = children.filter((c) => c.classList.contains("headerbuttons"));
  children.forEach((c) => {
	 c.style.maxWidth = "0px";
	 c.style.maxHeight = "0px";
	 c.style.overflow = "hidden";
  });
  var usr = document.createElement("div");
  usr.classList.add("headeritems");
  usrInf.usr = email;
  usr.innerHTML = "Welcome " + email + "!";
  loginCtrlr.append(usr);
}



function createAccount(socket,e){
	e.preventDefault();
	const form = document.getElementById("create-account-form");
	const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmpassword.value;
	if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const data = {
      email: form.elements.caemail.value,
      password: password
    };
	socket.emit("create-account", data, (response) => {
      if (!response.success) {
		  if(response.email){
			  alert("Email address is already taken.");
		  }else{
			  alert("Error creating account. Please try again.");
		  }
      } else {
        alert("Account created successfully!");
        setUsr(data.email);
      }
    });
}
function setAttributes(element, attributes) {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}
function loginAccount(socket,e){
	e.preventDefault();
	const form = document.getElementById("login-account-form");
	const data = {
      email: form.elements.lemail.value,
      password: form.elements.lpassword.value
    };
    socket.emit("login-account", data, (response) => {
      if (!response.success) {
		  alert("Error logging in account. Please try again.");
      } else {
          setUsr(data.email);
          socket.emit("mtg:load",(json) => {
			 if(json.success){
				 const dibContainer = document.getElementById("dIb");
				 const currEle = dibContainer.children.length > 0 ? dibContainer.children[0] : undefined;
				 json.data.forEach(d => {
					if(Object.keys(d).includes("Deck")){
						var deck = makeDeck(socket);
						var p = Array.prototype.slice.call(deck.children).filter((e) => e.classList.contains('deckContainer'))[0];
						var expando = Array.prototype.slice.call(deck.children).filter((e) => e.classList.contains('deckExpandBtn'))[0];
						var name = Array.prototype.slice.call(deck.children).filter((e) => e.classList.contains('decks'))[0];
						name.innerHTML = d.name;
						expando.value = '--';
						expando.classList.remove('green');
						expando.classList.add('red');
						d.Deck.forEach(c => {
							var ne = document.createElement("div");
							ne.innerHTML = c.name;
							setAttributes(ne,c);
							if('allparts' in c){
								ne.setAttribute('allparts', JSON.stringify(c['allparts']));
							}
							ne.classList.add("card");
							ne.addEventListener('click',(e) => selectThis(e,ne,socket));
							p.appendChild(ne);
						});
						
						currEle!=undefined?dibContainer.insertBefore(deck,currEle):dibContainer.appendChild(deck);
					}
				 });
			 }else{
				 setUsr("");
			 }
		  });
      }
    });
}

export function initLogin(s){
	s.on("cookieSet", (cookie) => {
	  document.cookie = cookie;
	});
	socket = s;
	forms = [].slice.call(document.getElementById("formHolder").children);
	document.getElementById("cabtn").addEventListener("click",(e) => toggleForm("create-account-form",e));
	document.getElementById("backbutt").addEventListener("click",(e) => dotheSlide(0,0) || toggleForm("login-account-form",e));
	document.getElementById("create-account-form").addEventListener("submit",(e) => createAccount(socket,e));
	document.getElementById("login-account-form").addEventListener("submit",(e) => loginAccount(socket,e));
}
