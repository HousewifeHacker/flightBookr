Create a static HTML page that contacts a RESTful interface to display
a list of airline flights, allows the user to select one and enter
passenger data, submits that data back to the RESTful interface, and
displays confirmation data.  Everything should occur on one page; there
should be no page loads after the first.

This project includes a Python2.7 file that implements a Flask app which
provides a REST interface and a JSON file containing information about
available flights.

When run, the app is served at localhost on port 5000.  Instructions for
setting up the development environment and running the Flask app are in
the docstring.  The file should be edited to have the following endpoints:

GET / - returns HTML for the base page.

GET /flights - returns JSON in the form:

    {
        "flights": [
            {
                "number": "AA1234", "airline": "Awesome Airlines",
                "departs": {
                    "airport": "SFO", "when": "2015-01-01T12:00:00"
                }, "arrives": {
                    "airport": "IAH", "when": "2014-01-01T19:00:00"
                }, "cost": 567.89
            }, # ...
        ]
    }

POST /flight/book - accepts form data:

    firstname=John, lastname=Doe, flight_number=AA1234, bags=2

and responds:

    { "success": true, "confirmation": "ZHJ2F8" }

or

    { "success": false, "message": "This flight is full." }

Other endpoints are allowed but not required.

All times are in UTC.  All costs are in US dollars.

You are responsible for the workflow and design.  Styling and decoration
can either be entirely custom, or be modifications of a stock theme
like Bootstrap.

You will be submitting a ZIP containing HTML, JS, CSS, and additional
resources (images, etc.).  You may (and probably should!) use third
party HTML templating systems such as Jade or Genshi, JS libraries and
transpilers such as jQuery and CoffeeScript, and CSS/JS frameworks such
as Foundation or Bootstrap.  If you do use these tools, also include
the sources (*.jade, *.coffee, etc.) with your submission.  Feel free
to use CDN content if desired.
