// Get our templates from window.JST
old_renderer = Backbone.Marionette.Renderer.render;

Backbone.Marionette.Renderer.render = function(template, data) {
    // If we are providing an ID lets get the template from
    // the DOM
    if (template.indexOf('#') == 0) {
	result = old_renderer(template, data);
	return result;
    }

    if (template in JST) {
	return JST[template](data);
    } else {
	console.log("Could not find template " + template);
    }
};

FlightApp = new Backbone.Marionette.Application();

FlightApp.addRegions({
    mainRegion: '#content',
    errorRegion: '#error'
});

Flight = Backbone.Model.extend({
    idAttribute: "number",
    urlRoot: '/flights'
});

Flights = Backbone.Collection.extend({
    url: '/flights',
    model: Flight,

    parse: function(res) {
	return res.flights;
    }
});

Booking = Backbone.Model.extend({
    urlRoot: '/flight/book'
});

ErrorView = Backbone.Marionette.ItemView.extend({
    className: 'row',
    template: 'error-flight-booked'
});

FlightItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    className: 'flight-detail',
    template: 'flight-detail-template',
    events: {
	'click button': 'book'
    },

    book: function(e) {
	e.preventDefault();
	url = '/confirm/' + this.model.get('number');
	Backbone.history.navigate(url, {'trigger': true});
    }
});

FlightSelectionView = Backbone.Marionette.CompositeView.extend({
    template: 'flight-selection-template',
    childView: FlightItemView,
    childViewContainer: '#flights-menu'
});

BookingFormView = Backbone.Marionette.ItemView.extend({    
    id: 'booking-form',
    template: 'booking-form-template',

    initialize: function(options) {
	this.flightNumber = options.flightNumber;
    },

    events: {
	'submit': 'booked'
    },

    onRender: function() {
	var form = this.$('form');
	this.validator = form.parsley();
    },

    booked: function(e) {
	e.preventDefault();
	this.$('flight_number').val(this.FlightNumber);
	var data = Backbone.Syphon.serialize(this);

	if(this.validator.validate() == false) {
	    return;
	}
	
	data['bags'] = parseInt(data['bags']);
	var booking = new Booking(data);
	var that = this;

	booking.save({}, {
	    success: function() {
		var view = new BookedSuccessView({
		    confirmation: booking.get('confirmation')
		});
		FlightApp.mainRegion.show(view);
	    },
	    error: function() {
		var errorView = new ErrorView();
		FlightApp.errorRegion.show(errorView);
		Backbone.history.navigate('/', {'trigger': true});
	    }
	});
    }
});

BookedSuccessView = Backbone.Marionette.ItemView.extend({
    initialize: function(options) {
	confirmation = options.confirmation;
    },
    template: "confirm-booking-template"
});

MyRouter = Backbone.Marionette.AppRouter.extend({
    routes: {
	'': 'form',
	'confirm/:flight_number': 'confirm'
    },

    form: function() {
	var flights = new Flights();
	flights.fetch();
	var view = new FlightSelectionView({
	    collection: flights
	});
	FlightApp.mainRegion.show(view);
    },

    confirm: function(flight_number) {
	var formView = new BookingFormView({
	    'flightNumber': flight_number
	});

	FlightApp.errorRegion.empty();
	FlightApp.mainRegion.show(formView);
    }
});

FlightApp.addInitializer(function() {
    new MyRouter();
    Backbone.history.start({pushState: true});
});

$(document).ready(function(){
    FlightApp.start();
});
