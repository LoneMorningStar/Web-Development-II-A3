/* ============================================================
   PingXiang Charity — AngularJS app (client side)
   Shared module: API service, icon + reveal directives, filters.
   ============================================================ */
angular.module('charityApp', [])

  /* ---------- API base URL: relative on cPanel, localhost in dev ---------- */
  .constant('API_BASE',
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api'
      : '/api'
  )

  /* ---------- RESTful API service ---------- */
  .factory('ApiService', ['$http', 'API_BASE', 'AuthService', function ($http, API_BASE, AuthService) {
    function call(config) {
      // Disable the browser HTTP cache for every GET so the home page and
      // events page always reflect the latest admin add/edit/delete changes.
      if (!config.method || config.method.toUpperCase() === 'GET') {
        config.cache = false;
        // Hard cache-buster: make every GET URL unique so the browser can
        // never serve a stale response, regardless of Cache-Control headers.
        config.params = config.params || {};
        config.params._ts = Date.now();
      }
      return $http(config).then(
        function (res) { return res.data.data; },
        function (res) {
          var msg = (res.data && res.data.message) || ('Request failed (' + res.status + ')');
          throw new Error(msg);
        }
      );
    }

    function adminHeaders() {
      var u = AuthService.getUser();
      return (u && u.user_id) ? { 'X-Admin-User': String(u.user_id) } : {};
    }

    return {
      getEvents: function (params) {
        return call({ method: 'GET', url: API_BASE + '/events', params: params });
      },
      searchEvents: function (params) {
        return call({ method: 'GET', url: API_BASE + '/events/search', params: params });
      },
      getEvent: function (id) {
        return call({ method: 'GET', url: API_BASE + '/events/' + id });
      },
      getCategories: function () {
        return call({ method: 'GET', url: API_BASE + '/categories' });
      },
      getOrganisations: function () {
        return call({ method: 'GET', url: API_BASE + '/organisations' });
      },
      createEvent: function (body) {
        return call({ method: 'POST', url: API_BASE + '/events', data: body, headers: adminHeaders() });
      },
      updateEvent: function (id, body) {
        return call({ method: 'PUT', url: API_BASE + '/events/' + id, data: body, headers: adminHeaders() });
      },
      deleteEvent: function (id) {
        return call({ method: 'DELETE', url: API_BASE + '/events/' + id, headers: adminHeaders() });
      },
      uploadImage: function (file) {
        var fd = new FormData();
        fd.append('image', file);
        return $http({
          method: 'POST',
          url: API_BASE + '/upload',
          data: fd,
          headers: angular.extend({ 'Content-Type': undefined }, adminHeaders()),
          transformRequest: angular.identity
        }).then(
          function (res) { return res.data.data; },
          function (res) {
            var msg = (res.data && res.data.message) || ('Upload failed (' + res.status + ')');
            throw new Error(msg);
          }
        );
      },
      createRegistration: function (body) {
        return call({ method: 'POST', url: API_BASE + '/registrations', data: body });
      },
      register: function (body) {
        return call({ method: 'POST', url: API_BASE + '/users/register', data: body });
      },
      login: function (body) {
        return call({ method: 'POST', url: API_BASE + '/users/login', data: body });
      },
      getProfile: function (id) {
        return call({ method: 'GET', url: API_BASE + '/users/' + id });
      },
      updateProfile: function (id, body) {
        return call({ method: 'PUT', url: API_BASE + '/users/' + id, data: body });
      }
    };
  }])

  /* ---------- Auth: current user kept in localStorage ---------- */
  .factory('AuthService', ['$window', function ($window) {
    var KEY = 'charity_user';
    return {
      getUser: function () {
        try {
          return JSON.parse($window.localStorage.getItem(KEY)) || null;
        } catch (e) {
          return null;
        }
      },
      setUser: function (user) {
        $window.localStorage.setItem(KEY, JSON.stringify(user));
      },
      clearUser: function () {
        $window.localStorage.removeItem(KEY);
      },
      isLoggedIn: function () {
        return !!this.getUser();
      },
      isAdmin: function () {
        var u = this.getUser();
        return !!(u && u.is_admin);
      }
    };
  }])

  /* ---------- <ico name="calendar" size="16"></ico> ---------- */
  .directive('ico', function () {
    return {
      restrict: 'E',
      scope: { name: '@', size: '@' },
      link: function (scope, element) {
        var n = scope.name;
        var s = Number(scope.size) || 16;
        element.html(window.ICO && window.ICO[n] ? window.ICO[n](s) : '');
      }
    };
  })

  /* ---------- <login-face state="..."></login-face> ----------
     A minimal head (one circle + two dot eyes) that follows the mouse.
     state: 'idle' | 'closed' | 'shake' | 'smile' */
  .directive('loginFace', ['$window', function ($window) {
    return {
      restrict: 'E',
      scope: { state: '=' },
      template:
        '<div class="login-face" ng-class="{\'is-closed\': state === \'closed\', \'is-smile\': state === \'smile\', \'is-shake\': state === \'shake\'}">' +
          '<svg class="login-face__svg" viewBox="0 0 220 220" aria-hidden="true">' +
            '<g class="face-head-group">' +
              '<circle class="face-head" cx="110" cy="110" r="84"></circle>' +
            '</g>' +
            '<g class="face-eyes-group">' +
              '<circle class="eye eye-open" cx="80" cy="98" r="8"></circle>' +
              '<circle class="eye eye-open" cx="140" cy="98" r="8"></circle>' +
              '<path class="eye eye-closed" d="M68 100 L92 100"></path>' +
              '<path class="eye eye-closed" d="M128 100 L152 100"></path>' +
              '<path class="eye eye-smile" d="M66 106 Q80 88 94 106"></path>' +
              '<path class="eye eye-smile" d="M126 106 Q140 88 154 106"></path>' +
            '</g>' +
          '</svg>' +
        '</div>',
      link: function (scope, element) {
        var eyesGroup = element[0].querySelector('.face-eyes-group');
        var headGroup = element[0].querySelector('.face-head-group');

        function onMove(e) {
          var rect = element[0].getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = e.clientX - cx;
          var dy = e.clientY - cy;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          var max = 80;
          var ratio = Math.min(len, max) / max;
          var ex = (dx / len) * ratio * 9;
          var ey = (dy / len) * ratio * 9;
          var hx = (dx / len) * ratio * 4;
          var hy = (dy / len) * ratio * 4;
          if (eyesGroup) eyesGroup.setAttribute('transform', 'translate(' + ex.toFixed(2) + ' ' + ey.toFixed(2) + ')');
          if (headGroup) headGroup.setAttribute('transform', 'translate(' + hx.toFixed(2) + ' ' + hy.toFixed(2) + ')');
        }

        var handler = function (e) { onMove(e); };
        $window.addEventListener('mousemove', handler);

        element.on('$destroy', function () {
          $window.removeEventListener('mousemove', handler);
        });
      }
    };
  }])

  /* ---------- data-reveal scroll animation ---------- */
  .directive('reveal', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        if (!('IntersectionObserver' in window)) {
          element.addClass('in-view');
          return;
        }
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              element.addClass('in-view');
              io.unobserve(element[0]);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        io.observe(element[0]);
      }
    };
  })

  /* ---------- status label filter ---------- */
  .filter('statusLabel', function () {
    return function (status) {
      if (status === 'suspended') return 'Suspended';
      if (status === 'past') return 'Past';
      return 'Upcoming';
    };
  })

  /* ---------- money formatting filter ---------- */
  .filter('money', function () {
    return function (n) {
      return '$' + Number(n || 0).toFixed(2);
    };
  })

  /* ---------- Weather in the navbar (Open-Meteo, free, no API key) ---------- */
  .factory('WeatherService', ['$http', function ($http) {
    // Pingxiang City coordinates (Jiangxi, China).
    var LAT = 27.62, LON = 113.85;
    return {
      current: function () {
        return $http.get('https://api.open-meteo.com/v1/forecast', {
          cache: false,
          params: {
            latitude: LAT,
            longitude: LON,
            current: 'temperature_2m,relative_humidity_2m,weather_code',
            daily: 'temperature_2m_max,temperature_2m_min',
            forecast_days: 1,
            timezone: 'auto'
          }
        }).then(function (res) {
          return { now: res.data.current, today: res.data.daily };
        });
      }
    };
  }])

  .directive('weather', ['WeatherService', function (WeatherService) {
    function wsvg(paths) {
      return '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
    }

    var ICONS = {
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
      cloudSun: '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
      cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
      fog: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/>',
      rain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
      snow: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>',
      storm: '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>'
    };

    function describe(code) {
      if (code === 0) return { icon: 'sun', label: 'Clear sky' };
      if (code === 1 || code === 2) return { icon: 'cloudSun', label: 'Partly cloudy' };
      if (code === 3) return { icon: 'cloud', label: 'Overcast' };
      if (code === 45 || code === 48) return { icon: 'fog', label: 'Fog' };
      if (code >= 51 && code <= 57) return { icon: 'rain', label: 'Drizzle' };
      if (code >= 61 && code <= 67) return { icon: 'rain', label: 'Rain' };
      if (code >= 71 && code <= 77) return { icon: 'snow', label: 'Snow' };
      if (code >= 80 && code <= 82) return { icon: 'rain', label: 'Showers' };
      if (code === 85 || code === 86) return { icon: 'snow', label: 'Snow showers' };
      if (code >= 95) return { icon: 'storm', label: 'Thunderstorm' };
      return { icon: 'cloud', label: 'Weather unavailable' };
    }

    return {
      restrict: 'E',
      replace: true,
      template: '<span class="site-nav__weather"></span>',
      link: function (scope, element) {
        element.on('mouseenter', function () { element.addClass('tip-open'); });
        element.on('mouseleave', function () { element.removeClass('tip-open'); });
        WeatherService.current().then(function (w) {
          var c = w.now;
          var d = describe(c.weather_code);
          var temp = Math.round(c.temperature_2m);
          var hi = Math.round(w.today.temperature_2m_max[0]);
          var lo = Math.round(w.today.temperature_2m_min[0]);
          var hum = Math.round(c.relative_humidity_2m);
          element.html(
            wsvg(ICONS[d.icon]) +
            '<span class="site-nav__weather-temp">' + temp + '&deg;</span>' +
            '<span class="site-nav__weather-city">Pingxiang</span>' +
            '<span class="weather-tip" role="tooltip">' +
              '<span class="weather-tip__title">Pingxiang &middot; ' + d.label + '</span>' +
              '<span class="weather-tip__row"><span>Current</span><b>' + temp + '&deg;C</b></span>' +
              '<span class="weather-tip__row"><span>High / Low</span><b>' + hi + '&deg; / ' + lo + '&deg;</b></span>' +
              '<span class="weather-tip__row"><span>Humidity</span><b>' + hum + '%</b></span>' +
            '</span>'
          );
        });
      }
    };
  }]);
