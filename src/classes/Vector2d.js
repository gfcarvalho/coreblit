(function() { // begin core.Vector2d runtime closure

	/**
		Abstracao para vetores no plano (2D)
		@author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
		@constructor
	*/
	core.Vector2d = function(x, y)
	{
		/**
			Coordenada X do vetor
			@public
			@type Number
		*/
		this.x = x || 0;
		
		/**
			Coordenada Y do vetor
			@public
			@type Number
		*/
		this.y = y || 0;	   		
		
	};
	
	//==============================================================================================
	//                                    Public methods 
	//==============================================================================================

	core.Vector2d.prototype.copy = function(/**Vector2d*/ other)
    {
		// if(typeof other !== core.Vector2d)
			// throw new Error("parametro other precisa ser do tipo Vector2d");
			
        this.x = other.x;
        this.y = other.y;	
        return this;
    };
	
	/**
        Inicializa o vetor
        @param {Number} x	Posição do objeto no eixo Y
        @param {Number} y	Posição do objeto no eixo X
    */
    core.Vector2d.prototype.set = function(/**Number*/ x, /**Number*/ y)
    {
        this.x = x || 0;
        this.y = y || 0;	
        return this;
    };
	
	/**
        Multiplica o vetor por um escalar K
        @param {Number} k	Escalar que modifica a magnitude do vetor       
    */
	core.Vector2d.prototype.scalar = function(/**Number*/k)
	{
		this.x *= k;
		this.y *= k;
		return this;
	};
	
	/**
        Inicializa o vetor dado por coordenadas polares		
        @param {Number} k	Dimensao do vetor
        @param {Number} angle	Angulo de rotacao em relacao ao eixo Y = {x:0, y:-1} 
			dado no sentido horario
    */
	core.Vector2d.prototype.setPolar = function(k, angle)
	{
		var ang = angle % (2*Math.PI);	
		this.x = Math.sin(ang);
		this.y = -Math.cos(ang);
		return this.scalar(k);		
	};
	
	core.Vector2d.prototype.setMagnitude = function(/**Number*/ magnitude)
	{
		return this.normalize().scalar(magnitude);
	};
	
	/**
        Verifica se eh o vetor nulo
        @return {Boolean} true, se for o vetor nulo, false caso contrario.
    */
	core.Vector2d.prototype.isNull = function()
	{
		return (this.x == 0 && this.y == 0);
	};
	
	core.Vector2d.prototype.nullify = function()
	{
		return this.set(0, 0);
	};
	
	/**
        Produto escalar entre dois vetores
		@function
        @param {Vector2d} other		Vetor a ser computado
		@return	{Number} 			Retorna um escalar, resultado do produto escalar
    */
	core.Vector2d.prototype.dot = function(other)
	{
		return ((this.x * other.x) + (this.y * other.y));
	};

	/**
        Calcula a norma(tamanho) do vetor
		@function
		@return	{Number} Norma do vetor
    */
	core.Vector2d.prototype.magnitude = function()
	{
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	};

	/**
        Normaliza o vetor se este nao for o vetor nulo.
		@function
    */
	core.Vector2d.prototype.normalize = function()
	{
		// nao continua a operacao se for o vetor nulo
		if(this.isNull())
			return this;
		
		var mag = this.magnitude();		
		this.x /= mag;
		this.y /= mag;
		
		return this;
	};

	/**
        Soma um outro vetor a este
		@function
        @param {Vector2d} other	Vetor a ser somado a este
    */
	core.Vector2d.prototype.add = function(other)
	{		
		this.x += other.x,
		this.y += other.y;
		
		return this;
	};
	
	/**
		Soma este vetor com o inverso do outro vetor
		@function
        @param {Vector2d} other	Vetor a subtrair este
    */
	core.Vector2d.prototype.subtract = function(other)
	{		
		this.x -= other.x,
		this.y -= other.y;
		
		return this;
	};

	/**
        Calcula o angulo entre dois vetores
		@function
        @param {Vector2d} other		Vetor a ser computado
		@return {Number}			Ângulo (em radianos) entre os vetores
    */
	core.Vector2d.prototype.angleBetween = function(other)
	{
		return Math.acos(this.dot(other) / (this.magnitude() * other.magnitude()));
	};

	/**
        Rotaciona o vetor com o angulo fornecido, no sentido horario
		@function
        @param {Number} angle Angulo de rotação do vetor
    */
	core.Vector2d.prototype.rotate = function(angle)
	{
		// calcula a rotação
		var ca = Math.cos(angle);
		var sa = Math.sin(angle);
		var rx = this.x * ca - this.y * sa;
		var ry = this.x * sa + this.y * ca;
		// atribui os novos valores
		this.x = rx * -1;
		this.y = ry * -1;
		
		return this;
	};

	/**
        Inverte a direção do vetor
		@function
    */
	core.Vector2d.prototype.invert = function()
	{
		this.x *= -1;
		this.y *= -1;
		
		return this;
	};

	/**
		Produto vetorial entre dois vetores no plano 2D.
		O resultado sera sempre um vetor no eixo z.
		@function
		@param {Vector2d} other
	*/
	core.Vector2d.prototype.cross = function(other)
	{
		this.x = 0;
		this.y = 0;
		this.z = (this.x * other.y) - (other.x * this.y);
		
		return this;
	};
	
	//===================================================================================================
	//                                    Public Static methods 
	//===================================================================================================

	/**
		Calcula a distancia entre dois objetos que possuam coordenadas numericas x, y
		@function
		@public
		@static
		@param	a Qualquer objeto que possua propriedades x e y
		@param	b Qualquer objeto que possua propriedades x e y
		@return {Number} Distância entre a e b
	*/
	core.Vector2d.distance = function(A, B)
	{
		return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
	}

	/**
		Cria um novo vetor que aponta de A para B e possui a norma da distancia entre A e B.
		@function
		@param	A	Qualquer objeto que possua propriedades x e y 
		@param	B	Qualquer objeto que possua propriedades x e y 
		@return {core.Vector2d}	vetor AB
	*/	
	core.Vector2d.pointer = function(A, B)
	{
		var x = B.x - A.x;
		var y = B.y - A.y
		return new core.Vector2d(x, y);
	}
	
})(); // end core.Vector2d runtime closure
