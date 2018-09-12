all: build
S3_BUCKET=com.brave.research.lambda-funcs
FUNCTION_NAME := brave-tag-crawler-worker
TMP_WORKSPACE := /tmp/$(FUNCTION_NAME)

build: clean
	rm -Rf $(TMP_WORKSPACE);
	mkdir $(TMP_WORKSPACE);
	cp -R * $(TMP_WORKSPACE)/;
	rm -Rf $(TMP_WORKSPACE)/node_modules/aws-sdk;
	rm -Rf $(TMP_WORKSPACE)/node_modules/eslint;
	rm -Rf $(TMP_WORKSPACE)/node_modules/eslint-*;
	find $(TMP_WORKSPACE)/node_modules -type f -name "*.md" -delete;
	find $(TMP_WORKSPACE)/node_modules -type d -name "test" | xargs rm -Rf;
	rm $(TMP_WORKSPACE)/Makefile;
	rm $(TMP_WORKSPACE)/*.json;
	cd $(TMP_WORKSPACE) && zip -r $(FUNCTION_NAME).zip *;
	cp $(TMP_WORKSPACE)/$(FUNCTION_NAME).zip $(FUNCTION_NAME).zip;

clean:
	test -f $(FUNCTION_NAME).zip && rm $(FUNCTION_NAME).zip || echo "clean";

deploy:
	aws s3 cp $(TMP_WORKSPACE)/$(FUNCTION_NAME).zip s3://$(S3_BUCKET)/$(FUNCTION_NAME).zip
	aws lambda update-function-configuration --function-name $(FUNCTION_NAME)
	aws lambda update-function-code --function-name $(FUNCTION_NAME) --s3-bucket $(S3_BUCKET) --s3-key $(FUNCTION_NAME).zip
