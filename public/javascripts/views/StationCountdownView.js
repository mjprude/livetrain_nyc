var StationCountdownView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#station-countdown-template').html() ),
	initialize: function(){
		this.listenTo( this.model, 'change', this.render );
	},
	render: function(){
		this.$el.empty();
		this.$el.html( this.template({stationCountdown: this.model.toJSON() }));
		return this;
	}
})