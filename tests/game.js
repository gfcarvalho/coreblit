var jsgame = {};

(function(){
	var debug = new core.GameObject();
	debug.fpsText = null;
	debug.minText = null;
	debug.maxText = null;
	debug.objText = null;
	debug.speedText = null;	
	debug.timeUpdate = 1;
	var hide = false;
	
	debug.startup = function(x, y, align, alpha)
	{
		this.align = align || "left";
		hide = false;
		
		this.fpsText = "";
		this.minText = "";
		this.maxText = "";
		this.timeUpdate = 1;
		core.GameObject.prototype.startup.call(this, (x || 0), (y || 0), Number.POSITIVE_INFINITY);
		
		return this;
	}

	debug.toggleHide = function()
	{
		hide = !hide; 
	}	
	
	debug.update = function(dt, context)
	{	
		if(!this.timeUpdate)
			this.timeUpdate = 1;
		
		this.timeUpdate -= dt;			
		
		if(this.timeUpdate <= 0)
		{
			this.fpsText = "FPS: " + core.timer.current();
			this.minText = "MIN: " + core.timer.min();
			this.maxText = "MAX: " + core.timer.max();			
			
			this.timeUpdate = 1;
		}
			this.objText = "Game Objects: " + (core.game.getGameObjectsCount() - 1);
			this.speedText = "Game Speed: x" + (core.game.getSpeedMultiplier());		
	};
	
	debug.draw = function(dt, context)
	{
		if(!hide)
		{
			context.save();
			context.fillStyle = 'rgba(0,0,0,0.8)';
			context.fillRect(context.canvas.width-160, 0, 160, 170);
			
			context.font = "22px sans-serif";
			context.fillStyle = 'rgba(255,0,0,0.8)';
			context.textAlign = "right";			
			context.fillText(this.fpsText,  context.canvas.width-5, 30, 100);
			context.fillText(this.minText,  context.canvas.width-5, 60, 100);
			context.fillText(this.maxText,  context.canvas.width-5, 90, 100);		
			context.fillText(this.objText,  context.canvas.width-5, 120, 150);				
			context.fillText(this.speedText,  context.canvas.width-5, 150, 150);
			context.restore();
		}
	};
	
	debug.pauseDraw = this.draw;	
	debug.pauseUpdate = this.update;
	
	debug.startup();
	debug.addToGame();
	
	jsgame.debug = debug;
})();

(function(){
	
	// core.input.enableKeys(37, 38, 39, 40, 67);
	
	var ball = new core.GameObject(30, 100, 2);
	ball.color = "rgba(255, 0, 0, 1)"; // blue	
	ball.velocity = 0;
	ball.signal = 1;	
	ball.update = function(dt, context) {
		this.x += this.velocity * (1/60);
		if(this.velocity == -150 || this.velocity == 150) {
			this.signal *= -1;
		}
		this.velocity += this.signal;
		
		
	}	
	ball.draw = function(dt, context, xScroll, yScroll) {
		context.save();	
		// context.globalAlpha = 1;
		context.translate(this.x-xScroll, this.y-yScroll);	
		context.fillStyle = this.color;		
		context.beginPath();
		context.arc(0, 0, 25, 0, 2*Math.PI, false);         
		context.fill();
        context.closePath(); 		
		context.restore();
	}	
	ball.addToGame();
	
	var ball2 = new core.GameObject(30, 200, 2);	
	ball2.color = "rgba(0, 255, 0, 1)";	
	ball2.velocity = 0;
	ball2.signal = 1;
	ball2.update = ball.update;
	ball2.draw = ball.draw;
	ball2.addToGame();
	
	var ball3 = new core.GameObject(30,300, 2);	
	ball3.color = "rgba(0, 0, 255, 1)";	
	ball3.velocity = 0;
	ball3.signal = 1;
	ball3.leftKey = core.input.getKey(37);
	ball3.upKey = core.input.getKey(38);
	ball3.rightKey = core.input.getKey(39);
	ball3.downKey = core.input.getKey(40);
	ball3.changeColorKey = core.input.getKey(67);
	ball3.update = function(dt)
	{
		
		if(this.leftKey.isPressed())
			this.x-=90*dt;				
		// key.unlock();		
		
		if(this.upKey.isPressed())
			this.y-=90*dt;
		// key.unlock();
		
		if(this.rightKey.isPressed())
			this.x+=90*dt;	
		// key.unlock();
				
		if(this.downKey.isPressed())
			this.y+=90*dt;	
		// key.unlock();		
		
		if(this.changeColorKey.event == core.input.KEYDOWN)
		{
			this.color = "red";
			console.log("C down -> " + this.changeColorKey.time)
		}
		else if(this.changeColorKey.event == core.input.KEYUP)
		{
			this.color = "blue";
			console.log("C up -> " + this.changeColorKey.time)
		}
		else 
			this.color = "rgba(0, 0, 0, .2)";
		// key.unlock();
	}
	ball3.draw = ball.draw;
	ball3.addToGame();
	
	// exemplo de praticas ruins
	var ball4 = new Object();
	Object.extend(ball4, ball); 
	ball4.color = "rgba(123, 123, 123, .9)";
	ball4.y = 420;
	ball4.addToGame(); // falha (copiamos apos ball ter sido inicializada)
	// podemos adicionar ainda mas note que ball4 vai possuir o mesmo id de ball
	// isso podera vir a ser um problema se o id for utilizado para alguma busca ou comparação
	core.game.addGameObject(ball4);
	
	
	jsgame.ball = ball;
	jsgame.ball2 = ball2;
	jsgame.ball3 = ball3;
	jsgame.ball4 = ball4;
	
	function init()
	{
		// if(core.system.browserFeatures.NativeRequestAnimationFrame)
			// alert("RequestAnimationFrame Nativo!");
			
		core.display.startup(500, 500, true, true, true, false);
		// core.display.setBrightness(0.7);
		// core.display.attachResolutionToViewport(true);
		
		core.input.enableKeyboard(true);
		// core.input.enableKeys(37, 38, 39, 40, 67);
		
		core.game.run();
	}
	
	window.onload = init;
	
})();
