/* ============================================================
   PingXiang Charity — Admin AngularJS app
   ============================================================ */
angular.module('adminApp', [])

  .constant('API_BASE',
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api'
      : '/api'
  )

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
