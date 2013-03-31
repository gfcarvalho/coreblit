[Core Blit](http://github.com/gfcarvalho/coreblit) html5 game framework
=============================================================================

(!) Em fase inicial de desenvolvimento - recomenda-se a utilização apenas para experimentos

Copyright (C) 2013, Gustavo Carvalho

Core Blit é licenciado sobre a [MIT License](http://www.opensource.org/licenses/mit-license.php)

Sobre Core Blit
-------------------------------------------------------------------------------
Core Blit é um framework para desenvolvimento de jogos em HTML5.

Por ser simples, leve e sem dependências de outros softwares é a solução ideal para iniciantes e para aqueles que buscam uma plataforma base para construir sua própria game engine.

Core Blit é o resultado de 2 anos de estudo em Javascript e HTLM5 no desenvolvimento de jogos, e apresenta(pretende) as seguintes funcionalidades principais :

- Renderização 2D através de HTML5 Canvas
- Display auto-ajustável com diversas opções de configuração
  - modo janela ou fullscreen
  - ajuste de resolução
	- preenchimento de tela(stretch to fit)
	- aspect-ratio fixo ou variável
	- suporte a double buffer
- Animações baseadas em sprites 2D com alto grau de liberdade e configurações
	- permite configurar cada quadro da animação independentemente
- Gerenciamento de eventos internos e da plataforma(browser)
- Preload de recursos externos (imagens e sons)
- Suporte a teclado, mouse e touchscreen (multiple touch inclusive)
- Suporte a HTML5 Audio
- Gerenciamento de entidades e outros elementos de jogo
- Detecção de colisão
- Suporte a Física programacional (individual)
	- interação dinâmica entre os objetos fica a cargo do programador


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

Tanto a versão plain quanto a minificada da biblioteca estarão disponíveis no diretório "build/minified"

Construindo a documentação
-------------------------------------------------------------------------------
`$ cd path/to/coreblit`

`$ make doc`

A ducumentação gerada estará disponível no diretório "docs"

Build completo (Regular + Documentação)
-------------------------------------------------------------------------------
`$ cd path/to/coreblit`

`$ make`

Tanto a versão plain quanto a minificada da biblioteca estarão disponíveis no diretório "build/minified"<br>

A ducumentação gerada estará disponível no diretório "docs"

Utilizando Core Blit
-------------------------------------------------------------------------------
Tutorial: será disponibilizado em breve =)

Sugestões, dúvidas, precisa de ajuda ?
-------------------------------------------------------------------------------
Utilize o wiki do projeto ou entre em contato através do [email](mailto:gustavo.carvalho@ufv.br).
