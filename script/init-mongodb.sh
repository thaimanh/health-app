#!/bin/bash

# === CONFIG ===
CONTAINER_NAME="mongodb-health-app"
DB_NAME="health-app"
MONGO_PORT=27017
REPLICA_SET_NAME="rs0"

# Stop and remove any old container
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "🧹 Removing old MongoDB container..."
  docker stop $CONTAINER_NAME >/dev/null 2>&1
  docker rm $CONTAINER_NAME >/dev/null 2>&1
fi

# Run MongoDB with replica set enabled
echo "🚀 Starting MongoDB with replica set..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $MONGO_PORT:27017 \
  -e MONGO_INITDB_DATABASE=$DB_NAME \
  mongo:latest --replSet $REPLICA_SET_NAME --bind_ip_all

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to initialize..."
sleep 5

# Initialize replica set if not already
echo "⚙️  Initializing replica set..."
docker exec -it $CONTAINER_NAME mongosh --eval "
rs.initiate({
  _id: '$REPLICA_SET_NAME',
  members: [{ _id: 0, host: 'localhost:$MONGO_PORT' }]
});
"

echo "✅ MongoDB with replica set '$REPLICA_SET_NAME' is ready on port $MONGO_PORT"
