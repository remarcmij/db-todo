'use strict';
/* global TodoListItem */
{
  const ui = {};

  const state = {
    todoItems: [],
    todoLists: [],
    selectedListId: -1,
  };

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.innerText = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  function renderTodoListItem(todo, ul) {
    const li = createAndAppend('li', ul);
    createAndAppend('div', li, { text: todo.description });
  }

  async function fetchAndRenderTodos(listId) {
    const todos = await fetch(`/items?listId=${listId}`).then(response => response.json());
    ui.todoContainer.innerHTML = '';
    createAndAppend('p', ui.todoContainer, {
      text: `Number of todos in this list: ${todos.length}.`,
    });
    const ul = createAndAppend('ul', ui.todoContainer);
    todos.forEach(todo => renderTodoListItem(todo, ul));
  }

  function renderTodoSelect() {
    state.lists.forEach(list => {
      createAndAppend('option', ui.select, { value: list.id, text: list.description });
    });
  }

  function renderHeader(header) {
    ui.select = createAndAppend('select', header);
    ui.select.addEventListener('change', event => fetchAndRenderTodos(event.target.value));
    renderTodoSelect();
  }

  async function main() {
    const root = document.getElementById('root');
    const header = createAndAppend('header', root, { class: 'header' });
    ui.todoContainer = createAndAppend('div', root, { class: 'todos-container' });

    state.lists = await fetch('/lists').then(response => response.json());
    renderHeader(header);
    fetchAndRenderTodos(state.lists[0].id);
  }

  window.onload = main;
}
