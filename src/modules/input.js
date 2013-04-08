(function() { // begin core.input runtime closure	
	
	var key = function(keyCode)
	{
		this.keyCode = keyCode;
		this.event = "idle";
		this.time = null;
		this.locked = false;
		this.pressed = false;			
	};	
	
	key.prototype.fire = function(/**String*/event)
	{
		// armazena apenas o primeiro evento neste quadro
		if(!this.locked)
		{
			this.event = event;
			this.time = Date.now();
			this.lock();		
		}
		
		if(event == "core.input.keydown")
				this.pressed = true;
		else if(event == "core.input.keyup")
			this.pressed = false;		
	};
	
	key.prototype.lock = function()
	{
		this.locked = true;
	};
	
	key.prototype.unlock = function() // eat event
	{
		this.locked = false;
		this.event = "idle";
	};
	
	key.prototype.isPressed = function()
	{
		return this.pressed;
	};
	
	/**
	 * (Input Manager) Gerenciador de entrada (teclado, mouse, touchscreen)
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @namespace
	 * @memberOf core
	 */	
	core.input = (function() { // begin constructor runtime closure
	
		/**	Armazena a interface publica deste modulo
			@private
		*/
		var api = {};
		
		//==========================================================================================
		//                                   Private fields
		//==========================================================================================
		
		// list of supported mouse & touch events
		var mouseEventList = ['mousewheel', 'mousemove', 'mousedown',  'mouseup', 'click', 'dblclick'];
		var touchEventList = [ undefined,   'touchmove', 'touchstart', 'touchend', 'tap' , 'dbltap'];		
		
		var mouse = {
			LEFT: 0,
			MIDDLE: 1,
			RIGHT:2,
			x: 0,
			y: 0,
			wx: 0,
			wy: 0			
		}
		
		var registeredKeys = [];
		var eventStack  = [];
		
		
		
		//==========================================================================================
		//                                    Public fields
		//==========================================================================================
		
		// TODO: put your public fields here
		
		//==========================================================================================
		//                                   Private methods
		//==========================================================================================
		
		var comparator = function(a, b){return (a.keyCode - b.keyCode)};
		
		//==========================================================================================
		//                                    Public methods
		//==========================================================================================
		
		api.enableKeys = function(/**Number*/ /* arg1, arg2, ... */)
		{			
			for (var i = 0; i < arguments.length; ++i)
			{	
				var enableKey = true;				
				
				for (var j = 0; j < registeredKeys.length; ++j)
				{
					// verifica se a tecla ja esta habilitada
					if (arguments[i] == registeredKeys[j].keyCode )
					{				
						enableKey = false; // evita duplicatas de teclas registradas
						break; 
					}										
				}
				if(enableKey)
				{
					// habilita a tecla
					registeredKeys.push(new key(arguments[i]));					
				}
			}
			registeredKeys.sort(comparator);
		};
		
		api.disableKeys = function(/**Number*/ /* arg1, arg2, ... */)
		{			
			for (var i = 0; i < arguments.length; ++i)
			{					
				for (var j = 0; j < registeredKeys.length; ++j)
				{
					// verifica se a tecla ja esta habilitada
					if (arguments[i] == registeredKeys[j].keyCode )
					{				
						registeredKeys.remove(j);
						break;
					}										
				}
			}
		};
		
		/**
			Inicializa o controlador
			@type Input
			@param {Boolean} keyboard	true se o controlador deve verificar eventos de teclado, false caso contrario
			@param {Boolean} mouseOrTouch	true se o controlador deve verificar eventos de mouse, false caso contrario
			@return {Input}	A referencia para este objeto			
		 */
		api.enableKeyboard = function()
		{		
			// observers para eventos de teclado
			window.addEventListener("keydown", onKeyDown, false);
			window.addEventListener("keyup", onKeyUp, false);						
			
			console.log("INPUT: Reconhecimento de eventos de teclado ativado.");		
			
		};
		
		var onKeyDown = function(event)
		{
			var index = registeredKeys.binarySearch2(event.keyCode, "keyCode");
			if(index !=-1) {
				registeredKeys[index].fire("core.input.keydown");			
				return true;
			}
			return false;
			
			// console.log("keydown");
		};
		
		var onKeyUp = function(event)
		{
			var index = registeredKeys.binarySearch2(event.keyCode, "keyCode");
			if(index !=-1) {
				registeredKeys[index].fire("core.input.keyup");			
				return true;
			}
			return false;
		}				
		
		api.getKeyStatus = function(keyCode)
		{
			var index = registeredKeys.binarySearch2(keyCode, "keyCode");
			if(index != -1)
				return registeredKeys[index];			
			return null;
		};					
	
		return api;
		
	})(); // end constructor runtime closure

})(); // end core.input runtime closure

/*api.KEY = {
			"BACKSPACE": 8,
			"TAB": 9,
			"ENTER":	13,
			"SHIFT":	16,
			"CTRL":	17,
			"ALT":	18,
			"PAUSE_BREAK":	19,
			"CAPS_LOCK":	20,
			"ESCAPE":		27,
			"SPACE":	32,
			"PAGE_UP":	33,
			"PAGE_DOWN":	34,
			"END":	35,
			"HOME":	36,
			"LEFT_ARROW":	37,
			"UP_ARROW":	38,
			"RIGHT_ARROW":	39,
			"DOWN_ARROW":	40,			
			"DELETE":	46,
			"KEY_0":	48,
			"KEY_1": 	49,
			"KEY_2":	50,
			"KEY_3":	51,
			"KEY_4":	52,
			"KEY_5":	53,
			"KEY_6":	54,
			"KEY_7":	55,
			"KEY_8":	56,
			"KEY_9":	57,
			"KEY_A":	65,
			"KEY_B":	66,
			"KEY_C":	67,
			"KEY_D":	68,
			"KEY_E":	69,
			"KEY_F":	70,
			"KEY_G":	71,
			"KEY_H":	72,
			"KEY_I":	73,
			"KEY_J":	74,
			"KEY_K":	75,
			"KEY_L":	76,
			"KEY_M":	77,
			"KEY_N":	78,
			"KEY_O":	79,
			"KEY_P":	80,
			"KEY_Q":	81,
			"KEY_R":	82,
			"KEY_S":	83,
			"KEY_T":	84,
			"KEY_U":	85,
			"KEY_V":	86,
			"KEY_W":	87,
			"KEY_X":	88,
			"KEY_Y":	89,
			"KEY_Z":	90,						
			"NUMPAD_0":	96,
			"NUMPAD_1":	97,
			"NUMPAD_2":	98,
			"NUMPAD_3":	99,
			"NUMPAD_4":	100,
			"NUMPAD_5":	101,
			"NUMPAD_6":	102,
			"NUMPAD_7":	103,
			"NUMPAD_8":	104,
			"NUMPAD_9":	105,
			"MULTIPLY":	106, // ( * )
			"ADD":	107, // ( + )
			"SUBTRACT":	109, // -
			"DECIMAL_POINT":	110, // ( . )
			"DIVIDE":	111, // ( / )
			"EQUAL_SIGN":	187, // ( = )
			"COMMA":	188, // ( , )			
		};*/
		