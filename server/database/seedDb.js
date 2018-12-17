const CREATE_TODO_LISTS_TABLE = `
  CREATE TABLE IF NOT EXISTS todo_lists (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    description varchar(255) NOT NULL,
    PRIMARY KEY (id)
  )`;

const CREATE_TODO_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS todo_items (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    list_id int(11) unsigned NOT NULL,
    description varchar(255) NOT NULL,
    done enum('y','n') NOT NULL DEFAULT 'n',
    PRIMARY KEY (id),
    KEY list_id (list_id),
    CONSTRAINT todo_items_fk FOREIGN KEY (list_id) REFERENCES todo_lists (id)
  )`;

async function seedDb(conn) {
  await conn.execQuery(CREATE_TODO_LISTS_TABLE);
  const [result] = await conn.execQuery('SELECT COUNT(*) as num FROM todo_lists');
  if (result.num === 0) {
    await conn.execQuery("INSERT INTO todo_lists (description) VALUES('Main todo list')");
  }
  await conn.execQuery(CREATE_TODO_ITEMS_TABLE);
}

module.exports = seedDb;
