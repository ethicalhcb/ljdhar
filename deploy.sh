#!/bin/bash
# This script is used to deploy the package to GitHub and the NPM registry
# codingben bs.7416@proton.me

set -e

# Check if jq is installed, otherwise install it
if ! command -v jq &> /dev/null
then
    sudo apt install jq
fi

# Function to compare versions
function version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

# Check if an argument has been passed
if [ $# -eq 0 ]
    then
        echo "No argument provided. Please provide the version."
        exit 1
fi

# Define the version
VERSION=$1

# Read the current version from package.json
CURRENT_VERSION=$(jq -r '.version' package.json)

# Check if the $VERSION is > than the one in package.json
if version_gt $VERSION $CURRENT_VERSION; then
    # Ask for confirmation before modifying files
    read -p "Update the current version to $VERSION?. Do you want to continue? (y/n) " choice
    case "$choice" in
        y|Y )
            # Modify the package.json file
            jq '.version = "'$VERSION'"' package.json > temp.json && mv temp.json package.json

            # Display modifications
            echo "Version changed to $VERSION in package.json"

            # Ask for confirmation before executing modifications
            read -p "Do you want to continue deployment to GitHub and NPM? (y/n) " choice
            case "$choice" in
                y|Y )
                    # Execute modifications
                    # Create a commit
                    git add .
                    git commit -m "Update version to $VERSION"

                    # Push to GitHub
                    git push

                    # Do an npm publish
                    npm publish

                    # Display a report
                    echo "Production deployment completed. Version $VERSION published ✨"
                    ;;
                n|N ) echo "Modifications cancelled.";;
                * ) echo "Invalid response.";;
            esac
            ;;
        n|N ) echo "Modifications cancelled." && exit 1;;
        * ) echo "Invalid response." && exit 1;;
    esac
else
    echo "The version $VERSION is less than the current version."
    exit 1
fi