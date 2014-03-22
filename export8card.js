;(function($) {
  $.extend($, {
    eight: (function() {
      var page = 1;
      var base_uri = 'https://8card.net/people/display_personal_cards.json?sort=5&per_page=50&page=';
      //var base_uri = 'https://8card.net/people/display_personal_cards.json?keyword=inc&sort=5&per_page=50&page=';
      var loading_gif_uri = 'https://github.com/noriaki/8card-export/raw/master/loading.gif';
      var ret = [];

      var card_params = [
        'full_name', 'full_name_reading', 'email', 'company_name', 'company_name_reading',
        'department', 'title', 'postal_code', 'address', 'url',
        'company_phone_number', 'direct_line_number', 'mobile_phone_number', 'company_fax_number'
      ];
      // todo: photo

      function Card(person) {
        var user = person.personal_cards[0].eight_card || person.personal_cards[0].friend_card;
        var self = this;
        $.each(['id', 'created_at', 'updated_at'], function(i, attr) { self[attr] = user[attr]; });
        $.each(card_params, function(i, card_attr) {
          if(user['front_'+card_attr] && user['front_'+card_attr] !== '') {
            self[card_attr] = user['front_'+card_attr];
          } else if(user['back_'+card_attr] && user['back_'+card_attr] !== '') {
            self[card_attr] = user['back_'+card_attr];
          } else {
            self[card_attr] = null;
          }
        });
      }
      $.extend(Card.prototype, {
        to_vcard: function() {
          var vcard = ['BEGIN:VCARD', 'VERSION:3.0'];
          vcard.push('N:'+(nnou(this.full_name) ? e(this.full_name) : '')+';;;;');
          vcard.push('FN:'+(nnou(this.full_name) ? e(this.full_name) : ''));
          vcard.push('X-PHONETIC-FIRST-NAME:');
          vcard.push('X-PHONETIC-LAST-NAME:'+(nnou(this.full_name_reading) ? e(this.full_name_reading) : ''));
          if(nnou(this.company_name)) {
            var org = 'ORG:'+e(this.company_name);
            if(nnou(this.department)) { org += ';' + e(this.department); }
            vcard.push(org);
          }
          if(nnou(this.title)) {
            vcard.push('TITLE:'+e(this.title));
          }
          if(nnou(this.company_phone_number)) {
            vcard.push('TEL;TYPE=WORK;TYPE=VOICE:'+this.company_phone_number);
          }
          if(nnou(this.direct_line_number)) {
            vcard.push('TEL;TYPE=MAIN;TYPE=VOICE:'+this.direct_line_number);
          }
          if(nnou(this.mobile_phone_number)) {
            vcard.push('TEL;TYPE=CELL;TYPE=VOICE:'+this.mobile_phone_number);
          }
          if(nnou(this.company_fax_number)) {
            vcard.push('TEL;TYPE=WORK;TYPE=FAX:'+this.company_fax_number);
          }
          if(nnou(this.url)) {
            vcard.push('item1.URL;TYPE=pref:'+this.url);
            vcard.push('item1.X-ABLABEL:_$!<HomePage>!$_');
          }
          if(nnou(this.email)) {
            vcard.push('EMAIL;TYPE=WORK;TYPE=INTERNET:'+this.email);
          }
          vcard.push('PRODID:-//Noriaki Uchiyama//vCards Converter for Eight//JA');
          vcard.push('REV:'+utc_datetime());
          vcard.push('END:VCARD');
          return vcard.join("\n");
        }
      });

      function init() {
        $('.full_text_search .btns_r')
          .append('<div class="btn_sort"><ul class="btns clearfix"><li><a href="javascript:void(0);" id="__eight_export" class="btn"><span>[全件DL(vCard.vcd)]</span></a></li></ul></div>');
        $('#__eight_export').one('click', perform);
      }
      function perform() {
        before_perform();
        retrieve(function() {
          before_display();
          display();
          after_display();
          after_perform();
        });
      }
      function retrieve(callback) {
        $.getJSON(base_uri + page)
          .done(function(data, status, xhr) {
            if(status === "success" && data.length !== 0) {
              $.each(data, function(i,month_data) {
                return $.each(month_data, function(month, cards) {
                  return $.each(cards, function(j, card) {
                    var c = card.person.personal_cards[0].eight_card ||
                      card.person.personal_cards[0].friend_card;
                    if(c.entry_status === 40) {
                      //console.log(card);
                      ret.push(new Card(card.person));
                    }
                  });
                });
              });
              page++;
              return retrieve(callback);
            } else if(status === "success" && data.length === 0) {
              return callback();
            }
          });
      }
      function display() {
        download($.map(ret/*.slice(0,99)*/, function(card, i) {
          return card.to_vcard();
        }).join("\n"));
        //$.each(ret, function(i, card) {  });
      }
      function download(text) {
        var blob = new Blob([text]);
        var filename = "8card-all.vcd";
        if(navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, filename);
        } else {
          var a = $('<a>').attr({
            href: URL.createObjectURL(blob), download: filename
          }).text(filename)[0];
          var event = document.createEvent('MouseEvents');
          event.initEvent('click', false, true);
          a.dispatchEvent(event);
        }
      }

      function utc_datetime(now) {
        now = now || new Date();
        return [
          now.getUTCFullYear(), '-',
          now.getUTCMonth(), '-',
          now.getUTCDate(), 'T',
          now.getUTCHours(), ':',
          now.getUTCMinutes(), ':',
          now.getUTCSeconds(), 'Z'
        ].join('');
      }
      function before_perform() {
        $('#__eight_export').addClass('disable')
          .find('span').text('loading cards...')
          .append($('<img>').attr({ src: loading_gif_uri }));
        //console.info('start');
      }
      function before_display() {
        $('#__eight_export span').text('converting to vcard...');
      }
      function after_display() {}
      function after_perform() {
        //console.info('end');
        $('#__eight_export span').text('done')
          .find('img').remove();
      }

      function e(str) {
        // escape [,:;] to prepending '\' in text value
        return str.replace(/[,:;]/g, "\\$&");
      }
      function nnou(v) {
        // return Not Null Or Undefined
        return !(v === null || v === undefined);
      }

      return { init: init };
    })()
  });
})(jQuery);
