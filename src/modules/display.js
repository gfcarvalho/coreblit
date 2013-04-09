(function(event) { // begin core.display runtime closure

	/**
	 * (Display Manager) Gerenciador grafico <br>
	 * Controla a exibicao dos graficos (canvas + styles)
	 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
	 * @namespace
	 * @memberOf core
	 * @require core.event
	 */	
	core.display = (function() { // begin constructor runtime closure

		/**	Armazena a interface(campos e metodos) publica deste modulo
			@private
		*/
		var api = {}; 
		
		//==========================================================================================
		//                                    Private fields
		//==========================================================================================
		
		/** Se o display ja fora anteriormente iniciado.
			@type Boolean
			@private
		*/
		var _started = false,
		
		/**Se o elemento canvas é suportado pelo navegador.
			@type Boolean
			@private
		*/
		_canvas_supported = false,	
		
		/** Se o ajuste automatico do display deve ser realizado.
			@type Boolean
			@private
		*/
		_auto_adjust = false,
		
		/** Se o tamanho maximo do canvas nao puder ser maior do que a resolucao.
			@type Boolean			
			@private
		*/
		_limit_canvas_size = true,
		
		/** Se o display deve preencher a janela.
			@type Boolean			
			@private
		*/
		_stretch_to_fit = false,
		
		/** ID de registro no evento RESOLUTION_CHANGE vinculado as dimensoes da janela do
			navegador.
			@type Array
			@private
		*/
		_fit_to_viewport = null,
		
		/** Armazena a informacao de proporcao de aspecto apos iniciado o display.
			Esta informacao sera usado quando o display necessitar ser redimensionado.
			@type Number
			@private 
		*/
		_aspect_ratio = 1,
		
		/** Ajusta o brilho do canvas em relacao ao brilho da tela. [0...1]
			@type Number
			@default 1.0 (100% do brilho da tela)
			@private 			
		*/		
		_brightness = 1.0,
		
		/** Habilita ou desabilita a tecnica de double buffering.
			@type Boolean
			@default false
			@private 			
		*/
		_double_buffered = false,
		
		/** Componente horizontal da Resolucao do display.
			@type Number
			@private
		*/
		_resolution_width = 1,
		
		/** Componente vertical da Resolucao do display.
			@type Number
			@private
		*/
		_resolution_height = 1,
		
		/** Tamanho horizontal atual da tela mostrada para o usuario. 
			@type Number
			@private
		*/
		_current_canvas_width = 1,
		
		/** Tamanho vertical atual da tela mostrada para o usuario. 
			@type Number
			@private
		*/
		_current_canvas_height = 1,
		
		/** Referencia ao elemento onde o display sera mostrado (wrapper).
			@type HTMLDivElement
			@private ( make it public ? ) 
		*/
		_game_area = null,
		
		/** ID correspondente ao redimensionamento corrente
			@type Number
			@private
		*/
		_resize_id = null;
		
		//==========================================================================================
		//                                     Public fields
		//==========================================================================================

		/** Referencia ao elemento canvas usado como "front" buffer.
			@name core.display#canvas
			@type HTMLCanvasElement
			@public
		*/
		api.canvas = null;

		/** Referencia ao contexto 2D do elemento canvas.
			@name core.display#context2D
			@type CanvasRenderingContext2D
			@public
		*/
		api.context2D = null;

		/** Referencia para o in-memory canvas usado como "back" buffer.
			@name core.display#backBuffer
			@type HTMLCanvasElement
			@public
		*/
		api.backBuffer = null;

		/** Referencia ao contexto 2D do back Buffer.
			@name core.display#backBufferContext2D
			@type CanvasRenderingContext2D
			@public
		*/
		api.backBufferContext2D = null;	
		
		//==========================================================================================
		//                                   Private methods
		//==========================================================================================
		
		/**
			Redimensiona o canvas (front buffer) de acordo com as configuracoes. <br>
			Executado automaticamente quando a janela do navegador for redimensionada
			ou mudar de orientacao (celulares, tablets por exemplo).
			@name core.display#resize
			@function			
			@static
			@type void
		*/
		var _resize = function() 
		{
			// verifica se o display esta disponivel
			if(!_started)
			{
				return;
			}
			
			// apenas para certificar-se que nao haja outro redimensionamento em andamento
			if(_resize_id)
			{
				clearTimeout(_resize_id);
				_resize_id = null;
			}
			
			// preenche a janela do navegador de acordo com as configuracoes de video
			if(_auto_adjust)
			{	
				// recupera as informacoes de proporcao de aspecto do display
				var widthToHeight = _aspect_ratio, 
				// dimensoes da nova janela redimensionada
					newWidth = window.innerWidth, 
					newHeight = window.innerHeight;
				
				if(_stretch_to_fit)
				{
					// ignora o aspect ratio e ajusta o display as dimensoes da janela do navegador				
					widthToHeight = window.innerWidth/window.innerHeight;					
				}				
				
				if(_limit_canvas_size)
				{
					// limita o redimensionamento do canvas as dimensoes do backbuffer
					// (nao permite resolucoes maiores que do backbuffer, apenas menores)
					newWidth = newWidth <= _resolution_width ? newWidth : _resolution_width;
					newHeight = newHeight <= _resolution_height ? newHeight : _resolution_height;
				}
				
				var newWidthToHeight = newWidth / newHeight;
			
				// aplica as novas dimensoes ao canvas alterando o estilo ( CSS	)
				if (newWidthToHeight > widthToHeight) 
				{
					newWidth = newHeight * widthToHeight;
					_game_area.style.height = newHeight + 'px';
					_game_area.style.width = newWidth + 'px';
				}
				else 
				{
					newHeight = newWidth / widthToHeight;
					_game_area.style.width = newWidth + 'px';
					_game_area.style.height = newHeight + 'px';
				}
				
				// armazena as dimensoes correntes em cache (avoid float)
				_current_canvas_width = ~~(newWidth+0.5);
				_current_canvas_height = ~~(newHeight+0.5);
				
				// reposiciona corretamente o canvas na janela do navegador
				_game_area.style.marginTop = (-newHeight / 2) + 'px';
				_game_area.style.marginLeft = (-newWidth / 2) + 'px';					
			}
			
		};
		
		//==========================================================================================
		//                                    Public methods
		//==========================================================================================		
		
		api.resize = function()
		{
			_resize();
			
			// publica o evento core.event.RESIZE
			var event = {width: _current_canvas_width, height: _current_canvas_height};		
			core.event.publish(core.event.RESIZE, [event]);			
		};
		
		/**
			Inicializa o canvas com as dimensoes e configuracoes especificadas
			@name core.display#startup
			@function
			@public
			@static
			@type void		
			@param width largura da resolucao do game (largura do backbuffer canvas)
			@param height altura da resolucao do game (altura do backbuffer canvas)
			@param auto_adjust ( opcional ) true se a engine deve posicionar e ajustar o display 
			automaticamente, false caso contrario ( default: false )
			@param fit_to_screen ( opcional ) true, para ajustar a tela ( default: false )
			(!) nao tem efeito algum se auto_adjust estiver setado como false
			@param maintain_aspect_ratio ( opcional ) mantem os _aspect_ratio inicial da aplicacao, 
			calculado por (width/height) ( default: false )
			(!) nao tem efeito algum se auto_adjust estiver setado como false
			@param double_buffered ( opcional ) se o rendering sera executado todo em um frame 
			buffer para somente desenhar no canvas depois de tudo pronto
			(!) perde desempenho em alguns casos, ganha em outros... mas ganha na qualidade da 
			animação (FAÇA TESTES DE DESEMPENHO)
		*/
		api.startup = function(/**Number*/ width, /**Number*/ height, /**Boolean*/ auto_adjust,
		/**Boolean*/ fit_to_screen,/**Boolean*/ maintain_aspect_ratio,/**Boolean*/ double_buffered)
		{
			if(!_started)
			{
				if(width<=0 || height <=0)
					throw new Error("Impossivel iniciar display: resolucao invalida!");		
				
				
				console.log("DISPLAY_MANAGER: Iniciando o Display...");

				// configuracao de video inicial
				_resolution_width = width;
				_resolution_height = height;
				_current_canvas_width = width;
				_current_canvas_height = height;
				
				// proporcao de aspecto inicial
				_aspect_ratio = width/height;
				
				// pega a referencia para o elemento canvas e seu contexto 2D
				// api.canvas = document.getElementById('gameCanvas');
				api.canvas = document.createElement('canvas');
				api.canvas.width = width;
				api.canvas.height = height;
				api.canvas.id = 'gameCanvas';
				
				// container onde o canvas sera alocado
				// _game_area = document.getElementById('gameArea');
				_game_area = document.createElement('div');
				_game_area.id = 'gameArea';
				
				document.body.appendChild(_game_area);
				_game_area.appendChild(api.canvas);

				// se canvas.getContext não existe é uma aposta segura
				// que o navegador não suporta o elemento canvas.
				// neste caso não continuaremos, o que pode ajudar alguns debuggers 
				//(como o IE8 debugger) de lançar um número excessivo de erros.
				if (api.canvas.getContext) // substituir por if(core.system._canvas_supported)???
				{
					// a partir daqui asseguramos a compatibilidade do navegador com o HTML5 canvas
					_canvas_supported = true;
					
					if(double_buffered)
					{
						_double_buffered = true;
						// cria o backbuffer
						api.backBuffer = document.createElement('canvas');	
					}
					else
					{
						api.backBuffer = api.canvas;
					}
					
					// configura a exibicao de acordo com os parametros setados
					if(auto_adjust)
					{					
						_auto_adjust = true;
						
						_game_area.style.cssText = 'position: absolute;  left: 50%;  top: 50%;';
						api.canvas.style.cssText = 'width: 100%;  height: 100%;  cursor: default;';					
						
						_limit_canvas_size = !fit_to_screen;
						
						if(fit_to_screen && !maintain_aspect_ratio)
						{
							_stretch_to_fit = true;
						}
						
						// adiciona evento que reposiona o canvas ao redimensionar a janela
						// e mudar a orientacao (landscape/portrait)
						window.addEventListener('resize', function() {						
							if(_resize_id)
							{
								// cancela um redimensionamento anterior se existir
								clearTimeout(_resize_id);
								_resize_id = null;
							}
							// redimensiona quando o processador estiver liberado
							_resize_id = core.display.resize.defer();
						}, false);
						
						window.addEventListener('orientationchange', function() {	
							if(_resize_id)
							{
								// cancela um redimensionamento anterior se existir
								clearTimeout(_resize_id);
								_resize_id = null;
							}
							// redimensiona quando o processador estiver liberado
							_resize_id = core.display.resize.defer();
						}, false);
						
						// teste ( verificar equivalencia com 'orientationchange')
						/*window.addEventListener('deviceorientation', function() {	
							if(_resize_id)
							{
								// cancela um redimensionamento anterior se existir
								clearTimeout(_resize_id);
								_resize_id = null;
							}
							// redimensiona quando o processador estiver liberado
							_resize_id = core.display.resize.defer();
							api.forcePortrait();
						}, false);*/
						
						
						console.log("DISPLAY_MANAGER: Redimensionamento automatico habilitado.");
					}
					else
					{
						_auto_adjust = false;
						
						api.canvas.style = null;
						_game_area.style = null;
					}
					
					// referencia para o contexto de rendering do canvas (front buffer)
					api.context2D = api.canvas.getContext('2d');
					
					// monta o back buffer, mantendo as informações do contexto principal
					api.backBuffer.width = api.canvas.width;
					api.backBuffer.height = api.canvas.height;
					// api.backBuffer.style = api.canvas.style;
					api.backBufferContext2D = api.backBuffer.getContext('2d');
					
					// flag indica que o display foi iniciado
					_started = true;
					
					if(_auto_adjust)
					{
						// ajusta o canvas na janela do navegador de acordo com as configucoes
						api.resize.defer();
					}					
										
					console.log("DISPLAY_MANAGER: Display iniciado.");
				}
				else
				{						
					console.log("DISPLAY_MANAGER: Nao foi possivel iniciar o display.");										
					throw new Error("HTML5 canvas nao suportado pelo navegador.");
				}   
			}			
			else // display already started
			{				
				console.log("DISPLAY_MANAGER: Operacao cancelada. Display ja foi iniciado.");
				return;
			}
		};
		
		/** 
			Se o navegador suporta o canvas.
			@name core.display#isCanvasSupported
			@function
			@public
			@static			
			@return {Boolean} true caso o navegador suporte canvas, false caso contrario
			@bug (!) mover para core.system
		*/
		api.isCanvasSupported = function()
		{
			return _canvas_supported;
		};
		
		api.isDoubleBuffered = function()
		{
			// verifica se o display esta disponivel
			if(!_started)
			{			
				console.warn("DISPLAY_MANAGER: Display ainda nao foi iniciado.");
				return undefined;
			}
			return _double_buffered;
		};
		
		/**
			Descarrega o back buffer no contexto principal (front buffer).
			@name core.display#flush
			@function
			@public
			@static
			@type void
		*/
		api.flush = function()
		{			
			if(_brightness < 1.0 ) // aplica o filtro de brilho
			{						
				api.backBufferContext2D.save();
				api.backBufferContext2D.fillStyle = 'rgba(0,0,0,'+(1.0-_brightness)+')';
				api.backBufferContext2D.fillRect(0, 0, api.backBuffer.width, api.backBuffer.height);
				api.backBufferContext2D.restore();
			}			
			
			if(_double_buffered)
			{				
				// copia o back buffer para o display do canvas
				api.context2D.drawImage(api.backBuffer, 0, 0);				
			}			
			
		};
		
		/**
			(!) funciona da maneira esperada apenas se o jogo possuir um plano de fundo que ocupa 
			todo o canvas.
		*/
		api.setBrightness = function(brightness)
		{
			_brightness = Math.abs(brightness).clamp(0.0, 1.0);		
		};
		
		/**
			Limpa a tela ( contexto real do canvas ).
			@name core.display#clearCanvas
			@function
			@public
			@static
			@type void
		*/
		api.clearCanvas = function()
		{
			api.context2D.clearRect(0, 0, api.canvas.width, api.canvas.height);		
		};
		
		/**
			Limpa o back buffer (nao descarrega no front buffer).
			@name core.display#clearBackBuffer
			@function
			@public
			@static
			@type void
		*/
		api.clearBackBuffer = function()
		{
			api.backBufferContext2D.clearRect(0, 0, api.backBuffer.width, api.backBuffer.height);		
		};
		
		api.clear = function()
		{
			if(_double_buffered)
				api.clearBackBuffer();
			api.clearCanvas();
		};
		
		api.getCanvasWidth = function() {
			return api.canvas.width;
		};
		
		api.getCanvasHeight = function() {
			return api.canvas.height;
		};
		
		api.getBackBufferWidth = function() {
			return api.backBuffer.width;
		};
		
		api.getBackBufferHeight = function() {
			return api.backBuffer.height;
		};
		
		/**
		 * return a reference to the screen canvas <br>
		 * use this when checking for display size, event <br>
		 * or if you need to apply any special "effect" to <br>
		 * the corresponding context (ie. imageSmoothingEnabled)
		 * @name core.display#getScreenCanvas
		 * @function
		 * @public
		 * @static
		 * @return {Canvas}
		 */
		api.getScreenCanvas = function() {
			return api.canvas;
		};
		
		/**
		 * return a reference to the screen canvas corresponding 2d Context
		 * @name core.display#getScreenContext
		 * @function
		 * @public
		 * @static
		 * @return {Context2D}
		 */
		api.getScreenContext = function() {
			return api.context2D;
		};
		
		/**
		 * return a reference to the system canvas
		 * @name core.display#getSystemCanvas
		 * @function
		 * @public
		 * @static
		 * @return {Canvas}
		 */
		api.getSystemCanvas = function() {
			return api.backBuffer;
		};
		
		/**
		 * return a reference to the system 2d Context
		 * @name core.display#getSystemContext
		 * @function
		 * @public
		 * @static
		 * @return {Context2D}
		 */
		api.getSystemContext = function() {
			return api.backBufferContext2D;
		};
		
		/**
			Altera a resolucao do jogo, alterando as dimensoes do backbuffer.
			Se a resolucao estiver vinculada a viewport o vinculo sera removido.
			(!)Nao altera o aspect ratio. Se apos alterar a resolucao desejar que o
			aspect ratio seja proporcional a resolucao utilize core.display#setAspectRatio
			passando como parametros as mesmas largura e altura da resolucao.
			@name core.display#setResolution
			@public
			@static
			@function
			@type void
			@param width 
					largura da nova resolucao (em pixels)
			@param height 
					altura da nova resolucao (em pixels)
			@param adjust_aspect_ratio (opcional)
					se true, ajusta o aspect ratio para que fique proporcional a nova resolucao 
					( default: false )
		*/
		api.setResolution = function(/**Number*/ width,/**Number*/ height,
									 /**Boolean*/ adjust_aspect_ratio)
		{
			// remove vinculo com a viewport, caso exista
			api.unfitResolution();
			
			// reajusta as dimensoes (resolucao) de ambos front e back buffer
			api.backBuffer.width = api.canvas.width = width;
			api.backBuffer.height = api.canvas.height = height;
			
			// dimensoes maximas = nova resolucao
			_resolution_width = width;
			_resolution_height = height;
			
			if(adjust_aspect_ratio)
			{
				// ajusta o aspect ratio para que fique proporcional a nova resolucao
				_aspect_ratio = width/height;
			}
			
			// publica o evento
			var event = {width: width, height: height};
			core.event.publish(core.event.RESOLUTION_CHANGE, [event]);
			
			// redimensiona o display, ajustando-o a nova resolucao
			api.resize();	
		};
		
		/**
			Recupera a resolucao atual do jogo (dimensoes do backbuffer)
			@name core.display#getResolution
			@function
			@public
			@static			
			@return {Object} Objeto na forma {width: Number, height: Number} 
					contendo as dimensoes da resolucao (em pixels)
		*/
		api.getResolution = function()
		{
			return {width: _resolution_width, height: _resolution_height};
		};
		
		/**
			Recupera a dimensao real do canvas (front buffer) renderizada na janela do navegador 
			(considera o style aplicado) <br>
			Util para informar que nao eh a resolucao ideal(pode diminuir ou aumentar )
			@name core.display#getDisplayDimensions
			@function
			@public
			@static				
			@return {Object} Objeto na forma {width: Number, height: Number} 
					contendo as dimensoes do canvas renderizado(em pixels)
		*/
		api.getRenderDimensions = function()
		{
			return {width: _current_canvas_width, height: _current_canvas_height};
		};
		
		api.getWindowAspectRatio = function() // trocar window por wrapper no futuro
		{
			return ( window.innerWidth / window.innerHeight );
		};
		
		api.getWindowResolution = function() // trocar window por wrapper no futuro
		{
			return {width: window.innerWidth, height: window.innerHeight};
		};
		
		/**
			@return true, se a resolucao estiver ajustada a janela do navegador e
					false caso contrario.
		*/
		api.isResolutionFited = function()
		{
			render_dimensions = api.getRenderDimensions();
			if( render_dimensions.width != api.backBuffer.width 
				|| render_dimensions.height != api.backBuffer.height )
			{
				return false; 
			}
			return true;
		}
		
		/*api.getResolutionInfo = function() // informacao completa da resolucao
		{
			var resolutionInfo = {};						
			resolutionInfo.isResolutionFited = api.isIdealResolution();		
			resolutionInfo.currentResolution = api.getResolution();
			resolutionInfo.windowResolution = api.getWindowResolution(); // Resolucao ideal
			resolutionInfo.aspectRatio = api.getAspectRatio();
			resolutionInfo.renderDimensions = api.getRenderDimensions();
			
			return resolutionInfo;
		};*/
		
		/**
			Altera o aspect ratio do display, frontbuffer canvas.
			A proporcao de aspecto eh um fator calculado pela divisao da proporcao horizonal
			pela proporcao verical do frontbuffer (tela visivel ao jogador)
			(!) Nao ha alteracao de resolucao, apenas ajusta o frontbuffer,
			o que pode ocasionar em esticamento ou compressao da tela visivel
			nos casos em que o aspect ratio nao seja proporcional a resolucao.
			@name core.display#setAspectRatio
			@function
			@public
			@static
			@type void
			@param horizontal proporcao da largura da tela 
			@param vertical proporcao da altura da tela
			@param adjust_resolution ajusta a resolucao ao novo aspect ratio
			@example
			* // aspect ratio para o padrao widescreen 16:9 
			* core.display.setAspectRatio(16, 9);	
			*
			* // note que 16/9 = 1.777... entao a largura eh 77,77% maior do que a altura
		*/
		api.setAspectRatio = function(/**Number*/horizontal,/**Number*/vertical,
									  /**Boolean*/adjust_resolution)
		{	
			// muda o _aspect_ratio
			_aspect_ratio = horizontal/vertical; 
			
			var newWidth = api.backBuffer.width;
			var newHeight = api.backBuffer.height;
			var widthToHeight = newWidth/newHeight;
			var newWidthToHeight = _aspect_ratio;
			
			// ajusta a resolucao ao novo aspect ratio
			if(adjust_resolution)
			{					
				if (widthToHeight > newWidthToHeight) 
				{
					newWidth = newHeight * newWidthToHeight;
					api.backBuffer.width = api.canvas.width = newWidth;
					api.backBuffer.height = api.canvas.height = newHeight;
				}
				else 
				{
					newHeight = newWidth / newWidthToHeight;
					api.backBuffer.width = api.canvas.width = newWidth;
					api.backBuffer.height = api.canvas.height = newHeight;
				}
				_resolution_width = newWidth;
				_resolution_height = newHeight;
				
				// publica o evento RESOLUTION_CHANGE
				var event = {width: newWidth, height: newHeight};
				core.event.publish(core.event.RESOLUTION_CHANGE, [event]);
			}
			
			// redimensiona o display, ajustando-o ao novo aspect ratio
			api.resize();
		};
		
		/**
			Recupera o aspect ratio atual
			@name core.display#getAspectRatio
			@function
			@public
			@static
			@return {Object} Objeto na forma {width: Number, height: Number} 
					
		*/
		api.getAspectRatio = function()
		{
			return _aspect_ratio;
		};
		
		/**
			Estica a tela para preencher o espaco da janela do navegador
			@function
			@public
			@static
			@param maintain_aspect_ratio true se deve manter o aspect ratio,
				   false caso contrario (preenche 100% da tela se false). <br>
			(!) se maintain_aspect_ratio for false, ignora o aspect ratio no momento de renderizar 
				a tela mas mantem o valor do aspect_ratio internamente de modo que este possa ser 
				restaurado caso core.display#windowMode seja chamado
		*/
		api.stretchToFit = function(/**Boolean*/ maintain_aspect_ratio)
		{
			_limit_canvas_size = false;
			
			if(!maintain_aspect_ratio)
			{				
				_stretch_to_fit = true;
			}
			else
			{
				_stretch_to_fit = false;				
			}
			
			// redimensiona o display, ajustando-o ao novo aspect ratio
			api.resize();			
		};
		
		/**
			A resolucao passa a possuir sempre as dimensoes da viewport.
			(!) Altera o aspect ratio
			(!) Cuidado, em resolucoes muito altas o desempenho pode ser seriamente afetado.
			@function
			@public
			@static
		*/
		api.fitResolutionToViewport = function()
		{			
			// configura a resolucao para as dimensoes da viewport
			api.setResolution(window.innerWidth, window.innerHeight, true);
			
			// atribui evento para alterar a resolucao toda vez que redimensionar a tela
			_fit_to_viewport = core.event.subscribe(core.event.RESIZE, function(){
				// configura a resolucao para as dimensoes da viewport
				width = window.innerWidth;
				height = window.innerHeight;
			
				// reajusta as dimensoes (resolucao) de ambos front e back buffer
				api.backBuffer.width = api.canvas.width = width;
				api.backBuffer.height = api.canvas.height = height;
				
				// dimensoes maximas = dimensoes da viewport = nova resolucao
				_resolution_width = width;
				_resolution_height = height;		
				
				// ajusta o aspect ratio a cada mudanca de resolucao
				_aspect_ratio = width/height;				
				
				_resize();
				
				// publica o evento
				var event = {width: width, height: height};
				core.event.publish(core.event.RESOLUTION_CHANGE, [event]);	
			});			
		};		
		
		/**
			Remove o vinculo entre resolucao e viewport, caso exista.
			Permite opcionalmente fixar nova resolucao. 
			Caso contrario mantera a ultima resolucao antes dessa chamada.
			@function
			@public
			@static
			@param newWidth (opcional)  
			@param newHeight (opcional)
		*/
		api.unfitResolution = function(newWidth, newHeight)
		{
			if(_fit_to_viewport)
				core.event.unsubscribe(_fit_to_viewport);
				
			if(newWidth > 0 && newHeight > 0)
			{
				api.setResolution(newWidth, newHeight, true);
			}
		};
				
		/**
			Limita as dimensoes do canvas a resolucao.
			Obs: Permite dimensoes menores que a resolucao.
			@function
			@public
			@static
		*/
		api.windowMode = function() 
		{
			_limit_canvas_size = true;
			_stretch_to_fit = false;			
			api.resize();	
		};
				
		/**
			"Gira a tela", apenas trocando a largura com a altura
			@function
			@public
			@static
		*/
		api.flip = function()
		{ 
			var newWidth = api.backBuffer.height;
			var newHeight = api.backBuffer.width;
			
			api.setResolution(newWidth, newHeight, true);
		};		
		
		/**
			Converte uma posicao da viewport para a posicao no canvas
			@function
			@public
			@static
		*/
		api.toCanvasPosition = function (x, y) // get relative canvas position in the page
		{			
			// calcula a posicao no canvas real
			x -= _game_area.offsetLeft;
			y -= _game_area.offsetTop;
					
			// aplica a conversao de escala do plano da janela do canvas 
			// (resolucao /tamanho da tela)
			x *= (_resolution_width/_current_canvas_width);
			y *= (_resolution_height/_current_canvas_height);
			
			return {x: x, y: y};			
		};
		
				
		// #########################################################################################
		// EXPERIMENTS
		// #########################################################################################
		
		// by MelonJS
		
		/**
		 * Create and return a new Canvas
		 * @name core.display#createCanvas
		 * @function
		 * @param {Int} width width
		 * @param {Int} height height
		 * @return {Canvas}
		 */
		api.createCanvas = function(width, height) {
			var _canvas = document.createElement("canvas");

			_canvas.width = width || api.backBuffer.width;
			_canvas.height = height || api.backBuffer.height;

			return _canvas;
		};

		/**
		 * Create and return a new 2D Context
		 * @name core.display#createCanvasSurface
		 * @function
		 * @deprecated
		 * @param {Int} width width
		 * @param {Int} height height
		 * @return {Context2D}
		 */
		api.createCanvasSurface = function(width, height) {
			return api.createCanvas(width, height).getContext('2d');
		};
		
		/**
		 * enable/disable image smoothing <br>
		 * (!) this might not be supported by all browsers <br>
		 * default : enabled
		 * @name core.display#setImageSmoothing
		 * @function
		 * @param {Boolean} enable
		 */
		api.setImageSmoothing = function(enable, context) {
			if(!context)
			{
				context = api.backBufferContext2D;				
			}
			// a quick polyfill for the `imageSmoothingEnabled` property
			var vendors = ['ms', 'moz', 'webkit', 'o'];
			for(var x = 0; x < vendors.length; ++x) {
				if (context[vendors[x]+'ImageSmoothingEnabled'] !== undefined) {
					context.imageSmoothingEnabled = context[vendors[x]+'ImageSmoothingEnabled'];
				}
			};		
			// generic one (if implemented)
			if(context.imageSmoothingEnabled !== undefined) {				
				context.imageSmoothingEnabled = enable;
			}
			else {
				console.log("DISPLAY_MANAGER: ImageSmoothing nao disponivel para o seu navegador.");
			}
		};
		
		/**
		 * enable/disable Alpha for the specified context
		 * @name core.display#setAlpha
		 * @function		
		 * @param {Boolean} enable
		 * @param {Context2D} context
		 */
		api.setAlpha = function(enable, context) {			
			context.globalCompositeOperation = enable ? "source-over" : "copy";
		};
		
		// --> mudar as funcoes abaixo para um lugar melhor ???
		
		/**
		 * Clear the specified context with the given color
		 * @name core.display#clearSurface
		 * @function
		 * @param {Context2D} context
		 * @param {Color} col
		 */
		api.clearSurface = function(context, col) {
			context.save();
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.fillStyle = col;
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
			context.restore();
		};

		/**
		 * scale & keep canvas centered<p>
		 * usefull for zooming effect
		 * @name core.display#scale
		 * @function
		 * @param {Context2D} context
		 * @param {scale} scale
		 */
		api.scale = function(context, scale) {
			context.translate(
							-(((context.canvas.width * scale) - context.canvas.width) >> 1),
							-(((context.canvas.height * scale) - context.canvas.height) >> 1));
			context.scale(scale, scale);

		};
		
		// return the given canvas or image pixels
		api.getPixels = function(arg) {
			if (arg instanceof HTMLImageElement) {
				var c = api.createCanvasSurface(arg.width, arg.height);
				c.drawImage(arg, 0, 0);
				return c.getImageData(0, 0, arg.width, arg.height);
			} else { 
				// canvas !
				return arg.getContext('2d').getImageData(0, 0, arg.width, arg.height);
			}
		};			
		
		/** (!!!!!) NAO USE DENTRO DE LOOPS --> DIMINUI DRASTICAMENTE O DESEMPENHO
		 * Util para aplicar efeitos em imagens, e no canvas em casos onde o gameLoop esta parado
		 * apply the specified filter to the main canvas
		 * and return a new canvas object with the modified output<br>
		 * (!) Due to the internal usage of getImageData to manipulate pixels,
		 * this function will throw a Security Exception with FF if used locally
		 * @name core.display#applyRGBFilter
		 * @function
		 * @param {Object} object Canvas or Image Object on which to apply the filter
		 * @param {String} effect "b&w", "brightness", "transparent"
		 * @param {String} option : level [0...1] (for brightness), 
									color to be replaced (for transparent) 
		 * @return {Context2D} context object
		 */
		api.applyRGBFilter = function(object, effect, option) {
			//create a output canvas using the given canvas or image size
			var fcanvas = api.createCanvasSurface(object.width, object.height);			
			// get the pixels array of the give parameter
			var imgpix = api.getPixels(object);
			
			// pointer to the pixels data
			var pix = imgpix.data;

			// apply selected effect
			switch (effect) {
			case "b&w": {
				for ( var i = 0, n = pix.length; i < n; i += 4) {
					var grayscale = (3 * pix[i] + 4 * pix[i + 1] + pix[i + 2]) >>> 3;
					pix[i] = grayscale; // red
					pix[i + 1] = grayscale; // green
					pix[i + 2] = grayscale; // blue
				}
				break;
			}

			case "brightness": {
				// make sure it's between 0.0 and 1.0
				var brightness = Math.abs(option).clamp(0.0, 1.0);
				for ( var i = 0, n = pix.length; i < n; i += 4) {

					pix[i] *= brightness; // red
					pix[i + 1] *= brightness; // green
					pix[i + 2] *= brightness; // blue
				}
				/*fcanvas.save();
				fcanvas.fillStyle = 'rgba(0,0,0,'+(1.0-brightness)+')';
				fcanvas.fillRect(0, 0, api.backBuffer.width, api.backBuffer.height);
				fcanvas.restore();*/
				break;
			}

			case "transparent": {
				for ( var i = 0, n = pix.length; i < n; i += 4) {
					if (Util.RGBToHex(pix[i], pix[i + 1], pix[i + 2]) === option) {
						pix[i + 3] = 0;
					}
				}
				break;
			}

			default:
				return null;
			}

			// put our modified image back in the new filtered canvas
			fcanvas.putImageData(imgpix, 0, 0);

			// return it
			return fcanvas;
		};	
		
		return api;	
		
	})(); // end constructor runtime closure
	
})(); // end global runtime closure
