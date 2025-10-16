const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const usersRoutes = require('../routes/api/v1/users');
app.use('/api/v1/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

//Only start the server if not running under Jest
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

module.exports = app;
