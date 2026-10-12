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
  });
