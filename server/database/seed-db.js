const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);

const CREATE_TODO_LISTS_TABLE = `
  CREATE TABLE IF NOT EXISTS todo_lists (
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  )`;

const CREATE_TODO_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS todo_items (
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    list_id INT(11) UNSIGNED NOT NULL,
    description VARCHAR(255) NOT NULL,
    done ENUM('y','n') NOT NULL DEFAULT 'n',
    due_date DATE DEFAULT NULL,
    PRIMARY KEY (id),
    KEY list_id (list_id),
    CONSTRAINT todo_items_fk FOREIGN KEY (list_id) REFERENCES todo_lists (id)
  )`;

async function seedDb(conn) {
  try {
    await conn.execQuery(CREATE_TODO_LISTS_TABLE);
    await conn.execQuery(CREATE_TODO_ITEMS_TABLE);

    const [listResult] = await conn.execQuery('SELECT COUNT(*) as num FROM todo_lists');
    if (listResult.num === 0) {
      const data = await readFile(__dirname + '/seed.json', 'utf8');
      const seeds = JSON.parse(data);

      const todoLists = seeds.map(seed => seed.list);
      const uniqueTodoLists = new Set(todoLists);

      uniqueTodoLists.forEach(async todoList => {
        const result = await conn.execQuery(
          'INSERT INTO todo_lists (description) VALUES(?)',
          todoList,
        );
        seeds
          .filter(seed => seed.list === todoList)
          .map(todo => ({
            description: todo.description,
            due_date: todo.due_date,
            done: todo.done,
            list_id: result.insertId,
          }))
          .forEach(async todo => {
            await conn.execQuery('INSERT INTO todo_items SET ?', todo);
          });
      });
    }
  } catch (error) {
    console.error(`There was an error seeding the database: ${error.message}`);
  }
}

module.exports = seedDb;
