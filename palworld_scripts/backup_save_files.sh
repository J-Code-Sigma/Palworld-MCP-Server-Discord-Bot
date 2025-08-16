#!/bin/bash

# Set your email address
EMAIL="youremail@gmail.com"
SUBJECT="Git Backup Script Error"
BODY_FILE="/tmp/git_error.txt"

# Navigate to the save directory
cd /home/steam/Steam/steamapps/common/PalServer/Pal/Saved/SaveGames || {
    echo "Failed to navigate to save directory" > "$BODY_FILE"
    mail -s "$SUBJECT" "$EMAIL" < "$BODY_FILE"
    exit 1
}

# Add changes
git add .
if [ $? -ne 0 ]; then
    echo "git add failed" > "$BODY_FILE"
    mail -s "$SUBJECT" "$EMAIL" < "$BODY_FILE"
    exit 1
fi

# Commit changes
git commit -m "Automated backup of save files"
if [ $? -ne 0 ]; then
    echo "git commit failed (possibly no changes to commit)" > "$BODY_FILE"
    mail -s "$SUBJECT" "$EMAIL" < "$BODY_FILE"
    exit 1
fi

# Push changes
git push origin master
if [ $? -ne 0 ]; then
    echo "git push failed" > "$BODY_FILE"
    mail -s "$SUBJECT" "$EMAIL" < "$BODY_FILE"
    exit 1
fi

# Clean up
rm -f "$BODY_FILE"
