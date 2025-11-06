variable "image" {
  type = string
  default = "prf-projekt:latest"
}

resource "docker_image" "app_image" {
  name = var.image
  keep_locally = true
  build {
    context = "${path.cwd}/.."
    dockerfile = "${path.cwd}/../Dockerfile.server"
  }
}
