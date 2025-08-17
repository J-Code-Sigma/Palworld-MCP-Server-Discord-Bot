#!/bin/bash

# Set variables
INSTALL_DIR="/home/steam/Steam/steamapps/common/PalServer"
APP_ID="2394010"
PALSERVER_SERVICE="palworldserver.service"  # Adjust if using a systemd service

echo "Stopping Palworld server..."
sudo systemctl stop "$PALSERVER_SERVICE"

echo "Updating Palworld server..."
/usr/games/steamcmd +login anonymous +force_install_dir "$INSTALL_DIR" +app_upd>

echo "Update complete. Restarting server..."
sudo systemctl start "$PALSERVER_SERVICE"

echo "Palworld server is now running with the latest update!"


