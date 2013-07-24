#!/bin/sh

handle_fail() {
    echo; echo "Build failed"
    exit 1
}

# Ensure we're in the build directory
cd `dirname $0`

OutDebugFile='output/knockout.punches.js'
OutMinFile='output/knockout.punches.min.js'

# Delete output files (ensures we can write to them)
rm -f $OutDebugFile $OutMinFile

# Combine the source files
cat fragments/pre.js \
    ../src/utils.js \
    ../src/textFilter.js \
    ../src/namespacedBinding.js \
    ../src/wrappedCallback.js \
    ../src/preprocessBindingProperty.js \
    ../src/expressionCallback.js \
    fragments/post.js > $OutDebugFile

# Produce minified version using Google Closure compiler
java -jar tools/compiler.jar --js $OutDebugFile --js_output_file $OutMinFile  #--formatting PRETTY_PRINT

echo; echo "Build succeeded"
