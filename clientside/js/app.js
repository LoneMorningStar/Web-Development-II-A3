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
  .factory('ApiService', ['$http', 'API_BASE', function ($http, API_BASE) {
    function call(config) {
      return $http(config).then(
        function (res) { return res.data.data; },
        function (res) {
          var msg = (res.data && res.data.message) || ('Request failed (' + res.status + ')');
          throw new Error(msg);
        }
      );
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
        return call({ method: 'POST', url: API_BASE + '/events', data: body });
      },
      updateEvent: function (id, body) {
        return call({ method: 'PUT', url: API_BASE + '/events/' + id, data: body });
      },
      deleteEvent: function (id) {
        return call({ method: 'DELETE', url: API_BASE + '/events/' + id });
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
