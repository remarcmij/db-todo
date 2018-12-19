'use strict';

// eslint-disable-next-line no-unused-vars
class Model {
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
    this.observers = new Set();
    this.todoLists = [];
    this.todoItems = [];
    this.currentListId = 0;
    this.lastError = null;
  }

  subscribe(observer) {
    if (typeof observer.update === 'function') {
      this.observers.add(observer);
      return () => this.observers.delete(observer);
    } else {
      console.error("Can't subscribe observer without update function");
      return () => undefined;
    }
  }

  notify(action) {
    this.observers.forEach(observer => observer.update(action));
  }

  async loadTodoLists() {
    try {
      this.lastError = null;
      this.todoLists = await Model.fetchJSON('/lists');
      this.notify(Model.TODO_LISTS_FETCHED);
    } catch (error) {
      this.lastError = error;
      this.notify(Model.FETCH_ERROR);
    }
  }

  async loadTodoItems(listId) {
    try {
      this.currentListId = listId;
      this.lastError = null;
      this.todoItems = await Model.fetchJSON(`/todos?listId=${this.currentListId}`);
      this.notify(Model.TODO_ITEMS_FETCHED);
    } catch (error) {
      this.lastError = error;
      this.notify(Model.FETCH_ERROR);
    }
  }

  async saveTodo(todo) {
    const todoData = Object.assign({}, todo, {
      due_date: todo.due_date ? todo.due_date.slice(0, 10) : null,
      list_id: todo.list_id || this.currentListId,
    });

    try {
      this.todoItems = await Model.fetchJSON(`/todos`, {
        method: todoData.id ? 'PATCH' : 'POST',
        body: JSON.stringify(todoData),
      });
      this.notify(Model.TODO_ITEMS_FETCHED);
    } catch (error) {
      this.lastError = error;
      this.notify(Model.FETCH_ERROR);
    }
  }

  async deleteTodo(todo) {
    try {
      this.todoItems = await Model.fetchJSON(`/todos/${todo.id}?listId=${this.currentListId}`, {
        method: 'DELETE',
      });
      this.notify(Model.TODO_ITEMS_FETCHED);
    } catch (error) {
      this.lastError = error;
      this.notify(Model.FETCH_ERROR);
    }
  }
}

Model.TODO_LISTS_FETCHED = 'TODO_LISTS_FETCHED';
Model.TODO_ITEMS_FETCHED = 'TODO_ITEMS_FETCHED';
Model.FETCH_ERROR = 'FETCH_ERROR';
