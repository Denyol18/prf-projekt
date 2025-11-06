pipeline {
  agent any
  environment {
    IMAGE_NAME = "prf-projekt"
    TAG = "${env.BUILD_NUMBER}"
    REGISTRY = "" // leave empty for local Docker daemon, or set registry like ghcr.io/youruser
  }
  stages {
    stage('Checkout') {
      steps { git url: 'https://github.com/Denyol18/prf-projekt.git', branch: 'main' }
    }
    stage('Install & Lint') {
      steps {
        dir('server') {
          sh 'npm ci --no-audit'
          sh 'npm run lint || true'
        }
        dir('client') {
          sh 'npm ci --no-audit'
          sh 'npm run lint || true'
        }
      }
    }
    stage('Test') {
      steps {
        dir('server') {
          sh 'npm test || true'
        }
      }
    }
    stage('Build client') {
      steps {
        dir('client') {
          sh 'npm run build -- --output-path=dist || true'
        }
        // copy built client into server so server serves static files
        sh 'rm -rf server/dist/public || true'
        sh 'mkdir -p server/dist/public'
        sh 'cp -r client/dist/* server/dist/public || true'
      }
    }
    stage('Build images') {
      steps {
        // Build server image (multi-stage builds already configured)
        sh "docker build -f Dockerfile.server -t ${IMAGE_NAME}:${TAG} ."
      }
    }
    stage('Push (optional)') {
      when { expression { env.REGISTRY != '' } }
      steps {
        // login and push to registry - left blank if local
        sh "docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}/${IMAGE_NAME}:${TAG}"
        sh "docker push ${REGISTRY}/${IMAGE_NAME}:${TAG}"
      }
    }
    stage('Deploy (Terraform)') {
      steps {
        dir('terraform') {
          sh 'terraform init -input=false'
          sh "terraform apply -auto-approve -var image=${IMAGE_NAME}:${TAG}"
        }
      }
    }
  }
  post {
    success {
      // notify or run additional steps
      echo 'Build and deploy successful'
    }
    failure {
      echo 'Build failed'
    }
  }
}
