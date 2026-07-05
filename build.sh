#!/bin/bash

SD="$(dirname "$(realpath "$0")")"
RD="$(realpath "$SD")"
rm -f "$RD/*.vsix"
N=$(jq -r '.name' "$SD/package.json")
P=$(jq -r '.publisher' "$SD/package.json")
V=$(jq -r '.version' "$SD/package.json")
\. "$HOME/.nvm/nvm.sh"
code --uninstall-extension "$P.$N"
vsce package --no-dependencies
