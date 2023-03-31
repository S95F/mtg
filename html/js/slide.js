var divs = document.getElementById("container").children;

var scrollLock = {x:0,y:0}

function onResize(){
	dotheSlide(scrollLock.x,scrollLock.y);
}
function onkeydown(e){
	var blockedCodes = [33,34,35,36];
	if((blockedCodes.indexOf(e.keyCode) > 0) || (e.keyCode == 32 && e.target == document.body)){
		e.preventDefault();
		e.stopPropagation();
	}
}

export function slideSetup(){
	dotheSlide(0,0);
	window.onresize = onResize;
	window.onkeydown = onkeydown;
}


function classThem(){
	for(var i = 0; i < divs.length; i++){
		divs[i].classList.add("slide");
	}
}
function declassThem(cb=null){
	for(var i = 0; i < divs.length; i++){
		divs[i].className = "frames";
	}
	if(cb!=null){
		setTimeout(cb(),2000);
	}
}
function setPos(cb=null){
	var left = document.documentElement.style.getPropertyValue('--farLeft');
	var top = document.documentElement.style.getPropertyValue('--farTop');
	for(var i = 0; i < divs.length; i++){
		divs[i].style.left = left;
		divs[i].style.top = top;
	}
	if(cb!=null){
		declassThem(cb);
	}else{
		declassThem();
	}
	
}


export function dotheSlide(x,y,cb=null){
	scrollLock.x = x;
	scrollLock.y = y;
	var fleft = document.documentElement.style.getPropertyValue('--farLeft');
	var nfleft = x * -100;
	nfleft = nfleft.toString() + 'vw';
	if(fleft == ''){
		fleft = '0'
	}

	document.documentElement.style.setProperty('--cur', fleft);
	document.documentElement.style.setProperty('--farLeft',nfleft);
	
	var ftop = document.documentElement.style.getPropertyValue('--farTop');
	var nftop = y * -100;
	nftop = nftop.toString() + 'vh';
	if(ftop == ''){
		ftop = '0'
	}
	
	document.documentElement.style.setProperty('--tcur', ftop);
	document.documentElement.style.setProperty('--farTop',nftop);
	classThem();
	if(cb==null){
		divs[0].addEventListener("animationend", function(){setPos();}, false);
	}
	else{
		divs[0].addEventListener("animationend", function(){setPos(cb);}, false);
	}
}

