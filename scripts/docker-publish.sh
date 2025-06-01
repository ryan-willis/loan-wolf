#!/bin/bash

# get the absolute path to this script
SCRIPTS_DIR=$(dirname "$(realpath "$0")")

# get the version from package.json one level up
VERSION=$(jq -r '.version' "$SCRIPTS_DIR/../package.json")

docker buildx build --push --platform linux/amd64,linux/arm64 --tag ghcr.io/ryan-willis/loan-wolf:v$VERSION --tag ghcr.io/ryan-willis/loan-wolf:latest $SCRIPTS_DIR/../
