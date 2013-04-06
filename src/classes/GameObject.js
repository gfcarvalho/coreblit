(function(game) { // begin core.GameObject runtime closure
	// 'use strict'
	
	/**
	 *	Proximo valor valido para um identificador de jogo
	 *	@static
	 *	@private
	 */
	var nextID = 0;
	
	/**
	 *	Construtor base para os elementos que aparecem no jogo.
	 *	@author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 *	@constructor
	 *	@memberOf core
	 *	@require core.game
	 *	@param {Number} x Coordenada do objeto no eixo X.
	 *	@param {Number} y Coordenada do objeto no eixo Y.
	 *	@param {Number} z Indice de profundidade (eixo Z).
	 */
	core.GameObject = function(/**Number*/x, /**Number*/y, /**Number*/z) {
		/** 
		 *	Game Identifier: ID do objeto de jogo. 
		 *	@type Number
		 *	@private
		 */
		var GID  = ++nextID;
		
		/** 
		 *	Flag para indicar que o objeto foi inserido na colecao de objetos do Game Manager
		 *	@type Boolean
		 *	@private
		 */
		var inGame = false;
		
		/** 
		 * Coordenada do objeto no eixo X
		 *	@name core.GameObject#x
		 *	@type Number
		 *  @public
		 */
		this.x = x || 0;
		
		/** 
		 *	Coordenada do objeto no eixo Y
		 *	@name core.GameObject#y
		 *	@type Number
		 *	@public
		 */
		this.y = y || 0;

		/** 
		 *	Profundidade de renderizacao
		 *	@name core.GameObject#zOrder
		 *	@type Number
		 *	@public
		 */
		this.zOrder = z || 0;
		
		/** 
		 *	Retorna o identificador (ID) do objeto.
		 *	@name core.GameObject#getID
		 *	@public (privileged)
		 *	@return {Boolean}
		 */
		this.getID = function()	{
			return GID;
		};
		
		/** 
		 *	Adiciona o objeto a colecao de objetos do jogo
		 *	@name core.GameObject#addToGame
		 *	@public (privileged)
		 */
		this.addToGame = function() {
			if(!inGame) {
				game.addGameObject(this);
				inGame = true;
			}
		};
		
		/** 
		 *	Remove o objeto da colecao de objetos do jogo
		 *	@name core.GameObject#removeFromGame
		 *	@public (privileged)
		 */
		this.removeFromGame = function() {
			if(inGame) {
				game.removeGameObject(this);		
				inGame = false;
			}
		}
	};
	
	//==============================================================================================
	//                                      Public methods
	//==============================================================================================
	
	/**
	 *	Inicializa ou reinicializa o objeto e o adciona a colecao de objetos do Game Manager
	 *	@type GameObject
	 *	@param {Number} x Coordenada do objeto no eixo X.
	 *	@param {Number} y Coordenada do objeto no eixo Y.
	 *	@param {Number} z Indice de profundidade (eixo Z).
	 *	@return {GameObject} A referencia para o objeto inicializado.
	 */
	core.GameObject.prototype.startup = function(/**Number*/x, /**Number*/y, /**Number*/z) {					
		this.x = x || 0;
		this.y = y || 0;
		this.zOrder = z || 0;

		this.addToGame();
		
		return this;
	};
	
	/**
	 *	Move o objeto
	 *	@param {Number} x Move o objeto no eixo X
	 *	@param {Number} y Move o objeto no eixo Y
	 */	
	core.GameObject.prototype.move = function(/**Number*/x, /**Number*/y) {
		this.x += x;
		this.y += y;
	};
	
	/**
	 *	Altera a posicao do objeto no espaco de jogo.
	 *	@param {Number} x Coordenada do objeto no eixo X.
	 *	@param {Number} y Coordenada do objeto no eixo Y.
	 */
	core.GameObject.prototype.setPosition = function(/**Number*/x, /**Number*/y) {
		this.x = x;
		this.y = y;
	};
	
	/**
	 *	Altera a coordenada X do objeto no espaco de jogo.
	 *	@param {Number} x Coordenada do objeto no eixo X.
	 */
	core.GameObject.prototype.setX = function(/**Number*/x) {
		this.x = x;		
	};

	/**
	 *	Altera a coordenada Y do objeto no espaco de jogo.
	 *	@param {Number} y Coordenada do objeto no eixo Y.
	 */
	core.GameObject.prototype.setY = function(/**Number*/y) {
		this.y = y;
	};
	
	/**
	 *	Retorna o vetor posicao do objeto.
	 *	@return {core.Vector2d}
	 */
	core.GameObject.prototype.getPosition = function() {
		return new core.Vector2d(this.x, this.y);
	};
	
	/**
	 *	Retorna a coordenada X do objeto.
	 *	@return {Object} Coordenada X do objeto
	 */
	core.GameObject.prototype.getX = function()	{
		return this.x;
	};
	
	/**
	 *	Retorna a coordenada Y do objeto.
	 *	@return {Object} Coordenada Y do objeto
	 */
	core.GameObject.prototype.getY = function() {
		return this.y;
	};

	/**
	 *	Altera a profundidade do objeto no espaco de jogo.
	 *	(!) Reordene a colecao de objetos para manter a ordem de rendering correta.
	 *	@param {Number} z indice de profundidade
	 */
	core.GameObject.prototype.setZOrder = function(/**Number*/z) {
		this.zOrder = z;	
	};

	/**
	 *	Retorna a profundidade (zOrder) do objeto.
	 *	@return {Number} Profundidade do objeto
	 */
	core.GameObject.prototype.getZOrder = function() {
		return this.zOrder;
	};

	/**
	 *	Remove o objeto da colecao de objetos do jogo.
	 */
	core.GameObject.prototype.shutdown = function()	{		
		this.onDestroy();
		// game.removeGameObject(this);		
		this.removeFromGame();
	};
	
	/**
	 *	Callback executado no momento da chamada de core.GameObject#shutdown,
	 *	imediatamente antes de ser removido da colecao de objetos do jogo.
	 */
	core.GameObject.prototype.onDestroy = function() {
		// Nao faz nada por default. Deve ser sobrecarregado.
	};	
	
	/*core.GameObject.prototype.update = function()
	{
		// deve ser sobrecarregado
	};

	core.GameObject.prototype.draw = function()
	{
		// deve ser sobrecarregado
	};*/

})(core.game); // end core.GameObject runtime closure
