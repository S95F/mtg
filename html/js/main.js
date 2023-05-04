
import {slideSetup, dotheSlide} from './slide.js';
import {initLogin} from './login.js';
import {initDeckbuilder} from './deckbuilder.js';
import {initSaveFuncs} from './saveFuncs.js';
var socket = io('/socketio',{
	autoConnect: true
});
window.addEventListener("load", (event) => {
	//slide
	slideSetup();
	//
	document.getElementById("loginMain").addEventListener("click",() => dotheSlide(1,0));
	//my init
	initDeckbuilder(socket);
	initSaveFuncs(socket);
	initLogin(socket);
});
