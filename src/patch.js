/**
 * @fileOverview Patches e aprimoramentos na Javascript API. <br>
 * 				 Tambem verifica recursos disponiveis na Engine do navegador e
 *				 cria fallbacks para corrigir(melhorar/criar) 
 *				 alguns recursos quando nao estiverem disponiveis.
 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
 */
 
(function() {
	//=========================================================================
	// cross browser requestAnimationFrame/cancelAnimationFrame.
	// utiliza setTimeout e clearTimeout se o navegador não possuir suporte nativo
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	//=========================================================================
		
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		/** @ignore */
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		/** @ignore */
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
	{
		/** @ignore */
        window.requestAnimationFrame = function(callback, element) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
	}
 
    if (!window.cancelAnimationFrame)
	{
		/** @ignore */
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
	}
	
	//=========================================================================

	//=========================================================================
	// Fallback em caso de inexistencia do namespace console no navegador
	//=========================================================================
	if ( typeof(console) === "undefined" ) 
	{

		// Console do navegador. Detalhes em: "http://blogs.msdn.com/b/cdndevs/archive/2012/01/03/10168757.aspx"
		// Caso o navegador nao suporte chamadas ao console, definimos o console como um objeto vazio.
		// Assim evita-se o risco de erros ao tentar fazer chamadas de console em navegadores que nao possuem essa ferramenta.
		
		/** @ignore */
		console = {};
		/** @ignore */
		console.log = function() {};
		/** @ignore */	
		console.info = function() {};
		/** @ignore */
		console.error = function() {alert(Array.prototype.slice.call(arguments).join(", "));};
		/** @ignore */
		console.warn = function() {}; 
		/** @ignore */
		console.clear = function() {};
		/** @ignore */
		console.dir = function() {};
		/** @ignore */
		console.assert = function() {};
	};
	//=========================================================================

	//=========================================================================
	// Fallback em caso de Object.defineProperty nao ser suportado nativamente
	//=========================================================================
	if (!Object.defineProperty)
	{
		/**
		 * Simples definicao da funcao defineProperty (se nao suportada nativamente pelo navegador)<br>
		 * Se defineProperty for redefinida, internamente usa __defineGetter__/__defineSetter__ como fallback.
		 * @param {Object} obj O objeto o qual definiremos a propriedade.
		 * @param {String} prop O nome da propriedade a ser definida ou modificada.
		 * @param {Object} desc O descritor para a propriedade que esta sendo definida ou modificada.
		 * @private
		 */
		Object.defineProperty = function(obj, prop, desc) {
			// verifica se o objeto suporta a funcao __defineGetter
			if (obj.__defineGetter__) {
				if (desc.get) {
					obj.__defineGetter__(prop, desc.get);
				}
				if (desc.set) {
					obj.__defineSetter__(prop, desc.set);
				}
			} else {
				// nao devemos nunca chegar nesse ponto....
				throw "Object.defineProperty nao suportado";
			}
		}
	};
	//=========================================================================
	
	//=========================================================================
	// Fallback em caso de Date.now nao ser suportado nativamente
	//=========================================================================
	if (typeof Date.now === "undefined") 
	{
			/**
			 * fornece uma substituicao para o browser que
			 * nao suporte Date.now (JS 1.5)
			 * @private
			 */
			Date.now = function(){return new Date().getTime()};
	};
	//=========================================================================

	//=========================================================================
	// Extensoes de objetos Javascript nativos
	//=========================================================================
	var slice = Array.prototype.slice;
	
	function update(array, args) {
		var arrayLength = array.length, length = args.length;
		while (length--) array[arrayLength + length] = args[length];
		return array;
	}
	
	Function.prototype.delay = function (timeout) {
		var __method = this, args = slice.call(arguments, 1);
		timeout = timeout * 1000;
		return window.setTimeout(function() {
			return __method.apply(__method, args);
		}, timeout);
	};

	Function.prototype.defer = function () {
		var args = update([0.01], arguments);
		return this.delay.apply(this, args);
	};
	
	Array.prototype.clear = function()	{
		this.length = 0;
		return this;
	};
	
	/**
		Remove um certo numero de objetos do array
		@extends Array
		@param {Number} from Posicao no array do primeiro objeto a ser removido
		@param {Number} to (Opcional) Posicao no array do ultimo objeto a ser removido
	*/
	Array.prototype.remove = function(/**Number*/ from, /**Number*/ to)
	{	  
	  this.splice(from, 1);
	};

	/**
		Remove um objeto especifico do array
		@extends Array
		@param {Object} object O objeto a ser removido
	*/
	Array.prototype.removeObject = function(object)
	{
		/*
		if(!this.indexOf)
		{
			for (var i = 0; i < this.length; ++i)
			{
				if (this[i] === object)
				{				
					this.splice(i, 1);
					break;
				}
			}
		}*/
		
		var index = this.indexOf(object, 0);
		(index == -1) || this.splice(index, 1);
	};
	/** 
	 * adiciona trim fn ao objeto string
	 * Retira os espacos em branco da string
	 * @extends String
	 * @return {String} trimmed string
	 */
	String.prototype.trim = function() {
		return (this.replace(/^\s+/, '')).replace(/\s+$/, '');
	};

	/**
	 * adiciona isNumeric fn ao objeto string 
	 * @extends String
	 * @return {Boolean} true se a string contem apenas digitos numericos
	 */
	String.prototype.isNumeric = function() {
		return (this != null && !isNaN(this) && this.trim() != "");
	};

	/**
	 * adiciona isBoolean fn ao objeto string
	 * @extends String
	 * @return {Boolean} true se a string for "true" ou "false"
	 */
	String.prototype.isBoolean = function() {
		return (this != null && ("true" == this.trim() || "false" == this
				.trim()));
	};

	/**
	 * adiciona contains fn ao objeto string
	 * @extends String
	 * @param {String} word palavra a verificar
	 * @return {Boolean} true se a string contem a palavra, false caso contrario
	 */
	String.prototype.contains = function(word) {
		return this.indexOf(word) > -1;
	};

	/**
	 * Converte a string para hexadecimal
	 * @extends String
	 * @return {String} 
	 */
	String.prototype.toHex = function() {
	  var res = "", c = 0;
	  while(c<this.length){
		 res += this.charCodeAt(c++).toString(16);
	  }
	  return res;
	};


	/**
	 * adiciona clamp fn ao objeto Number
	 * Fixa o numero entre dois valores
	 * @extends Number
	 * @param {Number} low Menor valor que o numero pode atingir
	 * @param {Number} high Maior valor que o numero pode atingir
	 * @return {Number} o valor fixado
	 */
	Number.prototype.clamp = function(low, high) {
		return this < low ? low : this > high ? high : this;
	};

	/**
	 * retorna um numero aleatorio entre min, max
	 * @extends Number
	 * @param {Number} min valor minimo.
	 * @param {Number} max valor maximo
	 * @return {Number} valor aleatorio
	 */
	Number.prototype.random = function(min, max) {
		return (~~(Math.random() * (max - min + 1)) + min);
	};

	/**
	 * Fixa(round) o numero de casas decimais ao numero de digitos especificado
	 * @extends Number
	 * @param {Number} [num="Object value"] value to be rounded.
	 * @param {Number} dec number of decimal digit to be rounded to.
	 * @return {Number} rounded value
	 * @example
	 * // round a specific value to 2 digits
	 * Number.prototype.round (10.33333, 2); // return 10.33
	 * // round a float value to 4 digits
	 * num = 10.3333333
	 * num.round(4); // return 10.3333
	 */
	Number.prototype.round = function() {
		// if only one argument use the object value
		var num = (arguments.length == 1) ? this : arguments[0];
		var powres = Math.pow(10, arguments[1] || arguments[0]);
		return (Math.round(num * powres) / powres);
	};

	/**
	 * uma rapida funcao toHex <br>
	 * o numero <b>precisa</b> ser um inteiro, com valor entre 0 e 255
	 * @extends Number
	 * @return {String} valor hexadecimal convertido
	 */
	Number.prototype.toHex = function() {
		return "0123456789ABCDEF".charAt((this - this % 16) >> 4)
				+ "0123456789ABCDEF".charAt(this % 16);
	};

	/**
	 * Retorna um valor indicando o sinal de um numero <br>
	 * @extends Number
	 * @return {Number} Sinal do numero<br>
				Positivo retorna 1.<br> Negativo retorna -1.
	 */
	Number.prototype.sign = function() {
		return this < 0 ? -1 : (this > 0 ? 1 : 0);  
	}

	/**
	 * Converte um angulo em graus para um angulo em radianos.
	 * @param {Number} [angle="angle"] angulo em graus
	 * @extends Number
	 * @return {Number} angulo correspondente em radianos
	 * @example
	 * // converte um angulo especifico
	 * Number.prototype.degToRad (60); // return 1.0471...
	 * // converte o valor do objeto
	 * var num = 60
	 * num.degToRad(); // return 1.0471...
	 */
	Number.prototype.degToRad = function (angle) {
		return (angle||this) / 180.0 * Math.PI;
	};

	/**
	 * Converte um angulo em radianos para um angulo em graus
	 * @param {Number} [angle="angle"] angulo em radianos
	 * @extends Number
	 * @return {Number}angulo correspondente em graus
	 * @example
	 * // converte um angulo especifico
	 * Number.prototype.radToDeg (1.0471975511965976); // return 59.9999...
	 * // converte o valor do objeto
	 * num = 1.0471975511965976
	 * Math.ceil(num.radToDeg()); // return 60
	 */
	Number.prototype.radToDeg = function (angle) {
		return (angle||this) * (180.0 / Math.PI);
	};
	
	//=========================================================================
}());
