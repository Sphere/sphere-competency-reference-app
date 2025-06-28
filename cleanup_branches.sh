#!/bin/bash

# Define the branches you want to keep
branches_to_keep=(
  "feature/dev-sphere-dev"
  "feature/dev-sphere-baseline"
  "feature/cap-dev-sphere"
  "feature/cap-dev-ios"
  "release-1.0.0-ios"
 "feature/release-1.1-ios"
  "feature/app-performance"
  "feature/latest"
  "vishali/asha-home-cap"
  "fixes/dev-sphere-baseline"
  "fixes/dev-sphere-dev"
  "feature/release-1.1-ios"
  "vishali/new-home-latest"
  "feature/builConfiguration"
  "master"
  feture/dev-sphere-baseline
)

# Fetch all remote branches
git fetch --all

# Get the list of remote branches (excluding HEAD and already deleted ones)
remote_branches=$(git branch -r | grep -v '\->' | sed 's|origin/||' | sort | uniq)

# Iterate through each remote branch
for branch in $remote_branches; do
  if [[ ! " ${branches_to_keep[@]} " =~ " $branch " ]]; then
    echo "Deleting remote branch: $branch"
    git push origin --delete "$branch"
  fi
done
