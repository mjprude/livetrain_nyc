var TrainInfoView = Backbone.View.extend({
  tagName: 'div',
  template: _.template($('#train-info-template').html()),
  initialize: function(){
    this.listenTo(this.model, 'change', this.render);
  },
  render: function (){
    var route = trainInfo.toJSON().route.replace('X', '').replace('GS', 'S');
    this.$el.empty();
    this.buildTrainInfo(this.model.toJSON());
    this.$el.html( this.template({trainInfo: this.model.toJSON() }));
    d3.select('#train-direction').text(trainInfo.toJSON().destination);
    d3.select('#train-info-icon').text(route).attr('class', function(){ return 'icon-' + route; });
    scrollToNextStop(this.model.toJSON());
    return this;
  },
  buildTrainInfo: function (data) {
      console.log('buildTrainInfo function works', data);
  }
});