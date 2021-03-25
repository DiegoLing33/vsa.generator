docker build -t diegoling/vsa-generator .
docker run --name vsa -p 3000:3000 -d diegoling/vsa-generator
