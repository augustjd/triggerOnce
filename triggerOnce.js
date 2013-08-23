(function() {
  window.Onces = {};

  function Once(period, action, doDefer) {
    var triggered = false; // has action() been called?
    var responded = false; // has the reset timer been started?
    var defer     = false; // if true, then action will be called upon reset.

    this.doDefer = doDefer; // if true, then defer will be set to true when
                            // trigger is called after trigger has already been called

    this.lastCalled = new Date();

    this.period = period;
    this.action = action;

    this.trigger = function() {
      if (!triggered) {
        this.lastCalled = new Date();
        this.action();
        triggered = true;
      } else if(this.doDefer) {
        defer = true;
      }

      if (!responded) {
        var once = this;
        setTimeout(function() { once.reset() }, this.period);
        responded = true;
      }
    }

    this.reset = function() {
      if (defer) {
        var msSinceLastCall = new Date() - this.lastCalled;
        if (msSinceLastCall > this.period) {
          this.action(); 
        } else {
          var action = this.action;
          setTimeout(function() { action(); }, this.period - msSinceLastCall);
        }
      }

      triggered = false;
      responded = false;

      defer = false;
    }

    this.ready = function() { return !triggered; }
  }
  

  // Attaches to jQuery if defined, otherwise
  // to the window object
  if (jQuery !== undefined) {
    var attach = jQuery;
  } else {
    var attach = window;
  }

  attach.triggerOnce = function(period, action, id, suppress, doDefer) {
    if (arguments.length == 1) {
      // then assume that this is being called
      // with the alternate signature $.triggerOnce(id)
      id = period;
    }

    if (Onces[id] === undefined) {
      Onces[id] = new Once(period, action, doDefer);    
    }

    if (!suppress) {
      Onces[id].trigger();
    }
  }
})();
