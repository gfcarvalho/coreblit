var jsGame = {};

// teste game app
(function(display, data, game){

	// model
	(function(){
		jsGame.model = function(image, x, y, z){
			core.GameObject.call(this, x, y, z); // super call	
				
			this.sprite = image || null;
			this.controlable = false;
			this.scale = 1;
			
			if(this.sprite){
				this.width = this.sprite.width*this.scale;
				this.height = this.sprite.height*this.scale;
			}
			else{
				this.width = 0;
				this.height = 0;
			}
			
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
		jsGame.background.prototype.constructor = jsGame.background;		
		
		jsGame.background.prototype.update = function(dt, context){
			
		};
		
		jsGame.background.prototype.draw = function(dt, context){
			context.save();			
			context.scale((core.display.canvas.width/this.image.width), (core.display.canvas.height/this.image.height));
			context.drawImage(this.image, this.x, this.y);
			context.restore();
		};
	})();
	
	(function(){ // usar definePropertie para left e top
		var createSpriteArray = function (/**Image*/ image, /**Number*/ rows, /**Number*/columns) {
			// if(rows<=0 || columns<=0) throw "Erro ao criar o array de sprites. rows e colummns devem ser > 0"
			spriteArray = [];
			numFrames = rows * columns;
			for(var i = 0; i< numFrames; ++i){
				spriteArray[i] = new core.Sprite(image).autoClip(rows, columns, i);
			}
			return spriteArray;
		} 
		
		jsGame.animatedModel = function(image, x, y, z, rows, columns){		
			jsGame.model.call(this, image, x, y, z);
			
			var sprites = createSpriteArray(image, rows || 1, columns || 1);
			this.animation = new core.Animation(sprites, 0);
			
			this.width = image.width/columns;
			this.height = image.height/rows;
				
			this.left = this.x-this.width;
			this.top = this.y-this.height;			
			
		}
		jsGame.animatedModel.prototype = new jsGame.model();
		jsGame.animatedModel.prototype.constructor = jsGame.animatedModel;		
		
		jsGame.animatedModel.prototype.update = function(dt){
			jsGame.model.prototype.update.call(this, dt);
			this.left = this.x - this.width;
			this.top = this.y - this.height;
			this.animation.update(dt);
			
			// console.log(this.animation.getCurrentFrameIndex())
		};
		
		jsGame.animatedModel.prototype.draw = function(dt, context){
			// context.save();			
			this.animation.draw(context, this.left, this.top, 0, 0);
			// context.restore();
		};
	})();
	
	// core.input.enableKeys(37, 38, 39, 40, 67);	
	
	
	function onLoadData(){
		
		// utiliza os dados pre-carregados
		
		var background = new jsGame.background(core.data.images['bkg'], 0, 0, 1);
		background.addToGame();
		
		// cria um novo jogador
		// var player = new jsGame.model(core.data.images['togepi'], display.canvas.width/2, display.canvas.height/2, 2);
		var player = new jsGame.animatedModel(core.data.images['animation'], display.canvas.width/2, display.canvas.height/2, 2, 4, 4);
		player.controlable = true;		
		
		player.animation.globalFlipY(180);
		player.animation.setSpeed(20);
		player.animation.play(0);
		
		player.addToGame();
		
		jsGame.player = player;
		
		// espera mostrar o logo um pouco para começar a rodar o jogo
		setTimeout(function(){core.game.run();}, 100);
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
			{type: "image", name: "animation", src: "resources/greenbender2.png"}
		], onLoadData);
		
		
	}
	
	window.onload = init;
	
})(core.display, core.data, core.game);
