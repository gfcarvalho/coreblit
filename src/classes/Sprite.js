(function() { // begin core.Sprite runtime closure
	/**
		Define um sprite, unidade basica de animacao, a partir de spritesheets
		@author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
		@constructor
	*/
	core.Sprite = function(/**Image or HTMLCanvasElement*/ image) {
		
		/*if( typeof image === "undefined" ){
			throw new Error("Sprite: constructor: parameter image is not defined.");
		}
		else if( !( (image instanceof Image) || (image instanceof HTMLCanvasElement) ) ){
			throw new TypeError("Sprite: constructor: parameter image most be of type Image or HTMLCanvasElement");			
		}*/
		
		/** Referencia para a imagem que contem o sprite
			@type Image
		*/
		this.spritesheet = image;

		/** Coordenada X do ponto de recorte na imagem
			@type Number
		*/
		this.xOffset = 0;

		/** Coordenada Y do ponto de recorte na imagem
			@type Number
		*/
		this.yOffset = 0;

		/** Largura original do frame que comtem a sprite
			@type Number
		*/
		this.width = this.spritesheet.width || 0;

		/** Altura original do frame que contem a sprite
			@type Number
		*/
		this.height = this.spritesheet.height || 0;

		/** Opacidade da sprite
			0 = transparencia maxima (invisivel)
			1 = sem efeito de transparencia
			@type Number
		*/
		this.opacity = 1;

		/** Angulo de rotacao da sprite
			@type Number
		*/
		this.rotationAngle = 0; 

		/** Permite a rotacao da sprite em relacao a um ponto qualquer do canvas.
			Move o centro de rotacao da imagem
			@type Number
		*/
		this.rotationOffsetX = 0;
		this.rotationOffsetY = 0;
		
		/** Escala horizontal do frame
			@type Number
		*/
		this.scaleX = 1;

		/** Escala vertical do frame
			@type Number
		*/
		this.scaleY = 1;

		/** Largura modificada do frame 
			@type Number
		*/
		this.scaledWidth = 1;

		/** Altura modificada do frame
			@type Number
		*/
		this.scaledHeight = 1;

		/** Tempo apos o desenho do frame anterior que o frame em questao deve esperar para ser 
				desenhado
			@type Number
			@default 1/30 s => 30 fps
		*/
		this.delay = 1/30;
		
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;
		 
	};
	/**
		Inicializa a sprite fazendo o recorte manualmente
		@type core.Sprite
		@param {Image} spritesheet A imagem a qual o frame sera recortado
		@param {Number} xOffset Coordenada X do ponto de recorte na imagem (canto superior esquerdo)
		@param {Number} yOffset Coordenada Y do ponto de recorte na imagem (canto superior esquerdo)
		@param {Number} width Largura do frame
		@param {Number} height Altura do frame
		@return {core.Sprite} A referencia para este objeto		
	 */
	core.Sprite.prototype.clip = function(/**Number*/ xOffset,
		/**Number*/ yOffset, /**Number*/ width, /**Number*/ height)
	{
		if( !( (this.spritesheet instanceof Image) || (this.spritesheet instanceof HTMLCanvasElement) ) ){
			throw new Error("Sprite: clip: impossivel recortar, imagem da Sprite nao foi definida.");
		}
		// verifica se o corte eh valido
		if(xOffset+width > this.spritesheet.width || yOffset+height > this.spritesheet.height){
			throw new Error("Sprite: clip: recorte invalido.");
		}
		this.xOffset = xOffset || 0;
		this.yOffset = yOffset || 0;
		this.width = width || this.spritesheet.width;
		this.height = height || this.spritesheet.height;
		
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;
		
		// guarda os valores de largura e altura após aplicada a escala
		this.scaledWidth = Math.abs(this.width * this.scaleX);
		this.scaledHeight = Math.abs(this.height * this.scaleY);
		return this;
	};
	
	/**
		Inicializa a sprite fazendo o recorte automaticamente.<br>
		Utilize para imagens que contem sprites uniformemente distribuidos. Se quiser converter um 
			imagem inteira em sprite, basta passar a imagem como parametro e deixar os outros campos
			vazios.
		@type core.Sprite
		@param {Image} spritesheet A imagem a qual a sprite sera recortada.
		@param {Number} rows Numero de sprites existentes na direcao VERTICAL da spritesheet
		@param {Number} columns Numero de sprites existentes na direcao HORIZONTAL da spritesheet
		@param {Number} spriteIndex Indice da sprite que sera recortada.
		Formato de indexacao demonstrado na imagem a seguir: <br> <img src="spritesheet_grid.png"/>		
		@return {core.Sprite} A referencia para este objeto
		@example
		* // monta uma sprite com a toda a imagem g_Resources.anyImage:
		* var anyImage = new core.Sprite().autoClip(g_Resources.anyImage);
		* // equivalente a:
		* var anyImage = new core.Sprite().autoClip(g_Resources.anyImage, 1, 1, 0);
		* // para recortar a sprite indice 3 de uma spritesheet com 2 linhas e 4 colunas:
		* var frame3 = new core.Sprite().autoClip(g_Resources.anySpriteSheet, 2, 4, 3);
		
	 */
	core.Sprite.prototype.autoClip = function(/**Number*/ rows, 
		/**Number*/ columns, /**Number*/ spriteIndex)
	{
		if( !( (this.spritesheet instanceof Image) || (this.spritesheet instanceof HTMLCanvasElement) ) ){
			throw new Error("Sprite: autoClip: impossivel recortar, imagem da Sprite nao foi definida.");
		}
		
		if(rows<=0 || columns<=0) 
		{
			throw new Error("Sprite: autoClip: rows e colummns devem ser maiores que 0.");
		}
		if(this.spritesheet.width%columns != 0 ) 
			throw new Error("Sprite: autoClip: A largura da imagem deve ser divisivel por columns.");
		if(this.spritesheet.height%rows != 0 ) 
			throw new Error("Sprite: autoClip: A altura da imagem deve ser divisivel por rows.");		
		
		this.width = this.spritesheet.width / columns;
		this.height = this.spritesheet.height / rows;

		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;		
		
		this.xOffset = this.width * (spriteIndex%columns);
		this.yOffset = this.height * Math.floor(spriteIndex/columns);		
		
		// guarda os valores de largura e altura após aplicada a escala
		this.scaledWidth = Math.abs(this.width * this.scaleX);
		this.scaledHeight = Math.abs(this.height * this.scaleY);
		return this;
	};
	
	/** 
		Faz uma copia de um sprite ja existente.
		@type core.Sprite
		@param {core.Sprite} other O core.Sprite a ser copiado.
		@return {core.Sprite} A referencia para este objeto.
	*/
	core.Sprite.prototype.clone = function(/**core.Sprite*/ other)
	{
		this.spritesheet = other.spritesheet;
		this.xOffset = other.xOffset;
		this.yOffset = other.yOffset;
		this.width = other.width;
		this.height = other.height;
		this.delay = other.delay;
		this.opacity = other.opacity;
		this.rotationAngle = other.rotationAngle;
		this.scaleX = other.scaleX;
		this.scaleY = other.scaleY;
		this.scaledWidth = other.scaledWidth;
		this.scaledHeight = other.scaledHeight;
		this.rotationOffsetX = other.rotationOffsetX;
		this.rotationOffsetY = other.rotationOffsetY;
		return this;
	};
	
	/** 
		Altera a transparencia do frame
		@param alpha	Deve ser um valor entre 0 e 1 <br>{0 = transparencia maxima (invisivel), 1 = sem efeito de transparencia}
	*/
	core.Sprite.prototype.setOpacity = function(/**Number*/ alpha)
	{
		if(alpha < 0 || alpha > 1) throw "Sprite: setOpacity: parametro alpha deve estar entre 0 e 1."
		
		this.opacity = alpha;
	};
	
	/** 
		Desloca o centro de rotacao da imagem.
	*/
	core.Sprite.prototype.setRotationOffset = function(xOffset, yOffset)
	{
		this.rotationOffsetX = xOffset;
		this.rotationOffsetY = yOffset;
	};

	/** 
		Altera o angulo de rotacao do frame
		@param angle	Angulo de rotacao em radianos
	*/
	core.Sprite.prototype.setRotationAngle = function(/**Number*/ angle)
	{
		this.rotationAngle = angle;
	};
	
	/**
		@ignore !!! nao foi testado !!!
	*/
	core.Sprite.prototype.rotateBy = function(/**Number*/ angle)
	{
		this.rotationAngle += angle;
	};

	/** 
		Altera a escala de desenho do frame
		@param sx	Escala horizontal
		@param sy	Escala vertical
	*/
	core.Sprite.prototype.setScale = function(/**Number*/ sx, /**Number*/ sy)
	{
		this.scaleX = sx;
		this.scaleY = sy;
		// guarda os valores de largura e altura após aplicada a escala
		this.scaledWidth = Math.abs(this.width * this.scaleX);
		this.scaledHeight = Math.abs(this.height * this.scaleY);		
	};
	
	/**
		@ignore !!! em construcao !!!
	*/
	core.Sprite.prototype.scaleBy = function(/**Number*/ factor)
	{
		/*this.scaleX *= factor;
		this.scaleY *= factor;
		// guarda os valores de largura e altura após aplicada a escala
		this.scaledWidth = Math.abs(this.width * this.scaleX);
		this.scaledHeight = Math.abs(this.height * this.scaleY);*/		
	};

	/** 
		Reflete o frame horizontalmente
	*/
	core.Sprite.prototype.flipX = function()
	{
		this.scaleX *= -1;
		this.scaledWidth = Math.abs(this.width * this.scaleX);
	};

	/** 
		Reflete o frame verticalmente
	*/
	core.Sprite.prototype.flipY = function()
	{
		this.scaleY *= -1;
		this.scaledHeight = Math.abs(this.height * this.scaleY);
	};

	/** 
		Define propriedades de render do frame.
		@param {Number} opacity Opacidade
		@param {Number} rotationAngle Angulo de rotacao em radianos 
		@param {Number} scaleX Escala horizontal
		@param {Number} scaleY Escala vertical
	*/
	core.Sprite.prototype.setProperties = function(/**Number*/ opacity, /**Number*/ rotationAngle, /**Number*/ scaleX, /**Number*/ scaleY)
	{
		this.opacity = opacity;
		this.rotationAngle = rotationAngle;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
		// guarda os valores de largura e altura após aplicada a escala
		this.scaledWidth = Math.abs(this.width * this.scaleX);
		this.scaledHeight = Math.abs(this.height * this.scaleY);
	};
	
	/** 
		Altera a informacao de atraso em relacao ao quadro de animacao anterior. (Utilizado na classe {@link core.Animation)
	*/
	core.Sprite.prototype.setDelay = function(delay)
	{
		this.delay = delay;
	};
	
	/** 
		@return Informacao de atraso em relacao ao quadro de animacao anterior.
	*/
	core.Sprite.prototype.getDelay = function()
	{	
		return this.delay;
	};
	
	/** 
		Obter as dimensoes correntes de largura e altura da sprite (considera fatores de escala aplicados)
		@return objeto na forma {width: Number, height: Number}, contendo a altura e largura atual da sprite
	*/
	core.Sprite.prototype.getCurrentDimensions = function()
	{
		return {widht: this.scaledWidth, height: this.scaledHeight};
	};;

	/*this.shear = function(sx, sy)
	{
		this.shearX = sx;
		this.shearY = sy;
	}*/

	/** 
		Retorna um novo core.Rectangle com as mesmas dimensoes da sprite. 
		Leva em conta a escala aplicada.
		As coordenadas (x, y) sao as coordenadas do centro do retangulo desejado 
		@param x Coordenada x do centro do retangulo
		@param y Coordenada y do centro do retangulo
		@return core.Rectangle
		@deprecated move to entitie
	*/
	core.Sprite.prototype.getBoundingRect = function(/**Number*/ x, /**Number*/ y)
	{
		/*var rectWidth  = this.scaledWidth;;
		var rectHeight = this.scaledHeight;
		var rectLeft = x -(rectWidth/2);
		var rectTop = y -(rectHeight/2);
		
		return new core.Rectangle().startupRectangle(rectLeft, rectTop, rectWidth, rectHeight);*/	
	};

	/**
		Desenha o frame no contexto especificado.
		@param {CanvasRenderingContext2D} context O contexto onde o objeto sera desenhado.
		@param {Number} left Posicao, no eixo x, do canto esquerdo do frame.
		@param {Number} top Posicao, no eixo y, do canto superior do frame.
		@param {Number} xScroll Valor de scrolling global do eixo x. 
		@param {Number} yScroll Valor de scrolling global do eixo y. 
    */
	core.Sprite.prototype.draw = function(/**CanvasRenderingContext2D*/ context, /**Number*/ left, /**Number*/ top, /**Number*/ xScroll, /**Number*/ yScroll)
	{
		var xpos = ~~((left - xScroll) + 0.5), 
		    ypos = ~~((top - yScroll) + 0.5), 
			scaled = (this.scaleX != 1 || this.scaleY != 1),
			rotated = this.angle != 0;
		
		// salva o contexto de forma a aplicar as alterações somente ao frame que está sendo desenhado
		context.save();
		// seta o valor da transparência do frame
		context.globalAlpha = this.opacity;
	
		if( scaled || rotated)
		{			
			var ax = this.rotationOffsetX  + this.halfWidth,
			    ay = this.rotationOffsetY  + this.halfHeight;				
			// leva a sprite para o centro do canvas para aplicar as operacoes de escala e rotacao
			context.translate(xpos + ax, ypos + ay);			
			// aplica rotação ao frame
			if(rotated)
				context.rotate(this.rotationAngle);
			// redimensiona a sprite de acordo com a escala definida
			if(scaled)
				context.scale(this.scaleX, this.scaleY); 
			// reposiciona a sprite na posicao correta de desenho					
			context.translate(-xpos - ax, -ypos - ay);		
		}
		// desenha a sprite depois de todas as alterações
		context.drawImage(this.spritesheet,
						  this.xOffset, this.yOffset, 
						  this.width, this.height, 
						  xpos, ypos, 
						  this.width, this.height); 				

		// restaura o contexto após modificar e desenhar o frame
		context.restore();
	};

})(); // end core.Sprite runtime closure
