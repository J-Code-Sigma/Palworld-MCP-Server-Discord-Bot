#!/bin/bash

# Variables
SERVICE_NAME="palworldserver.service"

echo "Stopping Palworld server..."
sudo systemctl stop "$SERVICE_NAME"

echo "Waiting a few seconds to ensure shutdown..."
sleep 5

echo "Starting Palworld server..."
sudo systemctl start "$SERVICE_NAME"

echo "Palworld server restarted successfully!"