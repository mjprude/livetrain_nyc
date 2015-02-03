var StationCountdownItemView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#station-countdown-item-template').html() ),
  render: function(){
    this.$el.data(this.model.toJSON());
    this.$el.html( this.template({ stop: this.model.toJSON() }));
    this.$el.on('click', findTrain);
    return this;
  }
})