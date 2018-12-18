'use strict';
/* eslint-disable camelcase */

{
  const ui = {
    editModal: {},
  };

  const state = {
    editMode: false,
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

  function clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function renderError(error) {
    clearContainer(ui.mainContainer);
    createAndAppend('div', ui.mainContainer, { text: error.message, class: 'alert alert-error' });
  }

  function fetchJSON(url, options = {}) {
    options.headers = {
      'Content-Type': 'application/json; charset=utf-8',
    };
    return fetch(url, options).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
    });
  }

  async function persistTodo(todo) {
    const todoData = Object.assign({}, todo, {
      due_date: todo.due_date ? todo.due_date.slice(0, 10) : null,
      list_id: todo.list_id || state.listId,
    });

    const method = todoData.id ? 'PATCH' : 'POST';
    try {
      state.todos = await fetchJSON(`/todos?listId=${state.listId}`, {
        method,
        body: JSON.stringify(todoData),
      });
      renderTodos();
    } catch (error) {
      renderError(error);
    }
  }

  function renderCheckbox(todo, parent) {
    const checkboxId = `todo-${todo.id}`;
    createAndAppend('label', parent, {
      text: 'Done',
      for: checkboxId,
      class: 'checkbox-label',
    });
    const checkboxOptions = {
      type: 'checkbox',
      id: checkboxId,
      'data-todo-id': todo.id,
    };
    if (todo.done === 'y') {
      checkboxOptions.checked = '';
    }
    const checkBox = createAndAppend('input', parent, checkboxOptions);
    checkBox.addEventListener('change', async () => {
      todo.done = todo.done === 'n' ? 'y' : 'n';
      persistTodo(todo);
    });
  }

  function renderButton(label, parent, clickHandler) {
    const button = createAndAppend('button', parent, {
      text: label,
      class: 'button',
    });
    button.addEventListener('click', clickHandler);
  }

  function renderTodoDeleteButton(parent, todo) {
    renderButton('DELETE', parent, async () => {
      if (confirm('Deleting todo: please confirm')) {
        state.todos = await fetchJSON(`/todos/${todo.id}?listId=${state.listId}`, {
          method: 'DELETE',
        });
        renderTodos();
      }
    });
  }

  function renderTodoListItem(todo) {
    const li = createAndAppend('li', ui.todoList, { class: 'todo-list-item' });
    const containerDiv = createAndAppend('div', li, { class: 'todo-list-item-container' });

    createAndAppend('div', containerDiv, {
      text: todo.description,
      class: todo.done === 'y' ? 'todo-list-item-done' : '',
    });

    const rightPart = createAndAppend('div', containerDiv, { class: 'todo-list-item-right' });
    const dateString = todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '';
    createAndAppend('div', rightPart, { text: dateString, class: 'todo-list-due-date' });

    renderTodoDeleteButton(rightPart, todo);
    renderButton('EDIT', rightPart, () => editTodo(todo));
    renderCheckbox(todo, rightPart);
  }

  function renderTodos() {
    clearContainer(ui.todoList);
    state.todos.forEach(todo => renderTodoListItem(todo));
  }

  async function fetchAndRenderTodos() {
    try {
      state.todos = await fetchJSON(`/todos?listId=${state.listId}`);
      renderTodos();
    } catch (error) {
      renderError(error);
    }
  }

  function renderTodosSelect() {
    state.lists.forEach(list => {
      createAndAppend('option', ui.select, { value: list.id, text: list.description });
    });
  }

  function renderEditModal(parent) {
    ui.editModal.overlay = createAndAppend('div', parent, { class: 'modal' });
    const modalContent = createAndAppend('div', ui.editModal.overlay, { class: 'modal-content' });
    ui.editModal.textInput = createAndAppend('input', modalContent, {
      type: 'text',
      class: 'edit-text-input margin',
    });
    ui.editModal.dateInput = createAndAppend('input', modalContent, {
      type: 'date',
      class: 'edit-date-input margin',
    });

    renderButton('SAVE', modalContent, () => {
      state.currentTodo.description = ui.editModal.textInput.value;
      state.currentTodo.due_date = ui.editModal.dateInput.value;
      ui.editModal.overlay.style.display = 'none';
      persistTodo(state.currentTodo);
    });

    window.onclick = event => {
      if (event.target === ui.editModal.overlay) {
        ui.editModal.style.display = 'none';
      }
    };
  }

  function editTodo(todo = {}) {
    state.currentTodo = todo;
    ui.editModal.overlay.style.display = 'block';
    ui.editModal.textInput.value = todo.description || '';
    const dateString = todo.due_date ? todo.due_date.slice(0, 10) : '';
    ui.editModal.dateInput.value = dateString;
  }

  function renderHeader(header) {
    ui.select = createAndAppend('select', header, { class: 'todo-list-selector' });
    ui.select.addEventListener('change', event => {
      state.listId = event.target.value;
      fetchAndRenderTodos();
    });
    renderTodosSelect();
    renderButton('ADD TODO', header, () => editTodo());
  }

  async function main() {
    const root = document.getElementById('root');
    const header = createAndAppend('header', root, { class: 'header' });
    ui.mainContainer = createAndAppend('div', root, { class: 'todos-container' });

    renderEditModal(ui.mainContainer);
    ui.todoList = createAndAppend('ul', ui.mainContainer);

    try {
      state.lists = await fetchJSON('/lists');
      renderHeader(header);
      state.listId = state.lists[0].id;
      fetchAndRenderTodos();
    } catch (error) {
      renderError(error);
    }
  }

  window.onload = main;
}
