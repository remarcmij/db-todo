const express = require('express');
const db = require('../database/todo-items');

module.exports = conn => {
  async function getTodoItems(req, res) {
    try {
      const { listId } = req.query;
      const lists = await db.getTodoItems(conn, +listId);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function createTodoItem(req, res) {
    try {
      const lists = await db.createTodoItem(conn, req.body);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function updateTodoItem(req, res) {
    try {
      const lists = await db.updateTodoItem(conn, req.body);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function deleteTodoItem(req, res) {
    try {
      const { id } = req.params;
      const { listId } = req.query;
      const lists = await db.deleteTodoItem(conn, +id, +listId);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  const router = express.Router();
  router
    .get('/', getTodoItems)
    .patch('/', updateTodoItem)
    .post('/', createTodoItem)
    .delete('/:id', deleteTodoItem);

  return router;
};
