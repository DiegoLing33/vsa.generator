docker build -t diegoling/vsa-generator .
docker run --name vsa -p 8011:8011 -d diegoling/vsa-generator
