from flask import Flask, jsonify, render_template, request
from flask_cors import CORS, cross_origin


app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/_add_numbers', methods=['GET', 'POST'])
@cross_origin(origin='*', methods=['GET', 'POST', 'OPTIONS'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def add_numbers():

    if request.method == 'GET':

        return jsonify(a=3, b=5)

    elif request.method == 'POST':
        a = int(request.form['a'])
        b = int(request.form['b'])

        result = a + b
        jsonified = jsonify(result=result)

    return jsonified, 201


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
