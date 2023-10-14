check: lint test

lint:
	./node_modules/.bin/eslint index.js test/*.js bench/bench-tiles.js

test:
	node --test

bench:
	node bench/bench.js

.PHONY: check lint test bench cov
