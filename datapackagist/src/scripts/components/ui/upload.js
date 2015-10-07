require('fileapi');

var _ = require('underscore');
var backbone = require('backbone');
var backboneBase = require('backbone-base');
var dialogs = require('./dialog');
var validator = require('datapackage-validate');
var uploadTpl = require('./templates/upload-dialog.hbs');


// Upload datapackage
module.exports = dialogs.BaseModalView.extend({
  events: _.extend(_.clone(dialogs.BaseModalView.prototype.events), {
    'change [data-id=input]': function(E) {
      FileAPI.readAsText(FileAPI.getFiles(E.currentTarget)[0], (function (EV) {
        var descriptor;


        if(EV.type === 'load') {
          try {
            descriptor = JSON.parse(EV.result);
          }
          catch(E) { }

          // If descriptor is broken or If descriptor have field not from schema - reject it
          if(!_.isObject(descriptor) || _.difference(_.keys(descriptor), _.keys(this.parent.layout.form.schema.properties)).length) {
            window.APP.layout.notificationDialog
              .setMessage('JSON is invalid')
              .activate();

            return false;
          }

          // If there are no changes in current form just apply uploaded
          // data and leave
          if(!this.parent.hasChanges()) {
            this.updateApp(descriptor);
            return false;
          }

          // Ask to overwrite changes on current form
          window.APP.layout.confirmationDialog
            .setMessage('You have changes. Overwrite?')

            .setCallbacks({yes: (function() {
              this.updateApp(descriptor);
              return false;
            }).bind(this)})

            .activate();
        } else if( EV.type ==='progress' )
          this.setProgress(EV.loaded/EV.total * 100);
      }).bind(this));
    }
  }),

  render: function() { this.$el.html(this.template()); return this; },
  setMessage: function(message) { this.$('[data-id=message]').html(message); return this; },
  setProgress: function(percents) { return this; },
  template: uploadTpl
});
