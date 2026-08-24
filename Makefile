.PHONY: test lint format build

SENTRY_ENABLED ?= false
SENTRY_DSN ?=
SENTRY_ENVIRONMENT ?=
SENTRY_TRACES_SAMPLE_RATE ?= 0
SENTRY_RELEASE ?=

build:
	docker build \
		--build-arg SENTRY_ENABLED="$(SENTRY_ENABLED)" \
		--build-arg SENTRY_DSN="$(SENTRY_DSN)" \
		--build-arg SENTRY_ENVIRONMENT="$(SENTRY_ENVIRONMENT)" \
		--build-arg SENTRY_TRACES_SAMPLE_RATE="$(SENTRY_TRACES_SAMPLE_RATE)" \
		--build-arg SENTRY_RELEASE="$(SENTRY_RELEASE)" \
		-t eqsitecms-core-frontend:latest .

test:
	npm test

lint:
	npm run lint
	npm run typecheck

format:
	npx eslint src --fix --fix-type layout
