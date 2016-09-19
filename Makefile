ROOT := $(shell pwd 2>/dev/null)

PATH := $(ROOT)/node_modules/.bin:$(PATH)
export PATH



WHICH := 2>/dev/null which
ESLINT = $(shell PATH="$(PATH)" $(WHICH) eslint || echo "ESLINT_NOT_FOUND") --max-warnings 0
ISTANBUL = $(shell PATH="$(PATH)" $(WHICH) istanbul || echo "ISTANBUL_NOT_FOUND")
MOCHA = $(shell PATH="$(PATH)" $(WHICH) _mocha || echo "MOCHA_NOT_FOUND")
JSON ?= $(shell PATH="$(PATH)" $(WHICH_Q) json || echo "JSON_NOT_FOUND") -D " "
AWS_CLI = $(shell PATH="$(PATH)" $(WHICH) aws || echo "AWS_CLI_NOT_FOUND")
AWS_SI = $(shell PATH="$(PATH)" $(WHICH) aws-si || echo "AWS_SI_NOT_FOUND")

# This line parses the files attribute in package.json. The purpose of this is to tell Make what files to include when running make package.
# What it does:
# 1. awk '/"files":( )?\[/,/\]/' package.json: 	Takes the "files": ["file1", "file2", ...] segment of package.json
# 2. tr -d '\n': 								Replaces all newlines to get the awk result as a single line
# 3 & 4. cut -d[ -f2 | cut -d ] -f 1: 			Removes everything before [ and after ] leaving us with the file list: "file1", "file2", ...
# 5. tr -d ' ': 								Remove all spaces from the string
# 6. tr -d '"':									Remove all (") from the string
# 7. tr , ' ': 									Replace , with space
#
# The result is a string like: file1 file2 ... which can be used in the zip command (zip file.zip $(PACKAGE_FILES)
PACKAGE_FILES := $(shell awk '/"files":( )?\[/,/\]/' package.json | tr -d '\n' | cut -d[ -f2 | cut -d ] -f 1 | tr -d ' ' | tr -d '"' | tr , ' ')

# Similar to above but less complicated
S3_BUCKET = $(shell awk '/"s3Bucket":( )?\"/,/"/' package.json | cut -d: -f2 | tr -d ' ' | tr -d '"' | tr -d ',')
S3_PREFIX = $(shell awk '/"s3Prefix":( )?\"/,/"/' package.json | cut -d: -f2 | tr -d ' ' | tr -d '"' | tr -d ',')
CFN_TEMPLATE = $(shell awk '/"cloudFormationTemplate":( )?\"/,/"/' package.json | cut -d: -f2 | tr -d ' ' | tr -d '"' | tr -d ',')

GIT_NUKE_EXCLUDE = -e "/.idea"

.PHONY: default
default: all


.PHONE: deps
deps:
	npm install


.PHONY: test
test: deps lint coverage


.PHONY: lint
lint: deps
	$(ESLINT) src tests


.PHONY: deps unit
unit: test-unit


.PHONY: test-unit
test-unit: deps
	NODE_ENV=TEST $(MOCHA) ./tests/unit --recursive


.PHONY: coverage
coverage: deps
	NODE_ENV=TEST $(ISTANBUL) cover --include-all-sources true -i "src/**/*.js" $(MOCHA) ./tests/unit -- --recursive
	NODE_ENV=TEST $(ISTANBUL) check-coverage --statement 100 --branches 100 --functions 100 --lines 100


.PHONY: package
package: deps test
	npm prune --production
	npm publish


.PHONY: clean
clean:
	rm -rf node_modules coverage npm-debug.log


.PHONY: nuke
nuke:
	git clean -xdf $(GIT_NUKE_EXCLUDE) .
	git checkout .
