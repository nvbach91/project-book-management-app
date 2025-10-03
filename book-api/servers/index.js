const express = require('express');
const app = express();
const port = 3000;

const usersRoutes = require('../routes/users');
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
