(function() { // begin core.timer runtime closure
	/**
	 *	(Time Manager) Controle de tempo
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @final
	 * @static
	 * @memberOf core
	 * @constructor Nao deve ser chamado pelo usuario.
	 */
	core.timer = (function() { // begin constructor runtime closure
		
		var startTime = performance.now(), prevTime = startTime, lastTime = startTime, deltaTime = 0;
		var fps = 0, fpsMin = 1000, fpsMax = 0;
		var frames = 0;
		var time = 0;
		
		return {

			current: function() { return fps; },
			
			min: function() { return fpsMin; },
			
			max: function() { return fpsMax; },
			
			reset: function() { fps = 0; fpsMin = 1000; fpsMax = 0;},

			begin: function () {

				// startTime = lastTime = Date.now();
				startTime = performance.now();			
				
			},

			end: function (dt) {

				// var time = Date.now();
				time = dt;				

				frames ++;
				
				// tempo em milisegundos
				deltaTime = time - lastTime; 
				
				lastTime = time;

				if ( time > prevTime + 1000 ) {

					fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );					
					fpsMin = Math.min( fpsMin, fps );
					fpsMax = Math.max( fpsMax, fps );
					
					prevTime = time;

					frames = 0;

				}

				return time;

			},

			update: function (dt) {

				startTime = this.end(dt);

			},
			
			tick: function() // getTick
			{			
				// dt convertido em segundos
				return deltaTime / 1000; 
			},
			
			miliTime: function()
			{
				return deltaTime;
			}
		
		}
		
	})();// end constructor runtime closure
})(); // end core.timer runtime closure
	