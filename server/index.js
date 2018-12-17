const path = require('path');
const express = require('express');
const morgan = require('morgan');

const MyConnection = require('./database/MyConnection.js');
const seedDb = require('./database/seedDb');
const todoListsRouter = require('./routes/todo-lists');
const todoItemsRouter = require('./routes/todo-items');

const PORT = 3000;

const CONNECTION_CONFIG = {
  host: 'localhost',
  user: 'hyfuser',
  password: 'hyfpassword',
  database: 'todo',
};

(async () => {
  const conn = new MyConnection(CONNECTION_CONFIG);

  await seedDb(conn);

  const app = express();
  app.use(morgan('dev'));
  app.use(express.json());

  app.use('/lists', todoListsRouter(conn));
  app.use('/items', todoItemsRouter(conn));

  app.use(express.static(path.join(__dirname, '../client')));

  app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
  });
})();
