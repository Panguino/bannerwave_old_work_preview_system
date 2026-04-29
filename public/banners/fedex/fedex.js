var banner_end = false,
cta,
cta_play,
cta_replay,
cloud_tl,
game_tl,
game_end_tl,
main_tl = new TimelineMax(),
game_width = 210,
game_height = 436,
door_height = 355,
max_score = 2310,
end_score = {score:0},
percent = 0,
shape = ['o','i','t','l','z','s'],
shape_score_value = 120,
shape_score_total = 0,
saved,
next,
saved,
replay = false,
run_tetris,
handle_keydown,
handle_panend,
handle_tap,
add_listeners,
remove_listeners,
clear_canvas,
score_y = -30,
saved_next_x = 80,
game_piece,
rot_pos_x,
rot_pos_y,
rot_amount = 0,
score_buffer = 135,
mc
;

var imagePreloadCount = 0,
    imagesToPreload = [
	    'logo.png',
	    'txt_saved.png',
	    'txt_next.png',
	    'shape_o.png',
	    'shape_i.png',
	    'shape_t.png',
	    'shape_l.png',
	    'shape_z.png',
	    'shape_s.png',
	    'saved_next_bg.png',
        'cloud.png',
        'street.png',
        'truck.png',
        'truck_floor.png',
        'truck_door.png',
        'truck_door_copy_intro.png',
        'truck_door_copy_end.png',
        'truck_tires.png',
        'truck_tires_tread.png',
        'truck_tires_tread_shadow.png',
        'truck_shadow.png'
    ];
    
function preloadImages() {
    for (var i = 0; i < imagesToPreload.length; i++) {
        var thisImage = new Image();
        thisImage.src = imagesToPreload[i];
        thisImage.onLoad = imageLoaded();
    }
};
 
function imageLoaded() {
    imagePreloadCount += 1;
    if (imagePreloadCount == imagesToPreload.length) {
        init();
        //console.log('loaded');
    }
};

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

/** True when we should attach Hammer (touch / coarse pointer), not only legacy orientation sniffing. */
function supportsTouchGestures() {
	if (navigator.maxTouchPoints > 0) {
		return true;
	}
	try {
		if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
			return true;
		}
	} catch (e) {}
	return isMobileDevice();
}

init = function(){
	cta = document.querySelector('.cta');
	cta_play = document.querySelector('.cta_play');
	cta_replay = document.querySelector('.cta_replay');
	
	/* Animation */
	function intro_anim() {
		var intro_tl = new TimelineMax();
		intro_tl
			.set('.cta_play',{autoAlpha:0})
			.set('.score',{y:score_y})
			.set('.door_end_content',{y:-door_height})
			.set('.percent_circle circle',{drawSVG:"0%",rotation:-90,transformOrigin:'50% 50%'})
			.set('.saved',{x:-saved_next_x})
			.set('.next',{x:saved_next_x})
			.add('start','+=0')
			.to('.cloud1', 10, {
		        left:'-200px',
		        ease:Power0.easeNone,
		        onComplete: move_cloud,
		        onCompleteParams: ['.cloud1']
		    },'start')
		    .to('.cloud2', 30, {
		        left:'-200px',
		        ease:Power0.easeNone,
		        onComplete: move_cloud,
		        onCompleteParams: ['.cloud2']
		    },'start')
		    .to('.tread',2,{y:-130,ease:Power3.easeOut},'start')
		    .to('.tread',.15,{y:-123,ease:Power0.easeNone},'start+=1.3')
		    .to('.brake',2,{y:-3,ease:Power3.easeOut},'start')
		    .to('.brake',.15,{y:0,ease:Power0.easeNone},'start+=1.3')
		    .from('.truck',1.4,{scale:2.5,x:30,y:200,ease:Power3.easeOut},'start')
		    .set('.cta_play',{autoAlpha:1},'start+=2')
		    .from('.cta_play',.3,{width:0,height:0,x:61,y:13,ease:Power4.easeOut},'start+=2')
		    .from('.cta_play_txt',.3,{autoAlpha:0,scale:.5,transformOrigin:'50% 50%',ease:Power4.easeOut},'start+=2.2')
			.addCallback(banner_done);
		;
		return intro_tl;
	};
	
	function banner_done() {
		banner_end = true;
	};
	
	function animate() {
		main_tl
			
			.addLabel('start')
			.to('#loading', .2,{autoAlpha:0,ease:Power1.easeOut},'start+=.2')
			.set('.show',{autoAlpha:1},'start+=.4')
			.add(intro_anim(),'start+=.4')
		;
		//main_tl.seek(17);
		//main_tl.timeScale(1.3);
	};
	
	/* Add Listeners */
    function addlisteners() {
	    cta.addEventListener('click', function() {
		    //console.log('background exit click');
	    });
    	cta.addEventListener('mouseover', function() {
	    	//if(banner_end){
            	TweenMax.to('.cta_orange',.2,{y:-4,ease:Power4.easeOut});
            //}
    	});
        cta.addEventListener('mouseout', function() {
           //if(banner_end){
	            TweenMax.to('.cta_orange',.2,{y:0,ease:Power4.easeOut});
           //}
		});
		cta_play.addEventListener('mouseover', function() {
            TweenMax.to('.cta_play',.2,{backgroundColor:'#ff6500',ease:Power4.easeOut});
            TweenMax.to('.cta_play_txt path',.2,{fill:'#ffffff',ease:Power4.easeOut});
    	});
        cta_play.addEventListener('mouseout', function() {
	        TweenMax.to('.cta_play',.2,{backgroundColor:'transparent',ease:Power4.easeOut});
	        TweenMax.to('.cta_play_txt path',.2,{fill:'#ff6500',ease:Power4.easeOut});
		});
		cta_play.addEventListener('click', game_init);
		cta_replay.addEventListener('mouseover', function() {
            TweenMax.to('.cta_replay',.2,{backgroundColor:'#ff6500',ease:Power4.easeOut});
            TweenMax.to('.cta_replay_txt path',.2,{fill:'#ffffff',ease:Power4.easeOut});
    	});
        cta_replay.addEventListener('mouseout', function() {
	        TweenMax.to('.cta_replay',.2,{backgroundColor:'transparent',ease:Power4.easeOut});
	        TweenMax.to('.cta_replay_txt path',.2,{fill:'#ff6500',ease:Power4.easeOut});
		});
		cta_replay.addEventListener('click', game_init);
    };
    
    animate();
    addlisteners();
};

game_init = function() {	
	//console.log('game initialized');
	remove_class(document.querySelector('.game_wrapper'),'hide');
	cta_play.removeEventListener('click', game_init);
	game_tl = new TimelineMax();
	game_tl
		.add('start','+=0')
		.to('.door_intro_content',1.7,{y:-door_height,ease:Power4.easeInOut},'start')
		.to('.street,.truck',1.7,{y:35,ease:Power4.easeInOut},'start')
		.to('.score',.5,{y:0,ease:Power4.easeOut},'start+=1')
		.to('.saved,.next',.5,{x:0,ease:Back.easeOut,onComplete:function(){
			//remove_class(document.querySelector('.tet'),'hide');
			next = get_shape();
			saved = next;
			run_tetris();	
		}},'start+=1.2')	
	;
	if(replay) {
		TweenMax.to('.door_end_content',1.7,{y:-door_height,ease:Power4.easeInOut});
	}
};

game_end = function() {
	//console.log('game end');
	replay = true;
	reset_hud();
	remove_class(document.querySelector('.truck_door_end'),'hide');
	document.querySelector('.percent_txt').innerHTML = '0%';
	end_score.score = 0;
	game_end_tl = new TimelineMax();
	game_end_tl
		.set('.percent_circle circle',{drawSVG:0})
		.add('start','+=0')
		.to('.street,.truck,.game_wrapper',1.7,{y:0,ease:Power4.easeInOut},'start')
		.to('.score',.5,{y:score_y,ease:Power4.easeOut},'start')
		.to('.saved',.5,{x:-saved_next_x,ease:Back.easeOut},'start')
		.to('.next',.5,{x:saved_next_x,ease:Back.easeOut},'start')
		.to('.door_end_content',1.7,{y:0,ease:Power4.easeInOut,onComplete:function(){
			clear_canvas();
		}},'start')
		.to('.percent_circle circle',1,{delay:2,drawSVG:percent+'%',ease:Power4.easeOut},'start')
		.to(end_score,1,{delay:2,score:percent,roundProps:'score',ease:Power4.easeOut,onUpdate:function(){
			if(end_score.score > 100) {
				end_score.score = 100;
			}
			document.querySelector('.percent_txt').innerHTML = end_score.score + '%';
		}},'start')	
	;	
};

play_shape = function(shape) {	
	game_piece = document.createElement('img');
	game_piece.src = 'shape_'+shape+'.png';
	game_piece.classList.add('shape_'+shape);
	game_piece.classList.add('shape');
	document.querySelector('.game').appendChild(game_piece);
}

get_shape = function() {
	return shape[Math.floor(get_random(0,5))];
};

reset_hud = function() {
	//var all_current = document.querySelectorAll('.current .shape');
	var all_next = document.querySelectorAll('.next .shape');
	var all_saved = document.querySelectorAll('.saved .shape');
/*
	for(i=0;i<all_current.length;i++) {
		if(!has_class(all_current[i],'hide')) {
			add_class(all_current[i],'hide');
		}
	}
*/
	for(i=0;i<all_next.length;i++) {
		if(!has_class(all_next[i],'hide')) {
			add_class(all_next[i],'hide');
		}
	}
	for(i=0;i<all_saved.length;i++) {
		if(!has_class(all_saved[i],'hide')) {
			add_class(all_saved[i],'hide');
		}
	}
};

move_cloud = function(object) {
	set_scale(object);		
	cloud_tl = new TimelineMax();
	cloud_tl.set(object,{left:'300px',top:get_random(-30,150)+'px'});
	cloud_tl.to(object, get_random(15,30), {
		delay:get_random(0,15),
        left:'-200px',
        ease:Power0.easeNone,
        onComplete:move_cloud,
        onCompleteParams:[object]
    });
};

set_scale = function(elem) {
	TweenMax.set(elem,{scale:get_random(.5,1)});
};

get_random = function(min,max) {
	return min + Math.random() * (max - min);
};

has_class = function(el,cls) {
	var regexp = new RegExp( '(\\s|^)' + cls + '(\\s|$)' ),
    target = ( typeof el.className == "undefined" )?window.event.srcElement:el;
	return target.className.match( regexp );
};

toggle_class = function(el, from, to) {
	el.className = el.className.replace(from, to);
};

has_class = function(el, className)
{
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

add_class = function(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!has_class(el, className))
        el.className += " " + className;
};

remove_class = function(el, className)
{	
	if (el !== null) {
	    if (el.classList)
	        el.classList.remove(className)
	    else if (has_class(el, className))
	    {
	        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
	        el.className = el.className.replace(reg, ' ');
	    }
    }
};

remove_element = function(node) {
    node.parentNode.removeChild(node);
};

window.onload = preloadImages();

(function(){
	"use strict";
	const canvas=document.getElementById("tetris");
	const context=canvas.getContext("2d");
	context.scale(30,30);
	let makeMatrix=function(w,h){
		const matrix=[];
		while(h--){
			matrix.push(new Array(w).fill(0));
		}
		return matrix;
	};
	let makePiece=function(type){
		saved = type;
		next = get_shape();		
		if(type==="t"){
			return [				
				[1,1,1],
				[0,1,0],
				[0,0,0]
			];
		}
		else if(type==="o"){
			return [
				[1,1],
				[1,1]
			];
		}
		else if(type==="l"){
			return [
				[0,1,0],
				[0,1,0],
				[0,1,1]
			];
		}
		else if(type==="j"){
			return [
				[0,1,0],
				[0,1,0],
				[1,1,0]
			];
		}
		else if(type==="i"){
			return [
				[0,1,0,0],
				[0,1,0,0],
				[0,1,0,0],
				[0,1,0,0]
			];
		}
		else if(type==="s"){
			return [
				[0,1,1],
				[1,1,0],
				[0,0,0]
			];
		}
		else if(type==="z"){
			return [
				[1,1,0],
				[0,1,1],
				[0,0,0]
			];
		}
	};
	let collide=function(area,player){
		const [m,o]=[player.matrix,player.pos];
		for(let y=0;y<m.length;++y){
			for(let x=0;x<m[y].length;++x){
				if(m[y][x]!==0&&(area[y+o.y]&&area[y+o.y][x+o.x])!==0){
					return true;
				}
			}
		}
		return false;
	};
	let drawMatrix=function(matrix,offset){
		matrix.forEach((row,y)=>{
			row.forEach((value,x)=>{
				if(value!==0){
					// context.fillStyle=colors[value];
					// context.fillRect(x+offset.x,y+offset.y,1,1);
					//let imgTag=document.createElement("IMG");
					//imgTag.src=colors[value];
					//imgTag.src='';
					//context.drawImage(imgTag,x+offset.x,y+offset.y,1,1);
				}
			});
		});
	};
	let merge=function(area,player){
		player.matrix.forEach((row,y)=>{
			row.forEach((value,x)=>{
				if(value!==0){
					area[y+player.pos.y][x+player.pos.x]=value;
				}
			});
		});
	};
	let rotate=function(matrix,dir){
		for(let y=0;y<matrix.length;++y){
			for(let x=0;x<y;++x){
				[
					matrix[x][y],
					matrix[y][x]
				]=[
					matrix[y][x],
					matrix[x][y],
				]
			}
		}
		if(dir>0){
			matrix.forEach(row=>row.reverse());
		}
		else{
			matrix.reverse();
		}
	};
	let playerReset=function(){
		reset_hud();
		TweenMax.set('.saved_shape_wrapper',{rotation:0,transformOrigin:'33px 27px'});
		//remove_class(document.querySelector('.current .shape_'+next+''),'hide');
		remove_class(document.querySelector('.saved .shape_'+next+''),'hide');
		player.matrix=makePiece(next);
		player.pos.y=0;
		player.pos.x=(Math.floor(area[0].length/2))-(Math.floor(player.matrix[0].length/2));
		if(collide(area,player)){
			//area.forEach(row=>row.fill(0));
			player.score=0;
			gameRun=false;
		}
		if(gameRun) {
			play_shape(saved);
			rot_amount = 0;
		}
		next = get_shape();
		remove_class(document.querySelector('.next .shape_'+next+''),'hide');
	};
	let playerDrop=function(){
		var pos_y = player.pos.y;	
		player.pos.y++;
		if(collide(area,player)){
			player.pos.y--;
			merge(area,player);
			playerReset();			
			if(pos_y >= 3) {
				//console.log(pos_y);
				shape_score_total += shape_score_value;
				pos_y = 0;
			}
			
			percent = ((shape_score_total+score_buffer)/max_score)*100;
			document.querySelector('.score').innerHTML = (Math.round(percent))+'%';
		}
		if(gameRun) {
			game_piece.style.top = (player.pos.y * 30) + 'px';
		}
	};
	let playerMove=function(dir){
		player.pos.x+=dir;
		if(collide(area,player)){
			player.pos.x-=dir;
		}
		playerReposition();
	};
	let playerReposition=function(){
		if(gameRun) {
			switch(saved) {
				case 'o':
					game_piece.style.left = ((player.pos.x) * 30) + 'px';
					break;
				case 'i':
					game_piece.style.left = ((player.pos.x + 1) * 30) + 'px';
					break;
				case 't':
					game_piece.style.left = ((player.pos.x) * 30) + 'px';
					break;
				case 'l':
					game_piece.style.left = ((player.pos.x + 1) * 30) + 'px';
					break;
				case 'z':
					game_piece.style.left = ((player.pos.x) * 30) + 'px';
					break;
				case 's':
					game_piece.style.left = ((player.pos.x) * 30) + 'px';
					break;
			}
		}
	};
	let playerRotate=function(dir){		
		rot_amount-=90;
		if(rot_amount === -360) {
			rot_amount = 0;
		}
		const pos=player.pos.x;
		let offset=1;
		rotate(player.matrix,dir);
		while(collide(area,player)){
			player.pos.x+=offset;
			offset=-(offset+(offset>0?1:-1));
			if(offset>player.matrix[0].length){
				rotate(player.matrix,-dir);
				player.pos.x=pos;
				return;
			}
		}		
		if(saved !== 'o') {
			if(saved === 'i') {
				if(rot_amount === -90) {
					rot_pos_x = 15;
					rot_pos_y = 15;
				} else if(rot_amount === -180) {
					rot_pos_x = 30;
					rot_pos_y = 0;
				} else if(rot_amount === -270) {
					rot_pos_x = 15;
					rot_pos_y = -15;
				} else {
					rot_pos_x = 0;
					rot_pos_y = 0;
				}
			} else if(saved === 't') {
				if(rot_amount === -90) {
					rot_pos_x = -15;
					rot_pos_y = 15;
				} else if(rot_amount === -180) {
					rot_pos_x = 0;
					rot_pos_y = 30;
				} else if(rot_amount === -270) {
					rot_pos_x = 15;
					rot_pos_y = 15;
				} else {
					rot_pos_x = 0;
					rot_pos_y = 0;
				}
			} else if(saved === 'l') {
				if(rot_amount === -90) {
					rot_pos_x = -15;
					rot_pos_y = -15;
				} else if(rot_amount === -180) {
					rot_pos_x = -30;
					rot_pos_y = 0;
				} else if(rot_amount === -270) {
					rot_pos_x = -15;
					rot_pos_y = 15;
				} else {
					rot_pos_x = 0;
					rot_pos_y = 0;
				}
			} else if(saved === 'z' || saved === 's') {
				if(rot_amount === -90) {
					rot_pos_x = -15;
					rot_pos_y = 15;
				} else if(rot_amount === -180) {
					rot_pos_x = 0;
					rot_pos_y = 30;
				} else if(rot_amount === -270) {
					rot_pos_x = 15;
					rot_pos_y = 15;
				} else {
					rot_pos_x = 0;
					rot_pos_y = 0;
				}
			}
			TweenMax.set(game_piece,{rotation:'-=90_ccw',x:rot_pos_x,y:rot_pos_y,transformOrigin:'50% 50%'});
			TweenMax.set('.saved_shape_wrapper',{rotation:rot_amount,transformOrigin:'33px 27px'});
		}
		playerReposition();
	};
	let draw=function(){
		if(gameRun) {
			context.clearRect(0,0,canvas.width,canvas.height);
			context.fillStyle="rgba(0, 0, 0, 0)";
			context.fillRect(0,0,canvas.width,canvas.height);
			drawMatrix(area,{x:0,y:0});
			drawMatrix(player.matrix,player.pos);
		}
	};
	let dropInter=100;
	let time=0;
	let update=function(){
		time++;
		if(time>=dropInter){
			playerDrop();
			time=0;
		}
		draw();
	};
	let gameOver=function(){
		//console.log('Game Over');
		gameRun=false;
		clearInterval(gameLoop);
		game_end();
		area.forEach(row=>row.fill(0));
	};
	const area=makeMatrix(7,14);
	const player={
		pos:{
			x:0,
			y:0
		},
		matrix:null,
		score:0
	};
	const move=1;
	let gameLoop;
	let gameRun=false;
	run_tetris=function(){
		shape_score_total = 0;
		document.querySelector('.score').innerHTML = shape_score_total+'%';		
		gameRun=true;
		playerReset();
		gameLoop=setInterval(function(){
			if(gameRun){
				update();				
			}
			else{								
				gameOver();
				remove_listeners();	
			}
		},10);
		add_listeners();
	};
	add_listeners=function(){
		document.addEventListener('keydown',handle_keydown);
		if (supportsTouchGestures()) {
			var el = document.getElementById('fedex');
			mc = new Hammer.Manager(el);
			var pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 12 });
			var tap = new Hammer.Tap({ event: 'tap', taps: 1 });
			mc.add([pan, tap]);
			tap.requireFailure(pan);
			mc.on('panend', handle_panend);
			mc.on('tap', handle_tap);
		}
	};
	remove_listeners=function(){
		document.removeEventListener('keydown',handle_keydown);
		if (mc) {
			mc.destroy();
			mc = null;
		}
	};
	handle_keydown=function(e){
		if(gameRun) {
			if(e.keyCode===37){
				playerMove(-move);
			}
			else if(e.keyCode===39){
				playerMove(+move);
			}
			else if(e.keyCode===40){
				if(gameRun){
					playerDrop();
				}
			}
			else if(e.keyCode===38){
				playerRotate(-move);
			}
		}
	};
	handle_panend=function(e){
		if (!gameRun) {
			return;
		}
		var dx = e.deltaX;
		var dy = e.deltaY;
		var ax = Math.abs(dx);
		var ay = Math.abs(dy);
		var vx = Math.abs(e.velocityX || 0);
		var vy = Math.abs(e.velocityY || 0);
		var downIntent = dy > 0 && ay > ax * 1.05 && (ay > 20 || vy > 0.35);
		var horizIntent =
			(ax > ay * 0.75 && (ax > 14 || vx > 0.28)) ||
			(ax > 10 && vx > 0.45 && ax >= ay * 0.55);
		if (downIntent && !horizIntent) {
			playerDrop();
		} else if (horizIntent) {
			playerMove(dx < 0 ? -move : move);
		}
	};
	handle_tap=function(e){
		if(gameRun) {
			playerRotate(-move);
		}
	};
	clear_canvas=function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		document.querySelector('.game').innerHTML = '';
	};
})();