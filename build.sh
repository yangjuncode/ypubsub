#!/usr/bin/env bash

mainName=$(
  cat package.json \
  | grep main \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g' \
  | awk -F/ '{ print $NF }'
)
echo entry file: $mainName

typesName=$(
  cat package.json \
  | grep types \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g' \
  | awk -F/ '{ print $NF }'
)
echo types file: $typesName

outputDir="dist"
cd $outputDir
mv ./*.d.ts $typesName
mv ./*.js $mainName
