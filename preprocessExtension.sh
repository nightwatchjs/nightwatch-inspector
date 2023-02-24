#!/bin/bash

DIR="dist/"
if [ ! -d "$DIR" ]; then
  echo "⚠️ Warning: '$DIR' NOT found. Creating '$DIR' ..."
  mkdir $DIR
fi

echo "📂 Moving to src folder ..."
cd src/
echo "🚀 Creating .crx file ..."
zip -r ../dist/extension.crx .
echo "✅ .crx file created successfully!"