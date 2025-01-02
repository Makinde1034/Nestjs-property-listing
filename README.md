# How to deploy

1. update instance
   `run` sudo apt update && sudo apt upgrade -y

2. Install NodeJs
   `run` curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

3. install pm2 `run`
   sudo npm install -g pm2
4. upload app `run` gcloud compute scp /local/path/to/your-app.zip [INSTANCE_NAME]:~ --zone [ZONE]
   eg. gcloud compute scp /home/af/vscode/waseet-backend.zip meelisfidelis@dammam-instance-new:~ --zone me-central2-b

5.
