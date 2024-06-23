#!/bin/bash

start_time=$(date +%s)  # Record the start time in seconds since epoch

id=$(curl -s -X POST "http://localhost:3000/upload" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/cosmos1721/test"}' | grep -oP '(?<="id":")[^"]*')

# Check status periodically until "status": "Done" is received
if [ -n "$id" ]; then
  while true; do
    response=$(curl -s -X GET "http://localhost:3000/status?id=${id}")
    status=$(echo "$response" | grep -oP '(?<="status":")[^"]*')
    echo -en "\r\033[2KStatus: $status"

    if [ "$status" = "Done" ]; then
      break
    fi

    sleep 0.5
  done

  end_time=$(date +%s)  # Record the end time in seconds since epoch
  duration=$((end_time - start_time))  # Calculate duration in seconds

  # Format the duration into HH:MM:SS
  duration_formatted=$(printf '%02d:%02d:%02d' $(($duration/3600)) $(($duration%3600/60)) $(($duration%60)))

  echo -e "\nProcess completed in $duration_formatted"
  echo -e "http://${id}.localhost:3001/index.html"
else
  echo "Failed to retrieve id from response"
fi
