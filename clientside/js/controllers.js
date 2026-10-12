/* ============================================================
   PingXiang Charity — page controllers (client side)
   ============================================================ */

/* Parse the event id from ?id= or #id= */
function eventIdFromLocation() {
  var query = new URLSearchParams(window.location.search);
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return query.get('id') || hash.get('id');
}

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
  return String(localValue).replace('T', ' ') + ':00';
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
    $scope.isAdmin = AuthService.isAdmin();
    $scope.logout = function () {
      AuthService.clearUser();
      $window.location.href = 'index.html';
    };
  }])

  /* ---------- Login (modal) ---------- */
  .controller('LoginController', ['$scope', '$window', '$timeout', 'ApiService', 'AuthService', function ($scope, $window, $timeout, ApiService, AuthService) {
    $scope.form = { email: '', password: '' };
    $scope.submitting = false;
    $scope.error = '';
    $scope.faceState = 'idle';
    $scope.passwordFocused = false;

    $scope.redirect = new URLSearchParams($window.location.hash.replace(/^#/, '')).get('redirect') || 'index.html';

    $scope.onPasswordFocus = function () {
      $scope.passwordFocused = true;
      $scope.faceState = 'closed';
    };
    $scope.onPasswordBlur = function () {
      $scope.passwordFocused = false;
      if ($scope.faceState === 'closed') $scope.faceState = 'idle';
    };

    $scope.close = function () {
      $window.location.href = 'index.html';
    };

    $scope.submit = function () {
      $scope.error = '';
      var email = ($scope.form.email || '').trim();
      var password = $scope.form.password || '';
      if (!email || !password) { $scope.error = 'Please enter your email and password.'; return; }

      $scope.submitting = true;
      ApiService.login({ email: email, password: password })
        .then(function (user) {
          AuthService.setUser(user);
          $scope.submitting = false;
          $scope.faceState = 'smile';
          $timeout(function () {
            $window.location.href = $scope.redirect;
          }, 1000);
        })
        .catch(function (err) {
          $scope.error = err.message;
          $scope.submitting = false;
          $scope.faceState = 'shake';
          $timeout(function () {
            if ($scope.faceState === 'shake') {
              $scope.faceState = $scope.passwordFocused ? 'closed' : 'idle';
            }
          }, 600);
        });
    };
  }])

  /* ---------- Sign up ---------- */
  .controller('SignupController', ['$scope', '$window', 'ApiService', 'AuthService', function ($scope, $window, ApiService, AuthService) {
    $scope.form = { full_name: '', email: '', phone: '', password: '', confirm_password: '' };
    $scope.submitting = false;
    $scope.error = '';

    $scope.submit = function () {
      $scope.error = '';
      var full_name = ($scope.form.full_name || '').trim();
      var email = ($scope.form.email || '').trim();
      var password = $scope.form.password || '';
      var confirm = $scope.form.confirm_password || '';
      var phone = ($scope.form.phone || '').trim();

      if (!full_name) { $scope.error = 'Please enter your full name.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $scope.error = 'Please enter a valid email address.'; return; }
      if (password.length < 6) { $scope.error = 'Password must be at least 6 characters.'; return; }
      if (confirm !== password) { $scope.error = 'Passwords do not match.'; return; }

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
  }])

  /* ---------- Admin: manage events (admin only) ---------- */
  .controller('AdminController', ['$scope', '$window', 'ApiService', 'AuthService', function ($scope, $window, ApiService, AuthService) {
    if (!AuthService.isAdmin()) { $window.location.href = 'index.html'; return; }
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
          $scope.events = $scope.events.filter(function (e) { return e.event_id !== event.event_id; });
          $scope.success = 'Event deleted.';
        })
        .catch(function (err) {
          $scope.error = err.message;
        })
        .finally(function () { $scope.deletingId = null; });
    };
  }])

  /* ---------- Admin: create / edit event (admin only) ---------- */
  .controller('EventFormController', ['$scope', '$window', 'ApiService', 'AuthService', function ($scope, $window, ApiService, AuthService) {
    if (!AuthService.isAdmin()) { $window.location.href = 'index.html'; return; }
    $scope.categories = [];
    $scope.organisations = [];
    $scope.isEdit = false;
    $scope.eventId = null;
    $scope.saving = false;
    $scope.loading = true;
    $scope.error = '';
    $scope.form = {
      event_name: '', description: '', event_date: '', location: '',
      ticket_price: 0, goal_amount: 0, raised_amount: 0, image_url: '',
      is_suspended: false, org_id: '', category_id: ''
    };
    $scope.uploading = false;

    $scope.pickImage = function () {
      var input = document.getElementById('event-image');
      if (input) input.click();
    };

    $scope.onFileChange = function (input) {
      var file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      $scope.uploading = true;
      $scope.error = '';
      $scope.$apply();
      ApiService.uploadImage(file)
        .then(function (res) { $scope.form.image_url = res.url; })
        .catch(function (err) { $scope.error = err.message; })
        .finally(function () { $scope.uploading = false; });
    };

    ApiService.getCategories()
      .then(function (cats) { $scope.categories = cats; })
      .catch(function () {});

    ApiService.getOrganisations()
      .then(function (orgs) { $scope.organisations = orgs; })
      .catch(function () {});

    var id = eventIdFromLocation();
    if (id && /^\d+$/.test(id)) {
      $scope.isEdit = true;
      $scope.eventId = id;
      ApiService.getEvent(id)
        .then(function (data) {
          var e = data.event;
          $scope.form = {
            event_name: e.event_name,
            description: e.description || '',
            event_date: toLocalInput(e.event_date),
            location: e.location,
            ticket_price: Number(e.ticket_price) || 0,
            goal_amount: Number(e.goal_amount) || 0,
            raised_amount: Number(e.raised_amount) || 0,
            image_url: e.image_url || '',
            is_suspended: !!Number(e.is_suspended),
            org_id: e.org_id,
            category_id: e.category_id
          };
        })
        .catch(function (err) { $scope.error = 'Could not load event: ' + err.message; })
        .finally(function () { $scope.loading = false; });
    } else {
      $scope.loading = false;
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

      var payload = {
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
      };

      $scope.saving = true;
      var req = $scope.isEdit
        ? ApiService.updateEvent($scope.eventId, payload)
        : ApiService.createEvent(payload);

      req.then(function () { $window.location.href = 'admin.html'; })
        .catch(function (err) { $scope.error = err.message; $scope.saving = false; });
    };
  }]);
