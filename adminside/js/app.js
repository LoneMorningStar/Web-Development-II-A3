/* ============================================================
   PingXiang Charity — Admin AngularJS app
   ============================================================ */
angular.module('adminApp', [])

  .constant('API_BASE',
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api'
      : '/api'
  )

  .factory('ApiService', ['$http', 'API_BASE', 'AdminAuth', function ($http, API_BASE, AdminAuth) {
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
      var u = AdminAuth.getUser();
      return (u && u.user_id) ? { 'X-Admin-User': String(u.user_id) } : {};
    }

    return {
      getEvents: function (params) {
        return call({ method: 'GET', url: API_BASE + '/events', params: params });
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
      login: function (body) {
        return call({ method: 'POST', url: API_BASE + '/users/login', data: body });
      },
      createEvent: function (body) {
        return call({ method: 'POST', url: API_BASE + '/events', data: body, headers: adminHeaders() });
      },
      updateEvent: function (id, body) {
        return call({ method: 'PUT', url: API_BASE + '/events/' + id, data: body, headers: adminHeaders() });
      },
      deleteEvent: function (id) {
        return call({ method: 'DELETE', url: API_BASE + '/events/' + id, headers: adminHeaders() });
      }
    };
  }])

  /* ---------- Admin auth: admin user kept in localStorage ---------- */
  .factory('AdminAuth', ['$window', function ($window) {
    var KEY = 'charity_admin';
    return {
      getUser: function () {
        try { return JSON.parse($window.localStorage.getItem(KEY)) || null; } catch (e) { return null; }
      },
      setUser: function (u) { $window.localStorage.setItem(KEY, JSON.stringify(u)); },
      clearUser: function () { $window.localStorage.removeItem(KEY); },
      isAdmin: function () {
        var u = this.getUser();
        return !!(u && u.is_admin);
      }
    };
  }])

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

  .filter('statusLabel', function () {
    return function (status) {
      if (status === 'suspended') return 'Suspended';
      if (status === 'past') return 'Past';
      return 'Upcoming';
    };
  })

  .filter('money', function () {
    return function (n) {
      return '$' + Number(n || 0).toFixed(2);
    };
  });
