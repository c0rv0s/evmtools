from flask import Flask, render_template, request, jsonify
import json
from pack_struct import pack_structs

app = Flask(__name__)

@app.route('/api/pack_structs')
def index():
    struct = json.loads(request.args.get('struct'))
    processed = pack_structs(struct)
    return processed

if __name__=='__main__':
    app.run(debug=True)