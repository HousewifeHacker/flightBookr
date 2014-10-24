import random
import json
from flask import (
    Flask,
    jsonify,
    redirect,
    request,
    url_for,
    render_template,
    g,
)
from jsonschema import validate

app = Flask(__name__)


class FlightService(object):
    '''Data access layer extracts data from internal API. This can be extended for external APIs in the future'''
    def __init__(self, filename):
        with open(filename) as f:
            self.flights = json.loads(f.read())['flights']

        # index the json for quick lookups
        self.flights_index = {}
        for index, flight in enumerate(self.flights):
            self.flights_index[flight['number']] = index

    def get(self, number):
        if number in self.flights_index:
            return self.flights[self.flights_index[number]]
        else:
            return {}

    def get_all(self):
        return self.flights

flight_service = FlightService('flights.json')


@app.route('/', methods=['GET'])
def root():
    '''Renders home page and initializes Backbone'''
    return render_template('index.html')


@app.route('/flights', methods=['GET'])
def flights():
    '''All flight info as JSON'''
    return jsonify({
        'flights': flight_service.get_all()
    })


@app.route('/flights/<number>', methods=['GET'])
def get_flight(number):
    flight = flight_service.get(number)
    return jsonify(flight)

book_schema = {
    'type': 'object',
    'properties': {
        'firstname': {
            'type': 'string',
            'minLength': 1
        },
        'lastname': {
            'type': 'string',
            'minLength': 1
        },
        'flight_number': {'type': 'string'},
        'bags': {'type': 'integer'},
    },
    'required': ['firstname', 'lastname']
}

@app.route('/flight/book', methods=['POST'])
def book_flight():
    '''API response to submitted flight booking form'''

    data = request.json
    result = validate(data, book_schema)
    confirmation = confirm_booking(data['flight_number'])

    if confirmation:
        res = jsonify({
            "success": True,
            "confirmation": confirmation
        })
    else:
        res = jsonify({
            "success": False,
            "message": "This flight is full."
        })
        res.status_code = 422
    return res


# For your convenience
def confirm_booking(_flight_num):
    '''Attempt to confirm a booking.

        :param _flight_num: Flight number that the customer is attempting to book.  This is not actually used.
        :type _flight_num: str
        :returns: Either a confirmation code (6 character string) or None if the flight is full.
        :rtype: str | None
    '''
    if random.random() < 0.5:
        # Flight is available, return confirmation code.
        return ''.join(random.choice('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(6))
    else:
        # Flight is unavailable.
        return None

if __name__ == '__main__':
    app.run(debug=True)
