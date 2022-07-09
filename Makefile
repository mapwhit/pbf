check: lint test

lint:
	./node_modules/.bin/eslint index.js test/*.js bench/bench-tiles.js

test:
	./node_modules/.bin/tap --reporter dot --no-cov test/*.test.js

bench:
	node bench/bench.js

cov:
	./node_modules/.bin/tap test/*.test.js --cov --coverage-report=html

.PHONY: check lint test bench cov
