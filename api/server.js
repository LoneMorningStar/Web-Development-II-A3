const express = require('express');
const cors = require('cors');
require('./event_db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/events',        require('./routes/events'));
app.use('/api/categories',    require('./routes/categories'));
app.use('/api/organisations', require('./routes/organisations'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/users',         require('./routes/users'));
app.use('/api',               require('./routes/upload'));

app.get('/', (req, res) => res.send('Charity Events API is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
