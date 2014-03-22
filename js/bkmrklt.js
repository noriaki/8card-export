jQuery(function($) {
  var uri = 'https://github.com/noriaki/8card-export/raw/0.1.0/export8card.js';
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
