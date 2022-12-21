cd flask_server
pip install -r requirements.txt
export FLASK_APP=server.py
pm2 start server.py --interpreter python3

cd ../ts_server
yarn
yarn build
pm2 start dist/index.js
