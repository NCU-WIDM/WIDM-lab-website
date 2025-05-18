#!/bin/bash
# sudo kill -9 $(sudo lsof -i :7230 | grep LISTEN | awk '{print $2}')
# npm start

# openapi-generator-cli generate -i swagger.json -g javascript -o ./domain/api-client -t ./domain/custom-templates/javascript --additional-properties=usePromises=true

docker rm -f widm-front-end
docker build -t widm-front-end .
docker run -d -p 7230:7230 -p 24678:24678 widm-front-end 

# chmod +x run_docker.sh
# ./run_docker.sh


