const util = require('util');
const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const stat = util.promisify(fs.stat);

const MyConnection = require('./database/MyConnection.js');
const seedDb = require('./database/seed-db');
const todoListsRouter = require('./routes/todo-lists');
const todoItemsRouter = require('./routes/todo-items');

const PORT = 3000;

const CONNECTION_CONFIG = {
  host: 'localhost',
  user: 'hyfuser',
  password: 'hyfpassword',
  database: 'todo',
  timezone: 'utc',
};

(async () => {
  const folderName = `client-${process.argv[2] || 'oop'}`;
  const staticPath = path.join(__dirname, `../${folderName}`);
  const stats = stat(staticPath);
  if (!stats.isDirectory) {
    console.error(`Cannot serve a client from non-existing folder: ${folderName}`);
  }

  const conn = new MyConnection(CONNECTION_CONFIG);

  await seedDb(conn);

  const app = express();
  app.use(morgan('dev'));
  app.use(express.json());

  app.use('/lists', todoListsRouter(conn));
  app.use('/todos', todoItemsRouter(conn));

  app.use(express.static(staticPath));

  app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}, using client from folder ${folderName}.`);
  });
})();
