const express = require('express');
const db = require('../database/todo-lists');

module.exports = conn => {
  async function getTodoLists(_, res) {
    try {
      const lists = await db.getTodoLists(conn);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function addTodoList(req, res) {
    try {
      const { description } = req.body;
      const lists = await db.createTodoList(conn, description);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function updateTodoList(req, res) {
    try {
      const { description, id } = req.body;
      const lists = await db.updateTodoList(conn, description, id);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async function deleteTodoList(req, res) {
    try {
      const { id } = req.params;
      const lists = await db.deleteTodoList(conn, +id);
      res.json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  const router = express.Router();
  router
    .get('/', getTodoLists)
    .patch('/', updateTodoList)
    .post('/', addTodoList)
    .delete('/:id', deleteTodoList);

  return router;
};
