check: lint test

bench:
	node bench/bench.js

lint:
	./node_modules/.bin/biome ci

format:
	./node_modules/.bin/biome check --fix

test:
	node --test $(TEST_OPTS)

test-cov: TEST_OPTS := --experimental-test-coverage
test-cov: test

.PHONY: bench check format lint test test-cov
