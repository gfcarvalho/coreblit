#######################################################################
#   Core Blit Game Framework
#   Copyright (C) 2013, Gustavo Carvalho
#
#   Core Blit é licenciado sobre a MIT License.
#   http://www.opensource.org/licenses/mit-license.php
#
#   javascript compilation / "minification" makefile
#
#   BUILD_MODULES -- js files to minify
#   BUILD  -- js minified target file (1) 
#
#######################################################################

# GOOGLE CLOSURE COMPILER
GCC_VERSION = 2338
GCC_PATH = tools/closure-compiler/
GCC_COMPRESSOR = ${GCC_PATH}compiler$(GCC_VERSION).jar
GCC_OPTION =
# GCC_OPTION = --compilation_level ADVANCED_OPTIMIZATIONS

# JSDOC
JSDOC_VERSION = 2.4.0
JSDOC_PATH = tools/jsdoc-toolkit
JSDOC_OPTION = -d=docs -s

# Set the source directory
srcdir = src
buildir = build
docdir = docs

# CURRENT BUILD VERSION
COREBLIT_VERSION=$(shell cat $(srcdir)/version.js | sed "s/^.*[^0-9]\([0-9]*\.[0-9]*\.[0-9]*\).*/\1/")
VERSION=sed "s/@VERSION/${COREBLIT_VERSION}/"

# list of libraries
LIBRARIES = 

# list of modules
MODULES = $(srcdir)/core.js\
	 $(srcdir)/modules/system.js\
	 $(srcdir)/patch.js\
	 $(srcdir)/modules/event.js\
	 $(srcdir)/modules/display.js\
	 $(srcdir)/modules/input.js\
	 $(srcdir)/modules/timer.js\
	 $(srcdir)/modules/game.js\
	 $(srcdir)/modules/data.js\
	 $(srcdir)/classes/Vector2d.js\
	 $(srcdir)/classes/GameObject.js\
	 $(srcdir)/classes/Sprite.js\
	 $(srcdir)/classes/Animation.js

# list of modules to compile into minified file
BUILD_MODULES = $(LIBRARIES)\
	 $(MODULES)

# Temporary file (used for documentation)
TEMP = $(buildir)/_temp.js

# Debug Target name
DEBUG = $(buildir)/coreblit-$(COREBLIT_VERSION).js

# Build Target name
BUILD = $(buildir)/coreblit-$(COREBLIT_VERSION)-min.js

#######################################################################

.DEFAULT_GOAL := all

.PHONY: js

all: doc
	java -jar $(GCC_COMPRESSOR) $(GCC_OPTION) --js=$(DEBUG) --js_output_file=$(BUILD)

build: debug
	java -jar $(GCC_COMPRESSOR) $(GCC_OPTION) --js=$(DEBUG) --js_output_file=$(BUILD)

debug: clean
	cat $(BUILD_MODULES) | $(VERSION) >> $(DEBUG)

clean:
	rm -Rf $(buildir)/*
	rm -Rf $(docdir)/*

doc: debug
	cat $(MODULES) | $(VERSION) >> $(TEMP)
	java -jar $(JSDOC_PATH)/jsrun.jar $(JSDOC_PATH)/app/run.js -a -t=$(JSDOC_PATH)/templates/coreblit $(TEMP) $(JSDOC_OPTION) 
	rm -Rf $(TEMP)


#######################################################################
