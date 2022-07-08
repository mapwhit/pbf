check: lint test

lint:
	./node_modules/.bin/eslint index.js compile.js test/*.js bench/bench-tiles.js bin/pbf

test:
	./node_modules/.bin/tap test/*.test.js

.PHONY: check lint test

