pipeline {
    agent any
    environment {
        LANG = 'en_US.UTF-8'
        LC_ALL = 'en_US.UTF-8'
        DOCKERHUB_CREDENTIALS = 'naruba200' 
        DOCKER_IMAGE_NAME = 'naruba200/mangaweb'  
        DOCKER_TAG = 'latest'                  
    }
    stages {
        stage('Clone source code') {
            steps {
                git branch: 'naruba200', url: 'https://github.com/naruba200/WebManga.git'
            }
        }

        stage('Prepare IIS folder') {
            steps {
                echo 'Creating IIS target folder (if not exists)...'
                bat 'if not exist "C:\\wwwroot\\mymangaweb" mkdir "C:\\wwwroot\\mymangaweb"'
            }
        }

        stage('Deploy to IIS folder') {
            steps {
                echo 'Deploying static site (HTML/CSS/JS)...'
                bat 'xcopy "%WORKSPACE%\\*" "C:\\wwwroot\\mymangaweb\\" /E /Y /I /R'
            }
        }

        stage('Restart IIS (if needed)') {
            steps {
                echo 'Restarting IIS...'
                bat 'iisreset'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_TAG}")
                }
            }
        }

         stage('Login to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        echo 'Logged in to Docker Hub'
                    }
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        docker.image("${DOCKER_IMAGE_NAME}:${DOCKER_TAG}").push()
                        // Optionally push :latest too
                        docker.image("${DOCKER_IMAGE_NAME}:${DOCKER_TAG}").push("latest")
                    }
                }
            }
        }

    }
}
