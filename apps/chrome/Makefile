# -*- makefile -*-

ESBUILD = ../../node_modules/.bin/esbuild
SRC_DIR = src
DIST_DIR = dist

NODE_ENV = chrome-extension

usage:
	@echo "Usage: make [build|tree]"

rewrite-build-date:
	perl -pi \
	-e 's{(?<=^const BUILD_DATE = ).*}{ $$date = localtime; qq["$$date";];}e' \
		$(SRC_DIR)/handler/beta_build_date_handler.ts

clear-build-date:
	perl -pi \
	-e 's{(?<=^const BUILD_DATE = ).*}{ qq["";];}e' \
		$(SRC_DIR)/handler/beta_build_date_handler.ts

build: rewrite-build-date
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
