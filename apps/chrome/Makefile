# -*- makefile -*-

ESBUILD = ../../node_modules/.bin/esbuild
SRC_DIR = src
DIST_DIR = dist

NODE_ENV = chrome-extension

usage:
	@echo "Usage: make [build|tree]"

build:
	$(ESBUILD) \
		--bundle \
		--platform=node \
		--target=chrome109 \
		--outfile=$(DIST_DIR)/content_script.js \
		$(SRC_DIR)/app/content_script.ts
	cp manifest.json $(DIST_DIR)/
	wc -l $(DIST_DIR)/content_script.js

tree:
	@echo "=== src ==="
	tree -l $(SRC_DIR)
	@echo "=== dist ==="
	tree -l $(DIST_DIR)
