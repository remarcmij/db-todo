function getTodoItems(conn, listId) {
  return conn.execQuery('SELECT * FROM todo_items WHERE list_id=?', listId);
}

async function createTodoItem(conn, todo, listId) {
  await conn.execQuery('INSERT INTO todo_items SET ?', todo);
  return getTodoItems(conn, listId);
}

async function updateTodoItem(conn, todo, listId) {
  await conn.execQuery('UPDATE todo_items SET ? WHERE id=?', [todo, todo.id]);
  return getTodoItems(conn, listId);
}

async function deleteTodoItem(conn, id, listId) {
  await conn.execQuery('DELETE FROM todo_items WHERE id=?', id);
  return getTodoItems(conn, listId);
}

module.exports = {
  getTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
};
