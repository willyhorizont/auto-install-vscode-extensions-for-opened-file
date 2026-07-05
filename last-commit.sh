#!/bin/bash

SD=$(dirname "$(realpath "$0")")
RD=$(realpath "$SD")
V="0.0.66" # ! DON'T FORGET TO CHANGE VERSION BEFORE RUNNING !!!!
T=$(date "+%d %b %Y @ %I:%M %p")
# ! DON'T FORGET TO CHANGE COMMIT MESSAGE BEFORE RUNNING !!!!
M="
[Last updated: $T]
version $V:
update default
"
M=$(sed -e '/./,$!d' <<< "$M")
awk -v msg="$M" 'BEGIN {print msg; print ""} {print}' "$RD/changelog.txt" > "$RD/changelog.tmp" && mv "$RD/changelog.tmp" "$RD/changelog.txt"
\. "$HOME/.nvm/nvm.sh"
npm version "$V" --no-git-tag-version
git add .
git commit -m "$M"
git tag -d "$V" 2>/dev/null
git tag -a "$V" -m "$M"
git push origin main -f
git push origin --tags -f
