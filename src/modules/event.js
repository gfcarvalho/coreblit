/**
 * @preserve MinPubSub
 * A micro publish/subscribe messaging framework
 * @author Copyright (c) 2011 Daniel Lamb <daniellmb.com>
 * @see https://github.com/daniellmb/MinPubSub
 * Licensed under the MIT license.
 * ------------------------------------------------------------------------
 *	(The MIT License)
 *
 *	Permission is hereby granted, free of charge, to any person obtaining
 *	a copy of this software and associated documentation files (the
 *	'Software'), to deal in the Software without restriction, including
 *	without limitation the rights to use, copy, modify, merge, publish,
 *	distribute, sublicense, and/or sell copies of the Software, and to
 *	permit persons to whom the Software is furnished to do so, subject to
 *	the following conditions:
 *
 *	The above copyright notice and this permission notice shall be
 *	included in all copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 *	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 *	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ------------------------------------------------------------------------
 */
(function() { // begin core.display runtime closure

	/**
	 * (Event Manager) Gerenciador de eventos. <br>
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @namespace
	 * @memberOf core
	 */	
	core.event = (function(){

		/**	Armazena a interface(campos e metodos) publica deste modulo
			@private
		*/
		var api = {}; 
		
		//-------------------------------------	
		// Private fields
		//-------------------------------------
		
		/** topic/subscription hash
		 * @private
		 */
		var cache = {};
		
		//-------------------------------------	
		// Public fields
		//-------------------------------------		
		
		//
		// Canais publicados pela engine:
		// ---------------------------------------------------------
		
		// LOAD EVENTS
		api.LOAD_COMPLETE = "core.loader.loadcomplete";
		api.LOAD_SATUS = "core.loader.loadstatus";
		
		// DISPLAY EVENTS
		api.RESIZE = "core.display.resize";
		api.ORIENTATION_CHANGE = "core.display.resize";
		api.RESOLUTION_CHANGE = "core.display.resolutionchange";

		// GAME EVENTS
		api.GAME_RUN = "core.game.run";
		api.GAME_STOP = "core.game.stop";
		api.GAME_PAUSE = "core.game.pause";
		api.GAME_RESUME = "core.game.resume";

		// INPUT EVENTS
		api.CLICK = "core.input.click";
		api.DBLCLICK = "core.input.dblclick";
		api.MOUSEDOWN = "core.input.mousedown";
		api.MOUSEUP = "core.input.mouseup";
		api.MOUSEMOVE = "core.input.mousemove";
		api.MOUSEWHEEL = "core.input.mousewheel";
		api.MOUSEOVER = "core.input.mouseover";
		api.MOUSEOUT = "core.input.mouseout";
		api.TOUCHSTART = "core.input.touchstart";
		api.TOUCHEND = "core.input.touchend";
		api.TOUCHMOVE = "core.input.touchmove";
		api.KEYDOWN = "core.input.keydown";
		api.KEYUP = "core.input.keyup";
		api.KEYPRESS = "core.input.keypress";

		// DOCUMENT EVENTS
		api.BLUR = "document.blur";
		api.FOCUS = "document.focus";
		
		// ---------------------------------------------------------
		
		//-------------------------------------	
		// Private methods
		//-------------------------------------
		
		// -- nenhum metodo privado
		
		//-------------------------------------	
		// Public methods
		//-------------------------------------
	    /**
		 * Publish some data on a named topic.
		 *	@name core.event#publish
		 *	@function
		 *	@public
		 *	@type void
		 *	@param topic
		 *			The channel to publish on
		 *	@param args (optional)
		 *			The data to publish. Each array item is converted into an ordered
		 *			arguments on the subscribed functions.
		 *	@example:
		 *	// Publish stuff on '/some/topic'. Anything subscribed will be called
		 *	// with a function signature like: function(a,b,c){ ... }
		 *	
		 *	core.event.publish("/some/topic", ["a","b","c"]);
		 */
		api.publish = function(/** String */ topic, /** Array */ args){
			var subs = cache[topic],
				len = subs ? subs.length : 0;

			//can change loop or reverse array if the order matters
			while(len--){
				subs[len].apply(core.event, args || []); // core.event is right here?
			}
		};

		/**
		 * Register a callback on a named topic.
		 *	@name core.event#subscribe
		 *	@function
		 *	@public
		 *	@param topic
		 *			The channel to subscribe to
		 *	@param callback
		 *			The handler event. Anytime something is publish'ed on a 
		 *			subscribed channel, the callback will be called with the
		 *			published array as ordered arguments. 
		 *  @return {Array}
		 * 			A handle which can be used to unsubscribe this particular subscription.
		 *	@example:
		 *	// register function(a, b, c) in "/some/topic" channel
		 *	
		 *	core.event.subscribe("/some/topic", function(a, b, c){ // handle data  });
		 */
		api.subscribe = function(/** String */ topic, /** Function */ callback){
			if(!cache[topic]){
				cache[topic] = [];
			}
			cache[topic].push(callback);
			return [topic, callback]; // Array
		};
		
		/**			
		 * Disconnect a subscribed function for a topic.
		 *	@name core.event#unsubscribe
		 *	@function
		 *	@public
		 *	@type void
		 *	@param topic
		 *			The channel to subscribe to
		 *	@param callback (optional)
		 *			The return value from a subscribe call.
		 *	@example:
		 *	var handle = subscribe("/some/topic", function(){});
		 *	unsubscribe(handle);
		 */
		api.unsubscribe = function(/** Array */ handle, /** Function */ callback){
			var subs = cache[callback ? handle : handle[0]],
				callback = callback || handle[1],
				len = subs ? subs.length : 0;
			
			while(len--){
				if(subs[len] === callback){
					subs.splice(len, 1);
				}
			}
		};
		
		/** Remove all subscriptions of a channel	
			@deprecated (!)dangerous
		*/
		api.removeChannelListeners = function(/** String */ topic){
			if(cache[topic])
				cache[topic].clear();
		};
		
		/** Remove all subscriptions of all channels		
			@deprecated (!)dangerous
		*/
		api.removeAllListeners = function(){
				cache = {};
		};
		
		// fim
		return api;
	})();

})(); // begin core.event runtime closure
