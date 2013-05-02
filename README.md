[Core Blit](http://github.com/gfcarvalho/coreblit)
=============================================================================
<b>HTML5 game framework</b>

Copyright (C) 2013, Gustavo Carvalho

Core Blit é licenciado sobre a [MIT License](http://www.opensource.org/licenses/mit-license.php)


Sobre Core Blit
-------------------------------------------------------------------------------
<b>( ! ) AVISO: Em fase inicial de desenvolvimento. Recomenda-se a utilização apenas para experimentos.</b>

Core Blit é um framework para desenvolvimento de jogos em HTML5.

Por ser simples, leve e sem dependências de outros softwares é a solução ideal para iniciantes e para aqueles que buscam uma plataforma base para construir sua própria game engine.

Core Blit apresenta inicialmente as seguintes funcionalidades principais:
Funcionalidades marcadas com * estão em estágio avançado desenvolvimento e podem não estar disponíveis por enquanto.

- Multi-plataforma (HTML5 powered)
- Renderização 2D através de HTML5 Canvas
- Display auto-ajustável com diversas opções de configuração
  - modo janela ou fullscreen
  - ajuste de resolução
	- preenchimento de tela(stretch to fit)
	- aspect-ratio fixo ou variável
	- suporte a double buffer
- Gerenciamento de eventos internos e da plataforma(browser)
- Preload de recursos externos (imagens e sons*)
- Animações baseadas em sprites 2D com alto grau de liberdade e configurações *
	- permite configurar cada quadro da animação independentemente *
- Suporte a teclado, mouse* e touchscreen*
- Suporte a HTML5 Audio *
- Gerenciamento de entidades e outros elementos de jogo
- Detecção de colisão *
- Simulação Física *	
- ... e mais

(*) Em desenvolvimento.

Contribua
-------------------------------------------------------------------------------
Clone o diretório do projeto, use o fork para manter o repositório atualizado e submeta as contribuições.

Sua contribuição será mais do que bem vinda!

Construindo Core Blit
-------------------------------------------------------------------------------
Para efetuar o build de coreblit, você necessita do GNU make e Java instalados :

No windows, você deve instalar [Cygwin](http://cygwin.com/) (certifique-se de escolher “make’ na lista de pacotes, note que também é possível utilizar [GNU make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm)), Java pode ser baixado [aqui](http://java.com/en/download/index.jsp).

No OS X, você deve instalar [Xcode](https://developer.apple.com/xcode/) (ambas as versões Xcode 3 & Xcode 4 podem ser utilizadas).

No Linux/BSD usuários devem utilizar os próprios package managers para instalar make e java.

Regular build :
-------------------------------------------------------------------------------
`$ cd /path/to/coreblit`

`$ make build`

Tanto a versão plain quanto a minificada da biblioteca estarão disponíveis no diretório "build".

Construindo a documentação
-------------------------------------------------------------------------------
`$ cd path/to/coreblit`

`$ make doc`

A ducumentação gerada estará disponível no diretório "docs".

Build completo (Regular + Documentação)
-------------------------------------------------------------------------------
`$ cd path/to/coreblit`

`$ make`

Tanto a versão plain quanto a minificada da biblioteca estarão disponíveis no diretório "build".

A ducumentação gerada estará disponível no diretório "docs".

Utilizando Core Blit
-------------------------------------------------------------------------------
Tutorial: será disponibilizado em breve

Sugestões, dúvidas, precisa de ajuda ?
-------------------------------------------------------------------------------
Entre em contato através do [email](mailto:gustavo.carvalho@ufv.br).

Em breve: site, documentação JSDoc online e Wiki page :)
