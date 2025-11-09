variable "server_image" {
  type    = string
  default = "prf-server:latest"
}

variable "client_image" {
  type    = string
  default = "prf-client:latest"
}

resource "docker_image" "server_image" {
  name         = var.server_image
  keep_locally = true
  build {
    context    = "${path.cwd}/.."
    dockerfile = "${path.cwd}/../Dockerfile.server"
  }
}

resource "docker_image" "client_image" {
  name         = var.client_image
  keep_locally = true
  build {
    context    = "${path.cwd}/.."
    dockerfile = "${path.cwd}/../Dockerfile.client"
  }
}
