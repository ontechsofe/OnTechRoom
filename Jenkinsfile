pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                app = docker.build('ethandelliott/ontechroom')
                echo 'Building Done'
            }
        }
        stage("Push") {
            echo 'Pushing...'
            docker.withRegistry("https://registry.hub.docker.com", "docker-hub-credentials") {
                app.push("${env.BUILD_ID}")
                app.push("latest")
            }
            echo 'Pushing Done'
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
                sh "ssh root@167.99.182.99 \"docker stop ast_0 && \
                    docker rm ast_0 && \
                    docker pull ethandelliott/ontechroom:latest && \
                    docker run -d --name=ast_0 3000:3000 ethandelliott/ontechroom:latest\""
                echo 'Deploying Done'
            }
        }
    }
}
