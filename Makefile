NODE_MODULES="node_modules"
BUILD_TARGET="./build/"
MODULE_NAME="vts-browser-js"

$(NODE_MODULES):
	npm install

install: $(NODE_MODULES)
	echo "Packages installed"

clean:
	rm -rf $(BUILD_TARGET)

very-clean: clean
	rm -rf $(NODE_MODULES)

dist/vts-core.js: install
	npm run dist

dist: install dist/vts-core.js
	echo "Compressed version $(MODULE_NAME) saved to ./dist/ directory"

build/vts-core.js: install
	npm run build

build: install build/vts-core.js
	echo "$(MODULE_NAME) saved to $(BUILD_TARGET) directory"

dev:
	npm run dev& npm run start

all:
	dist
	dev

help:
	@echo ""
	@echo "Build system for Melown $(MODULE_NAME)"
	@echo " "
	@echo "The Makefile is basically just wrapper around npm scripts"
	@echo "(which is wrapper arround webpack)"
	@echo " "
	@echo "install - install external dependencies using 'npm install'  command"
	@echo "dist    - install deps, build compressed version to 'dist/' directory"
	@echo "build   - install deps, build uncompressed version along with source"
	@echo "          map version to 'dist/' directory"
	@echo "dev     - install deps, run server (http://localhost:8080) and refresh"
	@echo "          when file source file changes"
	@echo "all     - shortcut for 'make dist' and 'make dev'"
	@echo ""

