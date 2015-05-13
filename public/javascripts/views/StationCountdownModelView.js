var StationCountdownModelView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#station-countdown-model-template').html() ),
  render: function(){
    var modelData = this.model.toJSON();
    this.$el.data( modelData );
    this.$el.html( this.template({ stop: modelData }));
    this.$el.on('click', function(){
      fetchTrainInfo({trip_id: modelData.trip_id});
    });
    return this;
  }
})