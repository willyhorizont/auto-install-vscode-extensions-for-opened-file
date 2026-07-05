#!/bin/bash

SD="$(dirname "$(realpath "$0")")"
RD="$(realpath "$SD")"
N=$(jq -r '.name' "$SD/package.json")
# echo "SD: $SD"
# echo "RD: $RD"
# echo "N: $N"

\. "$HOME/.nvm/nvm.sh"
rm -f "$N-*.vsix"
# code --uninstall-extension "undefined_publisher.$N"
cd "$SD"
# npm version patch --no-git-tag-version
# cp -f "$RD/languages.json" "$SD"
# cp -f "$RD/vscode-extensions-base.txt" "$SD"
V=$(jq -r '.version' "$SD/package.json")
vsce package --allow-missing-repository
# code --install-extension "$N-$V.vsix"
cd "$RD"
# rm -f "$SD/languages.json"
# rm -f "$SD/vscode-extensions-base.txt"
# rm -f "$SD/$N-$V.vsix"
# cp -f "$SD/$N-$V.vsix" "$RD/$N.vsix"
