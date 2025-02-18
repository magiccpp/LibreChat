This version implemented a simple blind test framework, we can compare the LLMs as they are tennis players.

How to setup the development?
docker compose -f deploy-compose.yml -f docker-compose.override.yml stop
docker compose -f docker-compose-dev.yml up -d

npm run backend:dev
npm run frontend:dev

then access localhost:3090 for debugging + hot fix.
