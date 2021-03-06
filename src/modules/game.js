(function() { // begin core.game runtime closure

	/**
	 * (Game Manager) Gerenciador de jogo<br>
	 * Gerencia os objetos de jogo<br>
	 * Nao ha construtor para core.game
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @final
	 * @static
	 * @memberOf core
	 * @constructor Nao deve ser chamado pelo usuario.
	 * @require core.display
	 * @require core.timer
	 * @require core.event
	 */	
	core.game = (function(display, timer, input) {

		/**	Armazena a interface(campos e metodos) publica deste modulo
			@private
		*/
		var api = {}; 
		
		//==========================================================================================
		//                                    Private fields
		//==========================================================================================
		
		/** Colecao dos objetos de jogo
			@type Array
			@private
		*/
		var gameObjects = new Array();

		/** Array com novos objetos a serem adicionados ao pool.
			@type Array
			@private
		*/
		var addedGameObjects = new Array();

		/** Array com os game objects removidos.
			@type Array
			@private
		*/
		var removedGameObjects = new Array();

		/** Temmpo o qual o ultimo frame foi renderizado. 
			@type Date
			@private
		*/
		var lastFrame = Date.now();
		
		/** Referencia para o quadro de animacao requisitado corrente
			@type Number
			@private
		*/
		var frameID = -1;
		
		/** Verdadeiro se a aplicacao estiver em pausa, false caso contrario.
			@type Boolean
			@private
		*/
		var paused = false;
		
		/** Computa o id que o proximo objeto a ser adicionado a colecao recebera.
			@type Boolean
			@private
		*/
		var nextGUID = 0;
		
		/** Tempo real que passou desde o ultimo frame foi renderizado 
			@type Number
			@private
		*/
		var tick = 0;
		
		/** Referencia para o objeto que mostra o fps na pagina
			@private
		*/
		var stats = null;
		
		/** Taxa de atualizacao esperada da tela em quadros por segundo. <br>
			@constant
			@type Number
			@private
			@deprecated
		*/
		var EXPECTED_FPS = 60;

		/** Tempo esperado em segundos entre cada frame. 
			@constant
			@type Number
			@private
			@deprecated
		*/
		var STEP = 1/60;
		
		/** Utilizado para acelerar e reduzir a mecanica de jogo.
			Este parametro aplica-se ao parametro dt passado aos objetos de jogo
			@type Number
			@private
		*/
		var timeMultiplier = 1;	
		
		/** @private */
		var benchmarkActivated = true;
		
		/** @private */
		var avgFPS=0;
		
		/** @private */
		var totalFrames = 0;
		
		/** @private */
		var minFPS = 0;
		
		/** @private */
		var maxFPS = 0;	
		
		/** Referencia(atalho) para o contexto criado no displayManager
		@private
		*/
		var context = null;
		
		var debug = false;
		
		//==========================================================================================
		//                                   Public fields
		//==========================================================================================
		
		// (!) Substituir pelo objeto viewport (que sera da classe camera)
		
		/** Valor de scrolling global do eixo x. 
			@name core.game#xScroll
			@type Number
			@public
		*/
		api.xScroll = 0;

		/** Valor de scrolling global do eixo y.   
			@name core.game#yScroll
			@type Number
			@public
		*/
		api.yScroll = 0;
		
		//==========================================================================================
		//                                        Private methods
		//==========================================================================================

		var i; // iterator
		/** 
			Insere os novos objetos na colecao de objetos.
			@private
		*/
		var addNewGameObjects = function()
		{
			if (addedGameObjects.length != 0)
			{
				for (i = 0; i < addedGameObjects.length; ++i)
				{					
					gameObjects.push(addedGameObjects[i]);
				}

				addedGameObjects.clear();
				
				// ordena o pool de objetos utilizando a tecnica de z-buffer
				gameObjects.sort(function(a,b){return a.zOrder - b.zOrder;});
			}
		};

		/** 
			Remove os objetos que foram desligados.			
			@private
		*/
		var removeOldGameObjects = function()
		{
			if (removedGameObjects.length != 0)
			{
				for (i = 0; i < removedGameObjects.length; ++i)
				{
					// remove efetivamente o objeto da cole��o de objetos
					gameObjects.removeObject(removedGameObjects[i]);
				}
				removedGameObjects.clear();
			}
		};

		/** 
			Utilizado pelo Game Manager para atualizar as informacoes do quadro de animacao corrente
			ao resultado do benchmark
			@private 
		*/
		var executeBenchmark = function()
		{
			avgFPS += timer.current();
			totalFrames++;
		};
		
		/** 
			Imprime o resultado final do benchmark
			@private 
		*/
		var printBenchmarkResults = function()
		{			
			console.log("=============RESULTADO DO BENCHMARK===============");
			console.log("Total Frames: "+totalFrames);
			console.log("Min FPS: "+minFPS);
			console.log("Max FPS: "+maxFPS);
			console.log("FPS Medio: "+avgFPS.round(0));
			console.log("==================================================");
		};
		
		var dt, firstT = true, thist = 0, lastt = 0, dtt = 0 ;
		/**
			Loop de renderizacao da engine. Efetua a atualizacao e a exibicao dos graficos.		
			@function
			@private 
			@type void
		*/
		var gameLoop = function (t)
		{			
			// atualiza informacoes de tempo do jogo
			timer.update(t);			

			// dt(delta time) = tempo entre o frame atual e o ultimo frame renderizado, em segundos
			// Math.min para evitar valores de dt altos (baixo fps ou paradas no gameloop)
			// timeMultiplier = hack usado para acelerar ou desacelerar o jogo
			dt = Math.min(0.0666667, timer.tick()) * timeMultiplier;
			
			addNewGameObjects();
			removeOldGameObjects();
			
			// benchmark (!) me tire daqui -> modularizar ferramenta de benchmark
			if(benchmarkActivated)
				executeBenchmark();				
			
			// limpa o display (o prepara para renderizar a nova cena)
			display.clear();
			
			// context.save(); // protege info de contexto global ?
			
			// nao dispara eventos enquanto estiver atualizando os objetos
			input.lock();
			
			// inicia as rotinas de atualiza��o e rendering dos GameObjects
			if (!paused)
			{			
				// primeiramente atualiza-se todos os game objects
				for (i = 0; i < gameObjects.length; ++i)
				{
					if (gameObjects[i].update)
					{
						// callback que deve estar presente em todos os game objects atualiz�veis
						gameObjects[i].update(dt, context, api.xScroll, api.yScroll);
					}
				}			

				// finalmente desenhamos os game objects
				for (i = 0; i < gameObjects.length; ++i)
				{
					if (gameObjects[i].draw)
					{
						// callback que deve estar presente em todos os game objects renderizaveis
						gameObjects[i].draw(dt, context, api.xScroll, api.yScroll);
					}
				}				
			} 
			// atualiza��o e rendering de objetos quando a aplica��o entra em pausa
			else if(paused)
			{				
				// atualiza objetos que precisam ser atualizados quando o jogo pausa
				for (i = 0; i < gameObjects.length; ++i)
				{
					if (gameObjects[i].pauseUpdate)
					{
						gameObjects[i].pauseUpdate(dt, context, api.xScroll, api.yScroll);
					}
				}			
				
				// atualiza objetos que precisam ser renderizados quando o jogo pausa
				for (i = 0; i < gameObjects.length; ++i)
				{				
					if (gameObjects[i].pauseDraw)
					{
						gameObjects[i].pauseDraw(dt, context, api.xScroll, api.yScroll);
					}
				}
			}
			
			// libera eventos para as teclas e consome quaisquer eventos registrados			
			input.unlock(); 
							
			// descarrega o back buffer para o front buffer canvas
			display.flush();

			// context.restore();
			
			// requisita o proximo quadro de animacao
			frameID = requestAnimationFrame(gameLoop);			
		};

		//==========================================================================================
		//                                   Public methods
		//==========================================================================================
		/**
			Inicia o benchmark da aplicacao.
			@name core.game#startBenchmark
			@function
			@public
			@type void
		*/
		api.startBenchmark = function()
		{			
			totalFrames = 0;
			avgFPS = 0;
			timer.reset();
			benchmarkActivated = true;
			console.log("GAME_MANAGER: Benchmark iniciado.");
		};

		/**
			Finaliza o benchmark da aplicacao e imprime no console o resultado.
			@name core.game#endBenchmark
			@function
			@public
			@type void
		*/
		api.endBenchmark = function()
		{		
			avgFPS = avgFPS/totalFrames;
			minFPS = timer.min();
			maxFPS = timer.max();
			// this.stats.reset();
			benchmarkActivated = false;
			console.log("GAME_MANAGER: Benchmark finalizado.");
			// printBenchmarkResults();
			return {
				frames: totalFrames,
				min: minFPS,
				max: maxFPS,
				avg: avgFPS.round(0)
			};
		};
		
		api.getGameObjectsCount = function()
		{
			return gameObjects.length;
		};

		//
		// Funcoes para alteracao da velocidade(logica dos objetos) do jogo
		// -----------------------------------------------------------------
		/**
			Normaliza a velocidade da aplicacao.
			@name core.game#normalSpeed
			@function
			@public
			@type void
		*/
		api.normalSpeed = function()
		{
			timeMultiplier = 1;
			console.log("GAME_MANAGER: Speed Hack: x " + timeMultiplier.round(1) );
		};
		
		/**
			Aumenta a velocidade da aplicacao em 10% da velocidade original
			@name core.game#speedUp
			@function
			@public
			@type void
		*/
		api.speedUp = function()
		{
			timeMultiplier += 0.1;
			timeMultiplier.round(1);
			console.log("GAME_MANAGER: Speed Hack: x " + timeMultiplier.round(1) );
		};

		/**
			Diminui a velocidade da aplicacao em 10% da velocidade original
			@name core.game#speedDown
			@function
			@public
			@type void
		*/
		api.speedDown = function()
		{
			timeMultiplier -= 0.1;
			timeMultiplier.round(1);
			if(timeMultiplier < 0)
				timeMultiplier = 0;
			console.log("GAME_MANAGER: Speed Hack: x " + timeMultiplier.round(1) );
		};

		/**
			Aplica manualmente o multiplicador de velocidade.
			@name core.game#setSpeed
			@function
			@public
			@type void
			@param multiplier =1 velocidade normal, 
							  >1 aumenta a velociadade,
							  <1 dimunui a velocidade.
		*/
		api.setSpeed = function(/**Number*/ multiplier)
		{
			if(multiplier>0)
			{
				timeMultiplier = multiplier;
				console.log("GAME_MANAGER: Speed Hack: x " + timeMultiplier.round(1) );
			}
		};
		
		api.getSpeedMultiplier = function()
		{
			return timeMultiplier.round(1);
		}
		
		api.startup = function()
		{
			api.reset();	
		};
		
		// reinicia o jogo reload)
		/*api.reset = function(reload)
		{			
			// cache para o contexto de rendering
			if(!context){ context = display.getSystemContext(); }
			
			// limpa tudo antes de iniciar
			display.clear();
				
			api.shutdownAll();

			// implementar game.state (maquina de estados) -> usar jakegordon modificada?
			// api.game.state.reset();
			
		};*/
		
		/**
			Indica se o game loop esta ativo.
			@name core.game#isRunning
			@function
			@public		
			@return {Boolean} true se esta ativo, false caso contrario
		*/
		api.isRunning = function()
		{
			if(frameID != -1)
			{
				return true;
			}
			else
				return false;
		};
		
		api.initialize = function()
		{
			if(!context){ context = display.getSystemContext(); }
			display.clear();
		};
			
		/**
			Ponto de entrada para o game loop.
			@name core.game#run
			@function
			@public
			@type void
		*/
		api.run = function()
		{
			// (!)run == init ou devemos separar estes metodos?
			
			if(!api.isRunning())
			{
				// cache para o contexto de rendering
				if(!context){ context = display.getSystemContext(); }
								
				display.clear();				
				
				// comeca a contagem de tempo
				timer.begin();
				
				// publica o evento core.event.GAME_RUN
				var event = {context: context, xScroll: api.xScroll, yScroll: api.yScroll};
				core.event.publish.defer(core.event.GAME_RUN, [event] );				
				
				console.log("GAME_MANAGER: Game loop iniciado.");
				
				// inicia o game loop
				frameID = requestAnimationFrame(gameLoop);				
			}
		};
		
		/**
			Interrompe o game loop, cancelando a requisicao de animacoes.
			@name core.game#stop
			@function
			@public
			@type void
		*/
		api.stop = function()
		{
			// cancela o gameLoop
			cancelAnimationFrame(frameID);
			frameID = -1;
			
			// publica o evento GAME_STOP
			core.event.publish.defer("game.stop", [context, api.xScroll, api.yScroll] );			
			
			console.log("GAME_MANAGER: Game loop interrompido.");
		};
		
		/**
			Adiciona um novo GameObject a colecao de objetos. <br>	
			@name core.game#addGameObject
			@function
			@public
			@type void
			@param gameObject O objeto a ser adicionado
			Nao precisa ser necessariamente um objecto da classe GameObject
			Necessario que o objeto apresente o parametro zOrder
		*/
		api.addGameObject = function(/**core.GameObject*/ gameObject)
		{
			addedGameObjects.push(gameObject);
		};
		
		/**
			Remove um objeto especifico da colecao de objetos.<br>			
			@name core.game#removeGameObject
			@function
			@public
			@type void
			@param gameObject O objeto a ser removido.
			
		*/
		api.removeGameObject = function(/**core.GameObject*/gameObject)
		{
			removedGameObjects.push(gameObject);
		};
		
		/**
			Intervalo de tempo entre os quadros de animacao correntes.<br>	
			Mostra o intervalo real, sem considerar multiplicadores de tempo.
			@name core.game#getTick
			@function
			@public		
			@return {Number} O intervalo de tempo entre o quadro atual e o ultimo.
		*/	
		api.getTick = function()
		{		
			return timer.tick();
		};
		
		/**
			Retorna a taxa atual de quadros exibidos por segundo.
			@name core.game#getFPS
			@function
			@public		
			@return {Number} O FPS corrente
		*/
		api.getFPS = function()
		{	
			return timer.current();
		};

		/**
			Limpa e remove todos os objetos da colecao de objetos.
			@name core.game#shutdownAll
			@function
			@public
			@type void
		*/
		api.shutdownAll = function()
		{
			for (i = 0; i < gameObjects.length; ++i)
			{
				if (gameObjects[i].shutdown)
				{
					gameObjects[i].shutdown();
				}
			}

			removeOldGameObjects();
		};
		
		/**
			Ordena a colecao de objetos do jogo (zOrder).<br>
			@name core.game#sort
			@function
			@public
			@type void			
		*/
		api.sort = function()
		{
			gameObjects.sort(function(a,b){return a.zOrder - b.zOrder;});
		};
		
		/**
			Indica se a aplicacao esta ou nao em pausa no momento da chamada.
			@name core.game#isPaused
			@function
			@public			
			@return {Boolean} Retorna true se a aplicacao esta em pausa, false caso contrario.
		*/
		api.isPaused = function()
		{
			return paused;
		};
		
		/**
			Coloca o DisplayManager em estado de pause.<br> 
			O DisplayManager ira chamar o callback onPause(context, xScroll, yScroll) para os objetos.
			Se o objeto precisa ser atualizado e renderizado enquanto o jogo estiver em pausa, 
			sera chamado para o objeto em cada quadro: pauseUpdate() e pauseDraw() exatamente iguais as funcoes update e draw
			@name core.game#pause
			@function
			@public
			@type void
		*/
		api.pause = function()
		{		
			paused = true;
			console.log("GAME_MANAGER: Aplicacao em pausa.");
			
			// publica o evento
			core.event.publish.defer(core.event.GAME_PAUSE, [context, api.xScroll, api.yScroll] );			
		};
		
		/**
			Sai do estado pausado e coloca o DisplayManager em estado de play.
			O DisplayManager ira chamar o callback onResume(context, xScroll, yScroll) para os objetos no momento da chamada.
			@name core.game#resume
			@function
			@public
			@type void
		*/
		api.resume = function()
		{
			paused = false;
			
			console.log("GAME_MANAGER: Aplicacao retomada.");
			
			// thisFrame = Date.now();
			// lastFrame = Date.now();
			timer.begin();
			
			// publica o evento
			core.event.publish.defer(core.event.GAME_RESUME, [context, api.xScroll, api.yScroll] );			
		};
		
		/**
			Alterna entre pause e resume a cada chamada da funcao.
			Ao pausar propaga o callback onPause e ao recomecar propaga o callback onResume
			@name core.game#togglePause
			@function
			@public
			@type void
		*/
		api.togglePause = function()
		{
			paused = !paused;
			
			if(paused)
			{
				api.pause();
			}
			else
			{
				api.resume();
			}
		};
		
		/**
			Pega uma posicao do canvas e converte para a posicao do game (posicao no mundo de jogo)
			@name core.game#toGamePosition
			@function
			@public
			@deprecated
		*/
		api.toGamePosition = function (x, y)
		{			
			// display.toCanvasPosition(x, y);
			
			x += api.xScroll;
			y += api.yScroll;
			
			return {x: x, y: y};
		};
		
		// fim
		return api;
	})(core.display, core.timer, core.input);
	
})(); // end core.game runtime closure
