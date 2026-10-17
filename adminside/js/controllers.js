/* ============================================================
   PingXiang Charity — Admin page controllers
   ============================================================ */

/* "2026-11-15 08:00:00"  ->  "2026-11-15T08:00" (datetime-local input) */
function toLocalInput(dateStr) {
  if (!dateStr) return '';
  var parts = String(dateStr).split(' ');
  var date = parts[0] || '';
  var time = (parts[1] || '00:00:00').slice(0, 5);
  return date + 'T' + time;
}

/* "2026-11-15T08:00"  ->  "2026-11-15 08:00:00" (MySQL DATETIME) */
function toDbDateTime(localValue) {
  if (!localValue) return '';
  if (localValue instanceof Date) {
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return localValue.getFullYear() + '-' + p(localValue.getMonth() + 1) + '-' + p(localValue.getDate()) +
      ' ' + p(localValue.getHours()) + ':' + p(localValue.getMinutes()) + ':00';
  }
  return String(localValue).replace('T', ' ') + ':00';
}

function adminEventIdFromLocation() {
  var query = new URLSearchParams(window.location.search);
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return query.get('id') || hash.get('id');
}

angular.module('adminApp')

  /* ---------- Dashboard / list ---------- */
  .controller('ListController', ['$scope', '$window', 'ApiService', 'AdminAuth', function ($scope, $window, ApiService, AdminAuth) {
    if (!AdminAuth.isAdmin()) { $window.location.href = 'login.html'; return; }
    $scope.loading = true;
    $scope.error = '';
    $scope.success = '';
    $scope.events = [];
    $scope.deletingId = null;

    ApiService.getEvents({ all: true })
      .then(function (events) { $scope.events = events; })
      .catch(function () { $scope.error = 'Could not load events.'; })
      .finally(function () { $scope.loading = false; });

    $scope.remove = function (event) {
      if (!window.confirm('Delete "' + event.event_name + '"?')) return;
      $scope.deletingId = event.event_id;
      $scope.error = '';
      $scope.success = '';

      ApiService.deleteEvent(event.event_id)
        .then(function () {
          $scope.events = $scope.events.filter(function (e) {
            return e.event_id !== event.event_id;
          });
          $scope.success = 'Event deleted.';
        })
        .catch(function (err) {
          $scope.error = err.message;
        })
        .finally(function () {
          $scope.deletingId = null;
        });
    };
  }])

  /* ---------- Create ---------- */
  .controller('CreateController', ['$scope', '$window', 'ApiService', 'AdminAuth', function ($scope, $window, ApiService, AdminAuth) {
    if (!AdminAuth.isAdmin()) { $window.location.href = 'login.html'; return; }
    $scope.categories = [];
    $scope.organisations = [];
    $scope.form = {
      event_name: '', description: '', event_date: '', location: '',
      ticket_price: 0, goal_amount: 0, raised_amount: 0, image_url: '',
      is_suspended: false, org_id: '', category_id: ''
    };
    $scope.submitting = false;
    $scope.error = '';

    ApiService.getCategories()
      .then(function (cats) { $scope.categories = cats; })
      .catch(function () { $scope.error = 'Could not load categories.'; });

    ApiService.getOrganisations()
      .then(function (orgs) { $scope.organisations = orgs; })
      .catch(function () { $scope.error = 'Could not load organisations.'; });

    $scope.submit = function () {
      $scope.error = '';

      var required = {
        'event name': $scope.form.event_name,
        'date': $scope.form.event_date,
        'location': $scope.form.location,
        'organisation': $scope.form.org_id,
        'category': $scope.form.category_id
      };
      var missing = Object.keys(required).filter(function (k) { return !required[k]; });
      if (missing.length > 0) {
        $scope.error = 'Please fill in: ' + missing.join(', ') + '.';
        return;
      }

      $scope.submitting = true;
      ApiService.createEvent({
        event_name: $scope.form.event_name,
        description: $scope.form.description || null,
        event_date: toDbDateTime($scope.form.event_date),
        location: $scope.form.location,
        ticket_price: $scope.form.ticket_price,
        goal_amount: $scope.form.goal_amount,
        raised_amount: $scope.form.raised_amount,
        image_url: $scope.form.image_url || null,
        is_suspended: !!$scope.form.is_suspended,
        org_id: $scope.form.org_id,
        category_id: $scope.form.category_id
      })
        .then(function () {
          $window.location.href = 'index.html';
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.submitting = false;
        });
    };
  }])

  /* ---------- Edit ---------- */
  .controller('EditController', ['$scope', '$window', 'ApiService', 'AdminAuth', function ($scope, $window, ApiService, AdminAuth) {
    if (!AdminAuth.isAdmin()) { $window.location.href = 'login.html'; return; }
    $scope.categories = [];
    $scope.organisations = [];
    $scope.form = {
      event_name: '', description: '', event_date: '', location: '',
      ticket_price: 0, goal_amount: 0, raised_amount: 0, image_url: '',
      is_suspended: false, org_id: '', category_id: ''
    };
    $scope.event = null;
    $scope.registrations = [];
    $scope.totalTickets = 0;
    $scope.loading = true;
    $scope.loadError = '';
    $scope.saving = false;
    $scope.error = '';

    var id = adminEventIdFromLocation();
    $scope.eventId = id;

    if (!id || !/^\d+$/.test(id)) {
      $scope.loading = false;
      $scope.loadError = 'Invalid event id.';
    } else {
      ApiService.getCategories()
        .then(function (cats) { $scope.categories = cats; })
        .catch(function () {});

      ApiService.getOrganisations()
        .then(function (orgs) { $scope.organisations = orgs; })
        .catch(function () {});

      ApiService.getEvent(id)
        .then(function (data) {
          var e = data.event;
          $scope.event = e;
          $scope.registrations = data.registrations;
          $scope.totalTickets = data.totalTickets;

          $scope.form = {
            event_name: e.event_name,
            description: e.description || '',
            event_date: toLocalInput(e.event_date),
            location: e.location,
            ticket_price: Number(e.ticket_price),
            goal_amount: Number(e.goal_amount),
            raised_amount: Number(e.raised_amount),
            image_url: e.image_url || '',
            is_suspended: !!Number(e.is_suspended),
            org_id: e.org_id,
            category_id: e.category_id
          };
        })
        .catch(function (err) {
          $scope.loadError = 'Could not load the event: ' + err.message;
        })
        .finally(function () {
          $scope.loading = false;
        });
    }

    $scope.submit = function () {
      $scope.error = '';

      var required = {
        'event name': $scope.form.event_name,
        'date': $scope.form.event_date,
        'location': $scope.form.location,
        'organisation': $scope.form.org_id,
        'category': $scope.form.category_id
      };
      var missing = Object.keys(required).filter(function (k) { return !required[k]; });
      if (missing.length > 0) {
        $scope.error = 'Please fill in: ' + missing.join(', ') + '.';
        return;
      }

      $scope.saving = true;
      ApiService.updateEvent(id, {
        event_name: $scope.form.event_name,
        description: $scope.form.description || null,
        event_date: toDbDateTime($scope.form.event_date),
        location: $scope.form.location,
        ticket_price: $scope.form.ticket_price,
        goal_amount: $scope.form.goal_amount,
        raised_amount: $scope.form.raised_amount,
        image_url: $scope.form.image_url || null,
        is_suspended: !!$scope.form.is_suspended,
        org_id: $scope.form.org_id,
        category_id: $scope.form.category_id
      })
        .then(function () {
          $window.location.href = 'index.html';
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.saving = false;
        });
    };
  }])

  /* ---------- Admin login ---------- */
  .controller('AdminLoginController', ['$scope', '$window', 'ApiService', 'AdminAuth', function ($scope, $window, ApiService, AdminAuth) {
    if (AdminAuth.isAdmin()) { $window.location.href = 'index.html'; return; }
    $scope.form = { email: '', password: '' };
    $scope.submitting = false;
    $scope.error = '';

    $scope.submit = function () {
      $scope.error = '';
      var email = ($scope.form.email || '').trim();
      var password = $scope.form.password || '';
      if (!email || !password) { $scope.error = 'Please enter your email and password.'; return; }

      $scope.submitting = true;
      ApiService.login({ email: email, password: password })
        .then(function (user) {
          if (!user.is_admin) {
            $scope.error = 'This account is not an administrator.';
            $scope.submitting = false;
            return;
          }
          AdminAuth.setUser(user);
          $window.location.href = 'index.html';
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.submitting = false;
        });
    };
  }])

  /* ---------- Admin nav / logout ---------- */
  .controller('AdminNavController', ['$scope', '$window', 'AdminAuth', function ($scope, $window, AdminAuth) {
    $scope.admin = AdminAuth.getUser();
    $scope.logout = function () {
      AdminAuth.clearUser();
      $window.location.href = 'login.html';
    };
  }]);
