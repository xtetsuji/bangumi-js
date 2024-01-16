# -*- makefile -*-

ESBUILD = ../../node_modules/.bin/esbuild
SRC_DIR = src
DIST_DIR = dist

IN_FILE = $(SRC_DIR)/app/bookmarklet.ts
OUT_FILE = $(DIST_DIR)/bookmarklet.js

NODE_ENV = bookmarklet

usage:
	@echo "Usage: make [build|pbcopy|tree|test]"

build:
	$(MAKE) $(OUT_FILE)
	wc $(OUT_FILE)

# esbuild は minify でも "\n" をテンプレートの実改行にするので、perl で戻している
# see: https://esbuild.github.io/api/#minify-considerations
$(OUT_FILE): $(IN_FILE)
	../../node_modules/.bin/esbuild \
		--bundle \
		--minify \
		--platform=browser \
		--format=iife \
		--line-limit=8192 \
		--charset=utf8 \
		--color=true \
		--target=esnext \
		--outfile=$@ \
		$<
	perl -g -pi \
		-e 's{`(\s+)`}{ sprintf qq("%s"), q(\n) x length($$1) }eg' \
		$@

pbcopy: build
	{ printf "javascript:" ; cat $(OUT_FILE) ; } | pbcopy

tree:
	@echo "=== src ==="
	tree -l $(SRC_DIR)
	@echo "=== dist ==="
	tree -l $(DIST_DIR)

test:
	@echo "Unimplemented yet."

clean:
	rm -f $(OUT_FILE)
