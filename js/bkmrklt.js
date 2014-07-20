jQuery(function($) {
  var uri = 'https://rawgithub.com/noriaki/8card-export/0.1.2/js/export8card.js';
  var deferred = $.Deferred();
  deferred
    .then(function() {
      return $.getScript(uri);
    })
    .then(function() {
      $.eight.init();
    });
  deferred.resolve();
});
