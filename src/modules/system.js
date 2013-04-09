(function() { // begin core.system runtime closure
	
	/**
	 * Informacoes do sistema
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @namespace
	 * @memberOf core
	 */	
	core.system = (function() { // begin core.system constructor runtime closure
	
		/**	Armazena a interface(campos e metodos) publica deste modulo
			@private
		*/
		var api = {};
		
		//==========================================================================================
		//                                   Private fields
		//==========================================================================================
		
		// TODO: put private fields here
		
		//==========================================================================================
		//                                    Public fields
		//==========================================================================================
		
		// TODO: put public fields here
		
		//==========================================================================================
		//                                    Private methods
		//==========================================================================================
		
		// TODO: put private methods here
		
		//==========================================================================================
		//                                    Public methods
		//==========================================================================================
		
		api.browser = (function(){
			var ua = navigator.userAgent;
			var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
			return {
				IE:             !!window.attachEvent && !isOpera,
				Opera:          isOpera,
				WebKit:         ua.indexOf('AppleWebKit/') > -1,
				Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
				MobileSafari:   /Apple.*Mobile/.test(ua)
			}
		})();

		api.browserFeatures = {
			XPath: !!document.evaluate,

			
			Canvas: (function(){  
				var canvas = document.createElement('canvas'),
					isSupported = false;
				if(canvas.getContext) {
					isSupported = true;
				}
				
				canvas = null;
				
				return isSupported;				
			})(),
			
			Audio: (function(){  
				var audio = document.createElement('audio'),
					isSupported = false;
				if(audio.canPlayType) {
					isSupported = true;
				}
				
				audio = null;
				
				return isSupported;				
			})(),
			
			NativeRequestAnimationFrame: (function(){
				var vendors = ['ms', 'moz', 'webkit', 'o'],
					isSupported = false;
				
				if (!window.requestAnimationFrame)
				{
					for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {						
						if(window[vendors[x]+'RequestAnimationFrame']){
							isSupported = true;
							break;
						}
					}
				}
				else
				{
					isSupported = true;
				}
			 
				return isSupported;
			})(),
			
			LocalStorage: (typeof window.localStorage !== undefined)
		};
		
		// some synonyms for navigator fields and methods
		/*api.onLine = function()
		{
			return navigator.onLine();
		};
		
		api.language = function()
		{
			return navigator.language;
		};*/
	
		return api;
		
	})(); // end core.system constructor runtime closure

})(); // end core.system runtime closure
