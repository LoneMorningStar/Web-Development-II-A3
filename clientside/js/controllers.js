/* ============================================================
   PingXiang Charity — page controllers (client side)
   ============================================================ */

/* Parse the event id from ?id= or #id= */
function eventIdFromLocation() {
  var query = new URLSearchParams(window.location.search);
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return query.get('id') || hash.get('id');
}

angular.module('charityApp')

  /* ---------- Home ---------- */
  .controller('HomeController', ['$scope', 'ApiService', function ($scope, ApiService) {
    $scope.loading = true;
    $scope.error = '';
    $scope.events = [];

    function load() {
      $scope.loading = true;
      $scope.error = '';
      ApiService.getEvents()
        .then(function (events) {
          $scope.events = events;
        })
        .catch(function () {
          $scope.error = 'Could not load events. Please try again later.';
        })
        .finally(function () {
          $scope.loading = false;
        });
    }

    $scope.retry = load;
    load();
  }])

  /* ---------- Search ---------- */
  .controller('SearchController', ['$scope', 'ApiService', function ($scope, ApiService) {
    $scope.categories = [];
    $scope.filters = { date: '', location: '', category: '' };
    $scope.results = [];
    $scope.loading = false;
    $scope.error = '';
    $scope.searched = false;

    ApiService.getCategories()
      .then(function (cats) { $scope.categories = cats; })
      .catch(function () { $scope.error = 'Failed to load categories.'; });

    function isPastDate(dateStr) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(dateStr + 'T00:00:00') < today;
    }

    $scope.search = function () {
      $scope.error = '';

      var date = $scope.filters.date;
      var location = ($scope.filters.location || '').trim();
      var category = $scope.filters.category;

      if (date && isPastDate(date)) {
        $scope.error = 'Please pick today or a future date.';
        return;
      }
      if (!date && !location && !category) {
        $scope.error = 'Please select at least one filter.';
        return;
      }

      var params = {};
      if (date) params.date = date;
      if (location) params.location = location;
      if (category) params.category = category;

      $scope.loading = true;
      $scope.searched = true;
      ApiService.searchEvents(params)
        .then(function (events) { $scope.results = events; })
        .catch(function (err) { $scope.error = 'Search failed: ' + err.message; })
        .finally(function () { $scope.loading = false; });
    };

    $scope.clear = function () {
      $scope.filters = { date: '', location: '', category: '' };
      $scope.results = [];
      $scope.searched = false;
      $scope.error = '';
    };
  }])

  /* ---------- Event detail ---------- */
  .controller('EventController', ['$scope', 'ApiService', function ($scope, ApiService) {
    $scope.loading = true;
    $scope.error = '';
    $scope.notFound = false;
    $scope.event = null;
    $scope.registrations = [];
    $scope.totalTickets = 0;

    var id = eventIdFromLocation();

    if (!id || !/^\d+$/.test(id)) {
      $scope.loading = false;
      $scope.error = 'Invalid event id.';
      return;
    }

    ApiService.getEvent(id)
      .then(function (data) {
        $scope.event = data.event;
        $scope.registrations = data.registrations;
        $scope.totalTickets = data.totalTickets;
      })
      .catch(function (err) {
        if (String(err.message).indexOf('404') !== -1 || /not found/i.test(err.message)) {
          $scope.notFound = true;
        } else {
          $scope.error = 'Could not load this event. Please try again later.';
        }
      })
      .finally(function () {
        $scope.loading = false;
      });

    $scope.priceText = function (e) {
      return Number(e.ticket_price) > 0
        ? '$' + Number(e.ticket_price).toFixed(2) + ' per ticket'
        : 'Free entry';
    };
    $scope.progressPct = function (e) {
      return Number(e.goal_amount) > 0
        ? Math.min(100, (Number(e.raised_amount) / Number(e.goal_amount)) * 100).toFixed(1)
        : '0.0';
    };
    $scope.contactText = function (e) {
      return [e.contact_email, e.contact_phone].filter(Boolean).join(' · ');
    };
  }])

  /* ---------- Registration (requires login) ---------- */
  .controller('RegisterController', ['$scope', '$window', 'ApiService', 'AuthService', function ($scope, $window, ApiService, AuthService) {
    var id = eventIdFromLocation();
    $scope.eventId = id;

    var user = AuthService.getUser();
    if (!user) {
      $window.location.href = 'login.html#redirect=' + encodeURIComponent('register.html#id=' + (id || ''));
      return;
    }
    $scope.user = user;

    $scope.loading = true;
    $scope.event = null;
    $scope.loadError = '';
    $scope.form = { tickets: 1 };
    $scope.submitting = false;
    $scope.error = '';
    $scope.success = false;

    if (!id || !/^\d+$/.test(id)) {
      $scope.loading = false;
      $scope.loadError = 'Invalid event id.';
      return;
    }

    ApiService.getEvent(id)
      .then(function (data) { $scope.event = data.event; })
      .catch(function () { $scope.loadError = 'Could not load the event details.'; })
      .finally(function () { $scope.loading = false; });

    $scope.priceText = function (e) {
      return Number(e.ticket_price) > 0
        ? '$' + Number(e.ticket_price).toFixed(2) + ' per ticket'
        : 'Free entry';
    };

    $scope.submit = function () {
      $scope.error = '';

      var tickets = Number($scope.form.tickets);
      if (!tickets || tickets < 1) { $scope.error = 'Please choose at least 1 ticket.'; return; }

      $scope.submitting = true;
      ApiService.createRegistration({
        user_id: user.user_id,
        event_id: id,
        tickets: tickets
      })
        .then(function () {
          $scope.success = true;
          $scope.submitting = false;
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.submitting = false;
        });
    };
  }])

  /* ---------- Nav / auth state ---------- */
  .controller('NavController', ['$scope', '$window', 'AuthService', function ($scope, $window, AuthService) {
    $scope.user = AuthService.getUser();
    $scope.isLoggedIn = !!$scope.user;
    $scope.logout = function () {
      AuthService.clearUser();
      $window.location.href = 'index.html';
    };
  }])

  /* ---------- Login ---------- */
  .controller('LoginController', ['$scope', '$window', 'ApiService', 'AuthService', function ($scope, $window, ApiService, AuthService) {
    $scope.form = { email: '', password: '' };
    $scope.submitting = false;
    $scope.error = '';

    $scope.redirect = new URLSearchParams($window.location.hash.replace(/^#/, '')).get('redirect') || 'index.html';

    $scope.submit = function () {
      $scope.error = '';
      var email = ($scope.form.email || '').trim();
      var password = $scope.form.password || '';
      if (!email || !password) { $scope.error = 'Please enter your email and password.'; return; }

      $scope.submitting = true;
      ApiService.login({ email: email, password: password })
        .then(function (user) {
          AuthService.setUser(user);
          $window.location.href = $scope.redirect;
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.submitting = false;
        });
    };
  }])

  /* ---------- Sign up ---------- */
  .controller('SignupController', ['$scope', '$window', 'ApiService', 'AuthService', function ($scope, $window, ApiService, AuthService) {
    $scope.form = { full_name: '', email: '', phone: '', password: '' };
    $scope.submitting = false;
    $scope.error = '';

    $scope.submit = function () {
      $scope.error = '';
      var full_name = ($scope.form.full_name || '').trim();
      var email = ($scope.form.email || '').trim();
      var password = $scope.form.password || '';
      var phone = ($scope.form.phone || '').trim();

      if (!full_name) { $scope.error = 'Please enter your full name.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $scope.error = 'Please enter a valid email address.'; return; }
      if (password.length < 6) { $scope.error = 'Password must be at least 6 characters.'; return; }

      $scope.submitting = true;
      ApiService.register({ full_name: full_name, email: email, phone: phone || null, password: password })
        .then(function (user) {
          AuthService.setUser(user);
          $window.location.href = 'index.html';
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.submitting = false;
        });
    };
  }]);
