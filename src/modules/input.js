(function() { // begin core.input runtime closure	
	// defini as constantes para eventos de entrada
	var NONE = Event.NONE || 0, 
		MOUSEDOWN = Event.MOUSEDOWN || 1, 
		MOUSEUP = Event.MOUSEUP || 2, 		
		MOUSEOVER = Event.MOUSEOVER || 4, 
		MOUSEOUT = Event.MOUSEOUT || 8, 
		MOUSEMOVE = Event.MOUSEMOVE || 16, 
		// api.MOUSEDRAG = Event.MOUSEDRAG || 32,
		CLICK = Event.CLICK || 64,
		DBLCLICK = Event.DBLCLICK || 128,
		MOUSEWHEEL = Event.MOUSEWHEEL || 2048,
		// touchscreen
		TOUCHSTART = Event.TOUCHSTART || 1,
		TOUCHEND = Event.TOUCHEND || 2,
		TOUCHMOVE = Event.TOUCHMOVE || 16,
		// api.TAP = Event.TAP || 64,
		// api.DBLTAP = Event.DBLTAP || 128,
		// teclado
		KEYDOWN = Event.KEYDOWN || 256,
		KEYUP = Event.KEYUP || 512;	

	/**
		Construtor para definir o comportamento individual de cada tecla
		@private
		@class
	*/
	var key = function(keyCode)
	{
		this.keyCode = keyCode;
		this.event = NONE;		
		this.time = null; // calcular o tempo de pressionamento
		this.locked = false;
		this.pressed = false;		
	};	

	key.prototype.fire = function(/**Int*/event)
	{		
		if(!this.locked && (this.event != event) )
		{
			this.event = event;
			this.time = performance.now();			
		}
		
		if(event == KEYDOWN)
				this.pressed = true;
		else if(event == KEYUP)
			this.pressed = false;		
	};
	
	key.prototype.lock = function()
	{
		this.locked = true;
	};
	
	// consome o evento e libera novos eventos
	key.prototype.unlock = function()
	{
		this.locked = false;		
		this.event = NONE;		
	};
	
	key.prototype.isPressed = function()
	{
		return this.pressed;
	};
	
	/*key.prototype.isReleased = function()
	{
		return !this.pressed;
	};*/
	
	var nullKey = new key(-1);
	
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
		
		// (!) Suporte a eventos de mouse e touch a caminho :)
		// lista dos eventos de mouse e touch suportados 
		/*var mouseEventList = ['mousewheel', 'mousemove', 'mousedown',  'mouseup', 'click', 'dblclick'];
		var touchEventList = [ undefined,   'touchmove', 'touchstart', 'touchend', 'tap' , 'dbltap'];		
		
		var mouse = {
			LEFT: 0,
			MIDDLE: 1,
			RIGHT:2,
			x: 0,
			y: 0,
			wx: 0,
			wy: 0			
		}*/
		
		var keyboardEnabled = false;
		
		var registeredKeys = [];
		
		// captura direta de eventos desativado por default
		var useCapture = false;
		
		// iterators
		var i = j = 0;  
		
		// indice de buscas
		var index = -1;	
		
		//==========================================================================================
		//                                    Public fields
		//==========================================================================================
		
		// event constants
		
		// mouse
		api.NONE = NONE;		
		api.MOUSEDOWN = MOUSEDOWN;
		api.MOUSEUP = MOUSEUP;				
		api.MOUSEOVER = MOUSEOVER;
		api.MOUSEOUT = MOUSEOUT;
		api.MOUSEMOVE = MOUSEMOVE;	
		// api.MOUSEDRAG = MOUSEDRAG;
		api.CLICK = CLICK;
		api.DBLCLICK = DBLCLICK;		
		api.MOUSEWHEEL = MOUSEWHEEL;
		
		// touchscreen
		api.TOUCHSTART = TOUCHSTART;
		api.TOUCHEND = TOUCHEND;
		api.TOUCHMOVE = TOUCHMOVE;
		// api.TAP = TAP;
		// api.DBLTAP = DBLTAP;
		
		// teclado
		api.KEYDOWN = KEYDOWN;
		api.KEYUP = KEYUP;
		// api.KEYPRESS = KEYPRESS;
		
		/**
			Dicionario de codigos das teclas (case-sensitive)
		*/
		api.KEY = {
			"BACKSPACE": 	8,
			"TAB": 			9,
			"ENTER":		13,
			"SHIFT":		16,
			"CTRL":			17,
			"ALT":			18,
			"PAUSE_BREAK":	19,
			"CAPS_LOCK":	20,
			"ESCAPE":		27,
			"SPACE":		32,
			"PAGE_UP":		33,
			"PAGE_DOWN":	34,
			"END":			35,
			"HOME":			36,
			"LEFT":			37,
			"UP":			38,
			"RIGHT":		39,
			"DOWN":			40,			
			"DELETE":		46,
			"KEY_0":		48,
			"KEY_1": 		49,
			"KEY_2":		50,
			"KEY_3":		51,
			"KEY_4":		52,
			"KEY_5":		53,
			"KEY_6":		54,
			"KEY_7":		55,
			"KEY_8":		56,
			"KEY_9":		57,
			"KEY_A":		65,
			"KEY_B":		66,
			"KEY_C":		67,
			"KEY_D":		68,
			"KEY_E":		69,
			"KEY_F":		70,
			"KEY_G":		71,
			"KEY_H":		72,
			"KEY_I":		73,
			"KEY_J":		74,
			"KEY_K":		75,
			"KEY_L":		76,
			"KEY_M":		77,
			"KEY_N":		78,
			"KEY_O":		79,
			"KEY_P":		80,
			"KEY_Q":		81,
			"KEY_R":		82,
			"KEY_S":		83,
			"KEY_T":		84,
			"KEY_U":		85,
			"KEY_V":		86,
			"KEY_W":		87,
			"KEY_X":		88,
			"KEY_Y":		89,
			"KEY_Z":		90,						
			"NUMPAD_0":		96,
			"NUMPAD_1":		97,
			"NUMPAD_2":		98,
			"NUMPAD_3":		99,
			"NUMPAD_4":		100,
			"NUMPAD_5":		101,
			"NUMPAD_6":		102,
			"NUMPAD_7":		103,
			"NUMPAD_8":		104,
			"NUMPAD_9":		105,
			"MULTIPLY":		106,
			"ADD":			107,
			"SUBTRACT":		109,
			"DECIMAL_POINT":110, 
			"DIVIDE":		111, 
			"EQUAL_SIGN":	187,
			"COMMA":		188
		}
		
		//==========================================================================================
		//                                   Private methods
		//==========================================================================================
		
		// comparador para ordenar as teclas em ordem crescente de codigo
		var comparator = function(a, b){return (a.keyCode - b.keyCode)};
		
		/**
			Previne a propagacao de eventos
		*/
		var preventDefault = function(e) 
		{
			// interrompe a propagacao do evento
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			else {
				e.cancelBubble = true; 
			}
			// nao executa a acao padrao do navegador para o evento
			if (e.preventDefault)  {
				e.preventDefault();
			}
			else  {
				e.returnValue = false;
			}

			return false;
		};		
		
		//==========================================================================================
		//                                    Public methods
		//==========================================================================================		
		
		/**
			Habilita um ou mais teclas. Cada codigo de tecla que desejar ativar deve ser 
			inserido como um parametro dafuncao
			@example
			core.input.enableKeys(core.input.KEY["up"], core.input.KEY["down"])
			// ou (!) draft
			core.input.enableKeys("up", "down") // conforme a lista de teclas @link ...
		*/
		api.enableKeys = function(/**Number*/ /* arg1, arg2, ... */)
		{			
			for (i = 0; i < arguments.length; ++i)
			{	
				var enableKey = true;				
				
				for (j = 0; j < registeredKeys.length; ++j)
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
			for (i = 0; i < arguments.length; ++i)
			{					
				for (j = 0; j < registeredKeys.length; ++j)
				{					
					if (arguments[i] == registeredKeys[j].keyCode )
					{				
						registeredKeys.remove(j); // desabilita o uso da tecla
						break;
					}										
				}
			}
		};	
		
		/**			
			Habilita eventos de teclado			
		 */
		api.enableKeyboard = function(_useCapture)
		{
			if(!keyboardEnabled) {
				useCapture = _useCapture;
				// observers para eventos de teclado
				window.addEventListener("keydown", onKeyDown, useCapture);
				window.addEventListener("keyup", onKeyUp, useCapture);						
				
				keyboardEnabled = true;			
				console.log("INPUT: Reconhecimento de eventos de teclado ativado.");
			}
		};
		
		api.disableKeyboard = function()
		{
			if(keyboardEnabled) {
				window.removeEventListener("keydown", onKeyDown, useCapture);
				window.removeEventListener("keyup", onKeyDown, useCapture);
				
				keyboardEnabled = false;
				console.log("INPUT: Reconhecimento de eventos de teclado desativado.");
			}
		};		
			
		var onKeyDown = function(event, keyCode)
		{
			index = registeredKeys.binarySearch((keyCode || event.keyCode || event.which), "keyCode");
			if(index != -1) {
				preventDefault(event);
				registeredKeys[index].fire(KEYDOWN);			
				return true; // return preventDefault(event); ???
			}
			return false; // return true??		
		};
		
		var onKeyUp = function(event, keyCode)
		{
			index = registeredKeys.binarySearch((keyCode || event.keyCode || event.which), "keyCode");
			if(index != -1) {
				preventDefault(event);
				registeredKeys[index].fire(KEYUP);			
				return true;
			}
			return false;
		};				
		
		api.getKey = function(keyCode)
		{
			api.enableKeys(keyCode); // garante que a tecla esteja registrada
			
			index = registeredKeys.binarySearch(keyCode, "keyCode");
			if(index != -1)
				return registeredKeys[index];			
			return nullKey;
		};
		
		/** 
			A ser chamada no gameLoop, antes de updates e draws
			@protected
		*/
		api.lock = function()
		{
			for (i = 0; i < registeredKeys.length; ++i)
			{
				registeredKeys[i].lock();
			}
		};

		/** 
			A ser chamada no gameLoop, apos updates e draws
			@protected
		*/
		api.unlock = function()
		{
			for (i = 0; i < registeredKeys.length; ++i)
			{
				registeredKeys[i].unlock();
			}
		};
		
		/*api.avoidAutoRepeat = function()
		{
		}*/
	
		return api;
		
	})(); // end constructor runtime closure

})(); // end core.input runtime closure
		