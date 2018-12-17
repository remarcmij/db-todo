function getTodoItems(conn, listId) {
  return conn.execQuery('SELECT * FROM todo_items WHERE list_id=?', listId);
}

async function createTodoItem(conn, description, listId) {
  await conn.execQuery('INSERT INTO todo_items (description, list_id) VALUES(?,?)', [
    description,
    listId,
  ]);
  return getTodoItems(conn, listId);
}

async function updateTodoItem(conn, description, id, listId) {
  await conn.execQuery('UPDATE todo_items SET description=? WHERE id=?', [description, id]);
  return getTodoItems(conn, listId);
}

async function deleteTodoItem(conn, id, listId) {
  await conn.execQuery('DELETE FROM todo_items WHERE id=?', [id]);
  return getTodoItems(conn, listId);
}

module.exports = {
  getTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
};
