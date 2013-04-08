var jsgame = {};

(function(){
	var debug = new core.GameObject();
	debug.fpsText = null;
	debug.minText = null;
	debug.maxText = null;
	debug.objText = null;
	debug.speedText = null;
	debug.timeUpdate = 0;
	var hide = false;
	
	debug.startup = function(x, y, align, alpha)
	{
		this.align = align || "left";
		hide = false;
		
		this.fpsText = "";
		core.GameObject.prototype.startup.call(this, (x || 0), (y || 0), Number.POSITIVE_INFINITY);
		
		return this;
	}

	debug.toggleHide = function()
	{
		hide = !hide; 
	}	
	
	debug.update = function(dt)
	{
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
	ball3.update = function()
	{
		var key = core.input.getKeyStatus(37);
		if(key.isPressed())
			this.x-=1;				
		key.unlock();
		
		key = core.input.getKeyStatus(38);
		if(key.isPressed())
			this.y-=1;

		key = core.input.getKeyStatus(39);
		if(key.isPressed())
			this.x+=1;	
			
		key = core.input.getKeyStatus(40);
		if(key.isPressed())
			this.y+=1;	
	}
	ball3.draw = ball.draw;
	ball3.addToGame();
	
	jsgame.ball = ball;
	jsgame.ball2 = ball2;
	jsgame.ball3 = ball3;
	
	function init()
	{
		core.display.startup(500, 500, true, true, true, true);
		// core.display.setBrightness(0.7);
		// core.display.attachResolutionToViewport(true);
		
		core.input.enableKeyboard();
		core.input.enableKeys(37, 38, 39, 40);
		
		core.game.run();
	}
	
	window.onload = init;
	
})();
