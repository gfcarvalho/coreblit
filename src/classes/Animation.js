(function() { // begin global runtime closure
	/**
		Define uma animacao formada por uma lista(array) de sprites
		@author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
		@class
		@requires core.Sprite
	*/
	core.Animation = function(/**Array*/ frameArray,/**Integer*/ numberOfLoops, /**String*/ name, /**Array of Integer*/ indexArray)
	{
		/** Lista de sprites da animacao
			@type Array
		*/
		this.frames = [];

		/** nome da animacao
			@type String
		*/
		this.name = "";

		/** Numero do core.Sprite atual da animacao
			@type Number
		*/
		this.currentFrame = 0;

		/** true se a animacao esta em pausa, false caso contrario
			@type Boolean
		*/
		this.paused = true;
		
		/** Numero padrao de vezes que a animacao sera executada, use 0 para executar a animacao em loop
			@type Integer
		*/
		this.numberOfLoops = 0;

		/** Numero de loops restantes
			@type Integer
		*/
		this.loopsLeft = 0;
		
		/** true se a animacao deve ser executada em loop, false caso contrario
			@type Boolean
		*/
		this.everLoop = false;

		/** So e definido se a animacao possui uma velocidade regular de animacao
			@type Number
		*/
		this.fps = null;
		
		/** Tempo de exibicao entre o ultimo e o proximo frame
			@type Number
		*/
		this.timeBetweenFrames = 0;  
		
		/**	Tempo desde o ultimo frame desenhado
			@type number
		*/
		this.timeSinceLastFrame = 0;
		
		this.startup(frameArray, numberOfLoops, name, indexArray)
	};

	/** 
		Passe como parametro uma lista de frames a serem exibidos e 
		um array numerico com os indices dos frames escolhidos para a animacao
		@param name nome da animacao
		@param frameArray array com as sprites devidamente recortadas da aniacao
		@param indexArray array que mapeia a ordem de exibicao das sprites nas animacao
		@param numberOfLoops Numero de vezes que a animacao sera executada
	*/
	core.Animation.prototype.startup = function(/**Array*/ frameArray,/**Integer*/ numberOfLoops, /**String*/ name, /**Array of Integer*/ indexArray)
	{
		this.numberOfLoops = numberOfLoops;
		this.loopsLeft = numberOfLoops;
		this.name = name || "";
		
		if(this.numberOfLoops <= 0)
		{
			this.everLoop = true;
		}
		
		this.frames = [];
		
		if(typeof indexArray !== "undefined") {
			
			for (var i = 0; i < indexArray.length; ++i)
			{
				if(indexArray[i] < frameArray.length)
				{
					this.frames[i] = frameArray[indexArray[i]];
				}
				else
				{
					console.warn("core.Animation " + this.name + ": Indice " + indexArray[i] + " invalido. Valor ignorado.");
				}
			}
			
			this.timeSinceLastFrame = this.getNextFrame().delay;
		}
		else {
			this.frames = frameArray;
		}
		
		return this;
	};

	/** Copia uma instancia de animacao para esta
		@param other A animacao a ser copiada
	*/
	core.Animation.prototype.copy = function(/**core.Animation*/ other)
	{
		this.frames = other.frames;
		this.currentFrame = other.currentFrame;
		this.paused = other.paused;
		this.numberOfLoops = other.numberOfLoops;
		this.loopsLeft = other.loopsLeft;
		this.everLoop = other.everLoop;
		this.name = other.name;
		this.fps = other.fps;
		this.timeSinceLastFrame = other.timeSinceLastFrame;
		this.timeBetweenFrames = other.timeBetweenFrames;
			
		return this;
	};
	
	/**Adiciona uma sprite a animacao na posicao especificada*/
	core.Animation.prototype.addSprite = function(/**core.Sprite*/ sprite, position) {
		if(position){
			this.frames.unshift(position);
		}
		else{
			this.frames.push(sprite);
		}
	};
	
	/**Remove uma sprite da animacao na posicao especificada
	@return core.Sprite a Sprite removida*/
	core.Animation.prototype.removeSprite = function(position) {
		return this.frames.shift(position);
	};
	
	// retorna uma sprite na posicao especifica dos quadros de animacao
	core.Animation.prototype.getSprite = function(position) {
		return this.frames[position];
	};
	
	// retorna o array com todas as sprites da animacao
	core.Animation.prototype.getSpriteList = function() {
		return this.frames;
	};

	/** 
		Inverte a sequencia da lista de sprites da animacao.
		-- O ultimo elemento se torna o primeiro e o primeiro se torna o ultimo.
	*/
	core.Animation.prototype.reverse = function()
	{
		/*var copyFrames = new Array()
		for(var i = 0; i< this.frames.length; ++i) {
			copyFrames[i] = this.frames[i];
		}
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i] = copyFrames[copyFrames.length-1 - i];
		}*/
		this.frames.reverse();
	};
	
	/** 
		Reduz o numero de frames da animacao. Util para otimizar animacoes muito grandes
		@param thinFactor 1(um) a cada "thinFactor" frames sera removido
		@param deleteFirstFrame (opcional) true, se o primeiro quadro pode ser removido
		@return {Integer} O numero de frames ao final da operacao
		*@example
		// suponha uma animacao que possui 30 frames de animacao
		* animation.thin(2); // 15 frames apos esta operacao
		* animatin.thin(3) // 20 frames apos esta operacao
	*/
	core.Animation.prototype.thin = function(/**Int*/ thinFactor,/**Boolean*/ deleteFirstFrame)
	{
		thinFactor = parseInt(thinFactor);
		
		var i = 1;
		
		if(deleteFirstFrame) {
			i = 0;
		}
			
		for(; i< this.frames.length; ++i) 
		{
			if(i % thinFactor == 0)
			{
				this.frames.remove(i);				
			}
		}
		return this.frames.length;
	};

	/** 
		Avanca para o proximmo sprite da animacao
	*/
	core.Animation.prototype.toNextFrame = function()
	{
		if(!this.paused && (this.loopsLeft>0 || this.everLoop))
		{	
			this.currentFrame ++;
			this.currentFrame = this.currentFrame%this.frames.length;
			if(this.currentFrame == this.frames.length-1 && !this.everLoop)
			{
				this.loopsLeft--;
			}
		}
	};

	/**
		Define uma velocidade uniforme para a exibicao dos frames da animacao.
		O valor de delay de cada sprite que compoe a animacao sera sobrescrito.
		@param fps	Velocidade em quadros por segundo
	*/
	core.Animation.prototype.setSpeed = function(/**Number*/ fps)
	{
		this.fps = fps;
		var seconds = (1/fps);
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].setDelay(seconds);
		}
		this.timeSinceLastFrame = this.getNextFrame().delay;
	};

	/** 
		Retorna o nome da animacao.
		@return {String} nome da animacao.
	*/
	core.Animation.prototype.getName = function()
	{
		return this.name;
	};

	/** 
		Retorna a core.Sprite corrente da animacao.
		@return {core.Sprite} core.Sprite corrente da animacao.
	*/
	core.Animation.prototype.getCurrentFrame = function()
	{
		return this.frames[this.currentFrame];
	};
	
	core.Animation.prototype.getCurrentFrameIndex = function()
	{
		return this.currentFrame;
	};
	
	core.Animation.prototype.isCurrentFrame = function(index)
	{
		return (this.currentFrame == index);
	};

	/** 
		Retorna a core.Sprite imediatamente posterior ao frame corrente.
		@return {core.Sprite}
	*/
	core.Animation.prototype.getNextFrame = function()
	{
		var next = (this.currentFrame + 1)%this.frames.length;
		return this.frames[next];
	};

	/** 
		Retorna se o ultimo frame da animacao foi desenhado (sem considerar loops).
		@return {Boolean} true se o ultimo frame da animacao foi desenhado, false caso contrario
	*/
	core.Animation.prototype.isLastFrame = function()
	{
		return (this.currentFrame == this.frames.length-1);
	};
		
	/** 
		Para saber se o ultimo frame da animacao foi desenhado (considerando loops).
		@return {Boolean} true se o ultimo frame da animacao foi desenhado, false caso contrario
	*/
	core.Animation.prototype.isEnded = function() 
	{
		return (this.loopsLeft == 0 && this.isLastFrame() && this.timeSinceLastFrame <= 0 && !this.everLoop)
	};

	/** 
		Indica que a animacao esta pronta pra comecar
		@private
	*/
	core.Animation.prototype.play = function(/**Number*/ numberOfLoops)
	{
		this.paused = false;
		this.numberOfLoops = numberOfLoops;
	};
	
	/** 
		Indica que a animacao esta pronta pra recomecar de onde parou
		@private
	*/
	core.Animation.prototype.resume = function()
	{
		this.paused = false;		
	};

	/** 
		Pausa a animacao
		@private
	*/
	core.Animation.prototype.pause = function()
	{
		this.paused = true;
	};

	/** 
		Volta a animacao para o primeiro quadro.
		@private
	*/
	core.Animation.prototype.reset = function(/*paused?*/)
	{
		this.currentFrame = 0;
		this.loopsLeft = this.numberOfLoops;
		this.paused = true;
	};
	
	// Funções de alterações ao conjunto total de sprites que pertencem à animação
	// IMPORTANTE: O uso dessas funções afeta a TODAS as Sprites da animação. 
	// Evite o uso dessas funções dentro de chamadas de update e draw pois o desempenho será afetado
	// negativamente.
	
	core.Animation.prototype.setGlobalRotationOffset = function(x, y)
	{		
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].setRotationOffset(x, y);
		}		
	};
	
	core.Animation.prototype.setGlobalProperties = function(alpha, angle, scaleX, scaleY)
	{
		if(alpha < 0 || alpha > 1) throw "valor invalido de alpha"
		
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].setProperties(opacity, angle, scaleX, scaleY);
		}		
	};
	
	core.Animation.prototype.setGlobalOpacity = function(alpha)
	{
		if(alpha < 0 || alpha > 1) throw "valor invalido de alpha"
		
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].setOpacity(alpha);
		}
	};
	
	core.Animation.prototype.setGlobalRotationAngle = function(angle)
	{
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].setRotationAngle(angle);
		}
	};
	
	/**
		@ignore	!!! em construcao !!!
	*/
	core.Animation.prototype.rotateBy = function(angle)
	{
		/*for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].rotateBy(angle);
		}*/
	};
	
	core.Animation.prototype.setGlobalScale = function(scaleX, scaleY)
	{
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].setScale(scaleX, scaleY);
		}
	};
	
	/**
		@ignore !!! em construcao !!!
	*/
	core.Animation.prototype.scaleBy = function(factor)
	{
		/*for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].scaleBy(factor);
		}*/
	};
	
	core.Animation.prototype.globalFlipX = function()
	{
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].flipX();
		}
	};
	
	core.Animation.prototype.globalFlipY = function()
	{
		for(var i = 0; i< this.frames.length; ++i) {
			this.frames[i].flipY();
		}
	};
	
	// -------------------------------------- // ----------------------------------------------//
	
	/**
		Atualiza o estado de animacao.
		@param dt o intervalo de tempo que passou desde a ultima atualizacao.
	*/
	core.Animation.prototype.update = function(/**Number*/ dt)
	{		
		this.timeSinceLastFrame -= dt;	
		if (this.timeSinceLastFrame <= 0 && !this.isEnded())
		{			
			// avanca um quadro
			this.toNextFrame();
			// calcula o tempo de duracao do proximo quadro
			this.timeBetweenFrames = this.getNextFrame().delay + this.timeSinceLastFrame;
			this.timeSinceLastFrame = this.timeBetweenFrames;				
		}
	};
	
	/**
		Renderiza a animacao.
		@param dt O intervalo de tempo que passou desde a ultima atualizacao.
		@param context O contexto onde o objeto sera desenhado.
		@param x Coordenada, no eixo x, do centro da animacao.
		@param y Coordenada, no eixo y, do centro da animacao.
		@param xScroll Valor de scrolling global do eixo x. 
		@param yScroll Valor de scrolling global do eixo y.
	*/
	core.Animation.prototype.draw = function(/**CanvasRenderingContext2D*/ context,/**Number*/ left,/**Number*/ top, /**Number*/ xScroll, /**Number*/ yScroll)
	{		
		// como uma core.Sprite eh desenhada a partir do seu canto superior esquerdo,
		// calculamos a transformacao de coordenadas para renderizar corretamente a animacao.
		this.getCurrentFrame().draw(context, left, top, xScroll, yScroll);
		/*var left = x-currSprite.width/2;
		var top = y-currSprite.height/2;*/
		
		// currSprite.draw(context, left, top, xScroll, yScroll);
	};
	
})(); // end global runtime closure
