/**
 * @license Core Blit - HTML5 Game Framework
 * Copyright (C) 2013, Gustavo Carvalho
 *
 * Versao @VERSION 
 *
 * Core Blit é licenciado sobre a MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

/**
 *	(<b>core</b>) blit : Todas as funcoes (modulos, classes)do framework 
 *	sao definidas dentro deste namespace.
 *	<p> Geralmente nao se deve adicionar novas propriedades a este namespace pois podem ser
 * 	sobrescritas em proximas versoes do framework.</p>
 * 	@namespace
 *	@version @VERSION
 */
var core = core || {};

(function(w) {
	
	/**  
	 * Pega o documento relativo ao objeto window correto
	 * @ignore 
	 */
	document = w.document;
	
	core = {		
		mod : "coreblit",
		version : "@VERSION",
		nocache : '',

		// modules:
		
		system: null, // system information
		event: null, // event manager
		display: null, // screen manager
		timer: null, // time manager
		game: null // game manager		
		// input: null, // input manager
		// debug: null, // ferramentas de depuracao				
		
		// data: null, // data(resource) manager
		// util: null, // utilitarios
		// plugin: null, // plugin manager
		// audio: null, // html5 <audio>
		// video: null, // html5 <video>
		// storage: null, // html5 storage system
		
		// physicManager: null, ( box2d ? )
		// collisionManager: null,
		// aiManager: null, // A* pathfinder, minmax, etc
		// networkManager: null // node.js??		
		
	};	 
})(window);
