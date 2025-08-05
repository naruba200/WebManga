pipeline {
    agent any

    stages {
        stage('Clone source code') {
            steps {
                git branch: 'main', url: 'https://github.com/naruba200/WebManga.git'
            }
        }

        stage('Prepare IIS folder') {
            steps {
                echo 'Creating IIS target folder (if not exists)...'
                bat 'if not exist "C:\\inetpub\\wwwroot\\mymangaweb" mkdir "C:\\inetpub\\wwwroot\\mymangaweb"'
            }
        }

        stage('Deploy to IIS folder') {
            steps {
                echo 'Deploying static site (HTML/CSS/JS)...'
                bat 'xcopy "%WORKSPACE%\\*" "C:\\inetpub\\wwwroot\\mymangaweb\\" /E /Y /I /R'
            }
        }

        stage('Restart IIS (if needed)') {
            steps {
                echo 'Restarting IIS...'
                bat 'iisreset'
            }
        }
    }
}
