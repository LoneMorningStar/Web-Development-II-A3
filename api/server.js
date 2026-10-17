const express = require('express');
const cors = require('cors');
require('./event_db');

const app = express();

app.use(cors());
app.use(express.json());

// Never let the browser cache API responses, so the home page always shows
// the latest events after an admin adds/edits/deletes one.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/api/events',        require('./routes/events'));
app.use('/api/categories',    require('./routes/categories'));
app.use('/api/organisations', require('./routes/organisations'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/users',         require('./routes/users'));
app.use('/api',               require('./routes/upload'));

app.get('/', (req, res) => res.send('Charity Events API is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
