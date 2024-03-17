# -*- makefile -*-

ESBUILD = npx esbuild
SRC_DIR = src
DIST_DIR = dist

NODE_ENV = chrome-extension

usage:
	@echo "Usage: make [build|tree|test]"

build:
	$(ESBUILD) \
		--bundle \
		--platform=node \
		--target=esnext \
		--outfile=$(DIST_DIR)/bangumi2gcal.js \
		$(SRC_DIR)/app/bangumi2gcal.ts
	chmod +x $(DIST_DIR)/bangumi2gcal.js
	wc -l $(DIST_DIR)/bangumi2gcal.js

tree:
	@echo "=== src ==="
	tree -l $(SRC_DIR)
	@echo "=== dist ==="
	tree -l $(DIST_DIR)

# TODO: Jest で .spec.ts ファイルにテストを書く
test:
	wc -l dist/bangumi2gcal.js
	dist/bangumi2gcal.js "https://bangumi.org/tv_events/AiSjQIgrgAM?overwrite_area=13"
