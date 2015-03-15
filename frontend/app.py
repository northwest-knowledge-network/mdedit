from flask import Flask, jsonify, render_template, request
from flask_cors import CORS, cross_origin


app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/_add_numbers', methods=['POST'])
@cross_origin(origin='*', methods=['GET', 'POST', 'OPTIONS'], headers=['X-Requested-With', 'Content-Type', 'Origin'])
def add_numbers():
    print request.form['a']
    print request.form['b']

    a = int(request.form['a'])
    b = int(request.form['b'])

    print "a = %s" % a
    print "b = %s" % b
    result = a + b
    print "result = %s" % result
    jsonified = jsonify(result=result)
    print "jsonified = %s" % jsonified
    return jsonified, 201


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
