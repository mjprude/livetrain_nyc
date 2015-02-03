var StationCountdownView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#station-countdown-template').html() ),
	initialize: function(){
		this.listenTo( this.model, 'change', this.render );
	},
	render: function(){
		var modelData = this.model.toJSON();
		this.$el.empty();
		this.$el.html( this.template({stationCountdown: modelData }));
		if (modelData.northbound.length > 0) {
			$('#northbound-countdown-trips').text("northbound");
		}
		if (modelData.southbound.length > 0) {
			$('#southbound-countdown-trips').text("southbound");
		}

		return this;
	}
})