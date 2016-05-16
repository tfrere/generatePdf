import jQuery                   from 'jquery';
(($ => {
  const pluginName = 'drawsvg',
        defaults = {
          duration: 1000,
          stagger: 200,
          easing: 'swing',
          reverse: false,
          callback: $.noop
        },
        DrawSvg = ((() => {
          class fn {
            constructor(elm, options) {
              const _this = this, opts = $.extend(defaults, options);

              _this.$elm = $(elm);

              if ( !_this.$elm.is('svg') )
                return;

              _this.options = opts;
              _this.$paths = _this.$elm.find('path');

              _this.totalDuration = opts.duration + (opts.stagger * _this.$paths.length);
              _this.duration = opts.duration / _this.totalDuration;

              _this.$paths.each((index, elm) => {
                const pathLength = elm.getTotalLength();

                elm.pathLen = pathLength;
                elm.delay = (opts.stagger * index) / _this.totalDuration;
                elm.style.strokeDasharray = [pathLength, pathLength].join(' ');
                elm.style.strokeDashoffset = pathLength;
              });

              _this.$elm.attr(
                'class',
                (index, classNames) => [classNames, `${pluginName}-initialized`].join(' ')
              );
            }

            getVal(p, easing) {
              return 1 - $.easing[easing](p, p, 0, 1, 1);
            }

            progress(prog) {
              const _this = this, opts = _this.options, length = _this.$paths.length, duration = _this.duration, stagger = opts.stagger;

              _this.$paths.each((index, elm) => {
                const elmStyle = elm.style;

                if ( prog === 1 ) {
                  elmStyle.strokeDashoffset = 0;
                } else if ( prog === 0 ) {
                  elmStyle.strokeDashoffset = `${elm.pathLen}px`;
                } else if ( prog >= elm.delay && prog <= duration + elm.delay ) {
                  const p = ((prog - elm.delay) / duration);
                  elmStyle.strokeDashoffset = `${(_this.getVal(p, opts.easing) * elm.pathLen) * (opts.reverse ? -1 : 1)}px`;
                }
              });
            }

            animate() {
              const _this = this;

              _this.$elm.attr(
                'class',
                (index, classNames) => [classNames, `${pluginName}-animating`].join(' ')
              );

              $({ len: 0 }).animate({
                len: 1
              }, {
                easing: 'linear',
                duration: _this.totalDuration,
                step(now, fx) {
                  _this.progress.call(_this, now / fx.end);
                },
                complete() {
                  _this.options.callback.call(this);

                  _this.$elm.attr(
                    'class',
                    (index, classNames) => classNames.replace(`${pluginName}-animating`, '')
                  );
                }
              });
            }
          }

          return fn;
        }))();

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(method, args) {
    return this.each(function() {
      const data = $.data(this, pluginName);

      (data && `${method}` === method && data[method] ? data[method](args) : $.data(this, pluginName, new DrawSvg(this, method)));
    });
  };
})(jQuery));