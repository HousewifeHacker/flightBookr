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
    urlRoot: 'flight/book'
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
	this.trigger("book:flight", this.model);
    }
});


BookingFormView = Backbone.Marionette.CompositeView.extend({    
    id: 'booking-form',
    template: 'booking-form-template',
    childView: FlightItemView,
    childViewContainer: "#flights-menu",
    childEvents: {
	'book:flight': 'booked'
    },

    onRender: function() {
	this.validator = this.$('form').parsley();
    },

    booked: function(view, model) {
	this.$('#flight_number').val(model.get('number'));
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
		FlightApp.errorRegion.empty();
		FlightApp.mainRegion.show(view);
	    },
	    error: function() {
		var view = new ErrorView();
		FlightApp.errorRegion.show(view);
		that.collection.remove(model);
	    }
	});
    }

});

BookedSuccessView = Backbone.Marionette.ItemView.extend({
    initialize: function(options) {
	confirmation = options.confirmation;
	console.log("CONFIRMATION", confirmation);
    },
    template: "confirm-booking-template"
});

MyRouter = Backbone.Marionette.AppRouter.extend({
    routes: {
	'': 'form'
    },

    form: function() {
	var flights = new Flights();
	flights.fetch();
	var view = new BookingFormView({
	    collection: flights
	});
	FlightApp.mainRegion.show(view);
    }
});

FlightApp.addInitializer(function() {
    new MyRouter();
    Backbone.history.start();
});

$(document).ready(function(){
    FlightApp.start();
});
