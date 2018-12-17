const express = require('express');
const db = require('../database/todo-items');

module.exports = function(conn) {
  async function getTodoItems(req, res) {
    try {
      const { listId } = req.query;
      const lists = await db.getTodoItems(conn, +listId);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function addTodoItem(req, res) {
    try {
      const { listId } = req.query;
      const { description } = req.body;
      const lists = await db.createTodoItem(conn, description, +listId);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function updateTodoItem(req, res) {
    try {
      const { listId } = req.query;
      const { description, id } = req.body;
      const lists = await db.updateTodoItem(conn, description, +id, +listId);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function deleteTodoItem(req, res) {
    try {
      const { id } = req.param;
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
    .post('/', addTodoItem)
    .delete('/:id', deleteTodoItem);

  return router;
};
