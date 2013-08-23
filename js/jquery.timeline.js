(function() {
  $.fn.timeline = function(options) {

    function TimelineEvent(category, label, color) {
      this.category = category;
      this.label    = label;
      this.color    = color;

      var time = new Date();
      this.getTime = function() { return time; }
      this.since = function(sinceTime) { 
        sinceTime = (sinceTime === undefined) ? new Date() : sinceTime;
        return (sinceTime - time);
      }
    }

    function TimelineEventControl(timelineEvent) {
      return $('<div class="timeline timeline-event" />').data('timeline-event', timelineEvent).text(timelineEvent.getTime().toLocaleTimeString()).css('background-color', timelineEvent.color || 'red');
    }

    $(this).each(function() {
      var $this = $(this);

      defaultOptions = {
        interval: 100,
        period: false,
        deleteAfterOutOfView: true
      }

      options = $.extend(defaultOptions, options);

      $this.css('position', 'relative');
      $this.data('timeline', {
        options: options,
        events: {},
        eventControls: [],
        start: new Date(),
        startLabel: $('<span class="timeline timeline-start" />'),
        endLabel: $('<span class="timeline timeline-end" />'),
      });

      $this.on('addEvent', function(event, options) {
        var category = options.category;
        var label = options.label;
        var color = options.color;

        if ($this.data('timeline').events[category] === undefined) {
          $this.data('timeline').events[category] = [];
        }

        var newEvent = new TimelineEvent(category, label, color);

        $this.data('timeline').events[category].push(newEvent);

        var newControl = new TimelineEventControl(newEvent);
        $this.data('timeline').eventControls.push(newControl);
        $this.append(newControl);
      });

      $this.on('removeEvent', function(event, options) {
        $this.data('timeline').eventControls.remove(options.control);
        $this.data('timeline').events[options.event.category].remove(options.event); 
      });

      // refreshes the display
      $this.refresh = function() {
        var $controls = $this.data('timeline').eventControls;
        var end = new Date();

        if ($this.data('timeline').period) {
          $this.data('timeline').start = new Date(end - $this.data('timeline').period);
        }

        var totalDisplayMs = (end - $this.data('timeline').start);
        var width = $this.width();

        for(var i in $controls) {
          $control = $controls[i];
          timelineEvent = $control.data('timeline-event');
          var new_left = width - (timelineEvent.since(end) / totalDisplayMs) * width;
          if ($this.data('timeline').options.deleteAfterOutOfView && new_left < 0) {
            $this.trigger('removeEvent', {control: $control, event: timelineEvent});
          } else {
            $control.css('left', new_left);
          }
        }

        $this.data('timeline').startLabel.text($this.data('timeline').start.toLocaleTimeString());
        $this.data('timeline').endLabel.text(end.toLocaleTimeString());
      }

      startLabel = $this.data('timeline').startLabel;
      endLabel = $this.data('timeline').endLabel;

      $this.append(startLabel);
      $this.append(endLabel);

      startLabel.css('float', 'left');
      endLabel.css('float', 'right');

      window.setInterval(function() { $this.refresh(); }, $this.data('timeline').interval);
    });
  }
})();
