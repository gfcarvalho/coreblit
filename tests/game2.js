var jsGame = {};

// debug tool
/*(function(){
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
	
	jsGame.debug = debug;
})();*/



// teste game app
(function(display, data, game){

	// model
	(function(){
		jsGame.model = function(image, x, y, z){
			core.GameObject.call(this, x, y, z); // super call	
				
			this.sprite = image;
			this.controlable = false;
			this.scale = 0.5;
			this.width = this.sprite.width*this.scale;
			this.height = this.sprite.height*this.scale;
			
		}
		jsGame.model.prototype = new core.GameObject();
		jsGame.model.prototype.constructor = jsGame.model;
		
		jsGame.model.prototype.leftKey = core.input.getKey(37);
		jsGame.model.prototype.upKey = core.input.getKey(38);
		jsGame.model.prototype.rightKey = core.input.getKey(39);
		jsGame.model.prototype.downKey = core.input.getKey(40);
		// model.prototype.changeKey = core.input.getKey(67);
		
		var checkForInputs = function(obj, dt){
			if(obj.leftKey.isPressed())
				obj.x-=250*dt;							
			
			if(obj.upKey.isPressed())
				obj.y-=250*dt;		
			
			if(obj.rightKey.isPressed())
				obj.x+=250*dt;			
					
			if(obj.downKey.isPressed())
				obj.y+=250*dt;	
		}
		
		jsGame.model.prototype.update = function(dt, context){
			if(this.controlable)
				checkForInputs(this, dt);
		};
		
		jsGame.model.prototype.draw = function(dt, context){
			context.save();				
			context.scale(this.scale, this.scale);
			context.drawImage(this.sprite, this.x+this.width, this.y+this.height);
			context.restore();
		};
	})();
	
	// background
	(function(){
		jsGame.background = function(image, x, y, z){
			core.GameObject.call(this, x, y, z); // super call	
				
			this.image = image;
			this.controlable = false;
			
		}
		jsGame.background.prototype = new core.GameObject();
		jsGame.background.prototype.constructor = jsGame.model;		
		
		jsGame.background.prototype.update = function(dt, context){
			
		};
		
		jsGame.background.prototype.draw = function(dt, context){
			context.save();			
			context.scale((core.display.canvas.width/this.image.width), (core.display.canvas.height/this.image.height));
			context.drawImage(this.image, this.x, this.y);
			context.restore();
		};
	})();
	
	// core.input.enableKeys(37, 38, 39, 40, 67);	
	
	
	function onLoadData(){
		
		// utiliza os dados pre-carregados
		
		var background = new jsGame.background(core.data.images['bkg'], 0, 0, 1);
		background.addToGame();
		
		// cria um novo jogador
		var player = new jsGame.model(core.data.images['togepi'], display.canvas.width/2, display.canvas.height/2, 2);
		player.controlable = true;
		player.addToGame();
		
		// espera mostrar o logo um pouco para começar a rodar o jogo
		setTimeout(function(){core.game.run();}, 1500);
	}
	
	function init()
	{
		// if(core.system.browserFeatures.NativeRequestAnimationFrame)
			// alert("RequestAnimationFrame Nativo!");
			
		display.startup(500, 500, true, true, true, false);
		// core.display.setBrightness(0.7);
		// core.display.attachResolutionToViewport(true);
		
		core.input.enableKeyboard(true);
		// core.input.enableKeys(37, 38, 39, 40, 67);
		
		data.load([
			{type: "image", name: "bkg", src: "resources/bkg.jpg"},
			{type: "image", name: "togepi", src: "resources/togepi.png"}
		], onLoadData);
		
		
	}
	
	window.onload = init;
	
})(core.display, core.data, core.game);
