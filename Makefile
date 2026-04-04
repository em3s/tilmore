.PHONY: dev build clean

dev:
	BASE_URL="/" bash build.sh
	@echo "\nhttp://localhost:8000\n"
	cd dist && python3 -m http.server 8000

build:
	bash build.sh

clean:
	rm -rf dist
