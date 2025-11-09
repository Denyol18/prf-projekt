resource "docker_container" "server" {
  name  = "prf_server"
  image = docker_image.server_image.name
  restart = "unless-stopped"

  env = [
    "JWT_SECRET=valami_nagyon_titkos_jelszo",
    "ATLAS_URI=mongodb+srv://sprokdaniel:Jbt68TGnWczTYilq@prfcluster.bjw44kp.mongodb.net/healthcare_data_manager?retryWrites=true&w=majority&appName=PrfCluster"
  ]

  ports {
    internal = 3000
    external = 3000
  }
}

resource "docker_container" "client" {
  name  = "prf_client"
  image = docker_image.client_image.name
  restart = "unless-stopped"

  ports {
    internal = 80
    external = 4200
  }

  depends_on = [docker_container.server]
}
