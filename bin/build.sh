#!/bin/sh

# Script to generate an optimized client build of BrowserQuest

BUILDDIR="/app/client-build"
PROJECTDIR="/app/client/js"
RJS="/app/bin/r.js"

echo "Deleting previous build directory"
rm -rf $BUILDDIR

echo "Building client with RequireJS"
cd $PROJECTDIR
node $RJS -o build.js

echo "Removing unnecessary js files from the build directory"
find $BUILDDIR/js -type f -not \( -name "game.js" -o -name "home.js" -o -name "log.js" -o -name "require-jquery.js" -o -name "modernizr.js" -o -name "css3-mediaqueries.js" -o -name "mapworker.js" -o -name "detect.js" -o -name "underscore.min.js" -o -name "text.js" \) -delete

echo "Removing sprites directory"
rm -rf $BUILDDIR/sprites

echo "Removing config directory"
rm -rf $BUILDDIR/config

echo "Moving build.txt to current dir"
mv $BUILDDIR/build.txt /app

echo "Build complete"
