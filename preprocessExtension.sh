#!/bin/bash

DIR="dist/"
if [ ! -d "$DIR" ]; then
  echo "⚠️ Warning: '$DIR' NOT found. Creating '$DIR' ..."
  mkdir $DIR
fi

echo "📂 Copying files now in '$DIR' ..."

echo "🚀 Creating .crx file ..."
cd src/ && zip -r ../../dist/extension.crx .
echo "✅ .crx file created successfully!"