'use strict';
/* global Observer */

// eslint-disable-next-line no-unused-vars
class Store extends Observer {
  static fetchJSON(url, options = {}) {
    const fetchOptions = Object.assign(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
      options,
    );
    return fetch(url, fetchOptions).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
    });
  }

  constructor() {
    super();
    this.todoLists = [];
    this.todoItems = [];
    this.currentListId = 0;
    this.lastError = null;
  }

  notifyError(error) {
    this.lastError = error;
    this.notify({ type: Store.FETCH_ERROR, payload: error });
  }

  notifyTodoItemsFetched() {
    this.notify({ type: Store.TODO_ITEMS_FETCHED, payload: this.todoItems });
  }

  async loadTodoLists() {
    try {
      this.lastError = null;
      this.todoLists = await Store.fetchJSON('/lists');
      this.notify({ type: Store.TODO_LISTS_FETCHED, payload: this.todoLists });
    } catch (error) {
      this.notifyError(error);
    }
  }

  async loadTodoItems(listId) {
    try {
      this.currentListId = listId;
      this.lastError = null;
      this.todoItems = await Store.fetchJSON(`/todos?listId=${this.currentListId}`);
      this.notifyTodoItemsFetched();
    } catch (error) {
      this.notifyError(error);
    }
  }

  async saveTodo(todo) {
    const todoData = Object.assign({}, todo, {
      due_date: todo.due_date ? todo.due_date.slice(0, 10) : null,
      list_id: todo.list_id || this.currentListId,
    });

    try {
      this.todoItems = await Store.fetchJSON(`/todos`, {
        method: todoData.id ? 'PATCH' : 'POST',
        body: JSON.stringify(todoData),
      });
      this.notifyTodoItemsFetched();
    } catch (error) {
      this.notifyError(error);
    }
  }

  async deleteTodo(todo) {
    try {
      this.todoItems = await Store.fetchJSON(`/todos/${todo.id}?listId=${this.currentListId}`, {
        method: 'DELETE',
      });
      this.notifyTodoItemsFetched();
    } catch (error) {
      this.notifyError(error);
    }
  }

  editTodo(todo = {}) {
    this.notify({ type: Store.OPEN_EDIT_DIALOG, payload: todo });
  }
}

Store.TODO_LISTS_FETCHED = 'TODO_LISTS_FETCHED';
Store.TODO_ITEMS_FETCHED = 'TODO_ITEMS_FETCHED';
Store.FETCH_ERROR = 'FETCH_ERROR';
Store.OPEN_EDIT_DIALOG = 'OPEN_EDIT_DIALOG';
Store.CLOSE_EDIT_DIALOG = 'CLOSE_EDIT_DIALOG';
