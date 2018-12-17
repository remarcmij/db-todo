function getTodoLists(conn) {
  return conn.execQuery('SELECT * FROM todo_lists ORDER BY description');
}

async function createTodoList(conn, description) {
  const [result] = await conn.execQuery(
    'SELECT COUNT(*) as num FROM todo_lists WHERE description = ?',
    [description],
  );

  if (result.num === 0) {
    await conn.execQuery('INSERT INTO todo_lists (description) VALUES(?)', [description]);
  }

  return getTodoLists(conn);
}

async function updateTodoList(conn, description, listId) {
  await conn.execQuery('UPDATE todo_lists SET description=? WHERE id=?', [description, listId]);
  return getTodoLists(conn);
}

async function deleteTodoList(conn, listId) {
  await conn.execQuery('DELETE FROM todo_lists WHERE id=?', [listId]);
  return getTodoLists(conn);
}

module.exports = {
  getTodoLists,
  createTodoList,
  updateTodoList,
  deleteTodoList,
};
