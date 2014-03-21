jQuery(function($) {
    var uri = 'https://github.com/noriaki/8card-export/raw/master/export8card.js';
    $.getScript(uri).then(function() {
        $.eight.init();
    });
});
