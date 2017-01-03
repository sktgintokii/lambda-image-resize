'use strict';

;(function(window) {
  var LambdaPoc = {
    init: function() {
      console.log('init');
      var self = this;
      var $form = $('#image-upload-form');

      $form.on('submit', function(e) {
        e.preventDefault();
        self.submit($form);
      });
    },
    submit: function($form) {
      this.upload($form, function(res) {
        console.log(res);
      });
    },
    upload: function($form, onComplete) {
      var data = new FormData($form[0]);

      console.log($form, data);
      $.ajax({
        url: '/api/uploadImage',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
      }).done(onComplete);
    },
  };

  // bind LambdaPoc functions
  _.forEach([
    'init',
    'submit',
    'upload'
  ], function(funcName) {
    LambdaPoc[funcName] = _.bind(LambdaPoc[funcName], LambdaPoc);
  });

  window.LambdaPoc = LambdaPoc;
  LambdaPoc.init();
})(window);
