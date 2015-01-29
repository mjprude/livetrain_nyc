var TrainInfoView = Backbone.View.extend({
  tagName: 'div',
  template: _.template($('#train-info-template').html() ),
  initialize: function(){
    this.listenTo( this.model, 'change', this.render );
  },
  render: function(){
    this.$el.empty();
    this.$el.html( this.template({trainInfo: this.model.toJSON() }));
    d3.select('#train-destination').text(trainInfo.toJSON().destination.toUpperCase());
    return this;
  }
})