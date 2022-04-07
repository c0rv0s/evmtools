cd flask_server
pip install -r requirements.txt
export FLASK_APP=server.py
nohup flask run &

cd ../ts_server
yarn
yarn build
pm2 start dist/index.js