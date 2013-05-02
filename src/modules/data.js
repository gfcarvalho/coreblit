(function(display, game) { // begin core.data runtime closure	
	
	/**
	 * Default Load Screen
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @namespace
	 * @memberOf core
	 */	
	core.loadingScreen = (function(display) { // begin constructor runtime closure
	
		//var context = display.context2D;
	
		/**	Armazena a interface publica deste modulo
			@private
		*/
		var api = {};
		
		//==========================================================================================
		//                                   Private fields
		//==========================================================================================
		
		// TODO: put your private fields here
		
		//==========================================================================================
		//                                    Public fields
		//==========================================================================================
		
		// --
		
		//==========================================================================================
		//                                   Private methods
		//==========================================================================================
		
		// --
				
		//==========================================================================================
		//                                    Public methods
		//==========================================================================================
		
		// tela mostrada assim que a pagina eh carregada 
		api.drawSplashScreen = function(context){	
			if(display.initialized()){
				display.clear();
				
				context.save();				
				context.fillStyle = "black";
				context.fillRect(0, 0, display.canvas.width, display.canvas.height);
				
				context.fillStyle = "white";
				context.textAlign = "right";
				context.font = "32px century gothic";
				context.fillText("Core", display.canvas.width/2, display.canvas.height/2-20);				
				context.textAlign = "left";
				context.font = "32px century gothic";				
				context.fillStyle = "red";
				context.fillText(" BliT!", display.canvas.width/2, display.canvas.height/2-20);
				
				
				// empty progress
				context.fillStyle = "rgba(96, 92, 69, 0.8)";				
				context.fillRect(0, (display.canvas.height/2 + 5), display.canvas.width, 12);
				
				context.strokeStyle = "white";
				context.lineWidth = 3;
				context.strokeRect(1, (display.canvas.height/2 +3), display.canvas.width-2, 16);
				context.restore();
				
				api.drawProgress(context);
			}
		}
		
		api.drawProgress = function(context){
			if(display.initialized()){				
				context.save();
				context.fillStyle = "gold";				
				context.fillRect(1, (display.canvas.height/2 + 5), core.data.getLoadPercentage()*(display.canvas.width-2), 12);
				context.restore();				
			}
		}
		
		api.onProgressUpdate = function(e){			
			// alert("Something just finish to load!");
			api.drawProgress(display.context2D);
		};
		
		api.onDisplayReady = function(e){						
			api.drawSplashScreen(display.context2D);
		};
		
		core.event.subscribe(core.event.LOAD_PROGRESS_UPDATE, api.onProgressUpdate);		
		core.event.subscribe(core.event.LOAD_COMPLETE, api.onProgressUpdate);		
		core.event.subscribe(core.event.DISPLAY_INITIALIZED, api.onDisplayReady);
	
		return api;
		
	})(core.display); // end constructor runtime closure
	
	/**
	 * (Data Manager) Gerenciador de recursos (imagens, sons)
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @namespace
	 * @memberOf core
	 */	
	core.data = (function(game) { // begin constructor runtime closure
	
		/**	Armazena a interface publica deste modulo
			@private
		*/
		var api = {};
		
		//==========================================================================================
		//                                   Private fields
		//==========================================================================================
		
		var imageCount = 0;
		var nextID = 0;
		
		var loading = false;
		var totalAssets = 0;
		
		// var progress = 0;
		
		//==========================================================================================
		//                                    Public fields
		//==========================================================================================
		
		// resources
		api.images = {};
		// api.sounds = {};
		
		//==========================================================================================
		//                                   Private methods
		//==========================================================================================
		
		// callback a ser chamado quando finalizar o loading
		var onLoad = function(){};
		
		var updateProgress = function(){
			core.event.publish(core.event.LOAD_PROGRESS_UPDATE);
			if(imageCount == totalAssets){ // substituir pelo numero total de elementos
				loading = false;
				core.event.publish(core.event.LOAD_COMPLETE);
				onLoad(); // deixar o programador inscrever no load complete?
			}
		};
		
		var onLoadImage = function(name){
			++imageCount;	
			updateProgress();
			console.log(name+" loaded");
		};
		
		var onImageError = function(e){
			console.log("Falha ao carregar imagem: " + e.srcElement);
		};
		
		//==========================================================================================
		//                                    Public methods
		//==========================================================================================
		
		api.getLoadPercentage = function(){
			return imageCount/totalAssets;
		};
		
		api.load = function(/**Array*/assets, /**Callback*/onload){
			if(!loading){
				
				console.log("DATA_MANAGER: Loading assets...");
				
				// progress = 0;
				
				if(game.isRunning()){
					game.stop(); // necessario?
				}
				
				loading = true;
				
				try{
					totalAssets = assets.length;
					onLoad = onload;
					
					for(var i = 0; i<assets.length; ++i){
						if(assets[i].type.toLowerCase() == "image"){
							loadImage(assets[i].name, assets[i].src);
						}
					}
				}
				catch(e){
					// console.log(e);
					// console.log(e.message);
					console.log(e.stack);
				}
			}
			else
			{
				throw new Error("Banco de recursos bloqueado para escrita.");
			}
		};
		
		// id gerado automaticamente
		var loadImage = function(name, src) {			
			/*if(api.images[name] && api.images[name].src == src ){
				console.warn("Overwriting image data.");
			}*/
			try {
				api.images[name] = new Image();
				api.images[name].id = nextID;				
				api.images[name].onload = function(){onLoadImage(name);};
				api.images[name].onerror = onImageError;
				api.images[name].src = src;				
			}
			catch(e) {
				// console.log(e.message);
				console.log(e.stack);
			}			
		};
		
		// id gerado automaticamente
		/*var loadAudio = function(name, src) {
		};
		
		api.getImage = function(name) {
		};
		
		api.getAudio = function(name) {
		};*/
	
		return api;
		
	})(core.game); // end constructor runtime closure

})(core.display, core.game); // end core.data runtime closure
