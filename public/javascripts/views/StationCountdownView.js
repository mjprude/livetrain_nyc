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
		var that = this;
		if (modelData.northbound.length > 0) {
			$(modelData.northbound).each(function(idx, stop){
				var modelView = new StationCountdownModelView({
					model: new StationCountdownModel(this)
				});
				$('#northbound-countdown-trips').append(modelView.render().$el);
			})
		}
		if (modelData.southbound.length > 0) {
			$(modelData.southbound).each(function(idx, stop){
				var modelView = new StationCountdownModelView({
					model: new StationCountdownModel(this)
				});
				$('#southbound-countdown-trips').append(modelView.render().$el);
			})
		}

		return this;
	}
})