# Installation

+ Check the `run.sh`
```
chmod +x run_docker.sh
./run_docker.sh
```


+ Generate the Swagger file.
The file settings are in custom-templates.
```
openapi-generator-cli generate -i swagger.json -g javascript -o ./api-client -t ./custom-templates/javascript --additional-properties=usePromises=true
```
