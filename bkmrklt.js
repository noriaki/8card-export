jQuery(function($) {
    var uri = 'https://github.com/noriaki/8card-export/raw/master/export8card.js';
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
