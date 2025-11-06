resource "docker_container" "mongo" {
  name  = "prf_mongo"
  image = "mongo:latest"
  ports {
    internal = 27017
    external = 27017
  }
  volumes {
    host_path = "${path.cwd}/../.data/mongo"
    container_path = "/data/db"
  }
}

resource "docker_container" "app" {
  name  = "prf_app"
  image = docker_image.app_image.name
  env = [
    "MONGO_URI=mongodb://prf_mongo:27017/prf_db"
  ]
  ports {
    internal = 3000
    external = 3000
  }
  depends_on = [docker_container.mongo]
}
