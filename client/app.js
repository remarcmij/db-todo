'use strict';

{
  const ui = {
    editModal: {},
  };

  const state = {};

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
    return button;
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

  function updateSaveButtonState() {
    const text = ui.editModal.textInput.value;
    if (text.trim() === '') {
      ui.editModal.saveButton.setAttribute('disabled', '');
    } else {
      ui.editModal.saveButton.removeAttribute('disabled');
    }
  }

  function renderEditModalDialog(parent) {
    ui.editModal.overlay = createAndAppend('div', parent, { class: 'modal' });
    const modalContent = createAndAppend('div', ui.editModal.overlay, { class: 'modal-content' });
    ui.editModal.title = createAndAppend('div', modalContent, { class: 'modal-title' });
    const body = createAndAppend('div', modalContent, { class: 'modal-body' });

    ui.editModal.textInput = createAndAppend('input', body, {
      type: 'text',
      class: 'edit-text-input',
    });

    ui.editModal.dateInput = createAndAppend('input', body, {
      type: 'date',
      class: 'edit-date-input',
    });

    const buttonContainer = createAndAppend('div', modalContent, {
      class: 'modal-buttons',
    });

    ui.editModal.saveButton = renderButton('SAVE', buttonContainer, () => {
      state.currentTodo.description = ui.editModal.textInput.value;
      state.currentTodo.due_date = ui.editModal.dateInput.value;
      ui.editModal.overlay.style.display = 'none';
      persistTodo(state.currentTodo);
    });

    ui.editModal.textInput.addEventListener('input', () => updateSaveButtonState());

    window.onclick = event => {
      if (event.target === ui.editModal.overlay) {
        ui.editModal.overlay.style.display = 'none';
      }
    };
  }

  function editTodo(todo = {}) {
    state.currentTodo = todo;
    ui.editModal.title.innerText = todo.id ? 'Edit Todo' : 'Add Todo';
    ui.editModal.textInput.value = todo.description || '';
    updateSaveButtonState();
    const dateString = todo.due_date ? todo.due_date.slice(0, 10) : '';
    ui.editModal.dateInput.value = dateString;
    ui.editModal.overlay.style.display = 'block';
  }

  function renderHeader(header) {
    ui.select = createAndAppend('select', header, { class: 'todo-list-selector' });
    ui.select.addEventListener('change', event => {
      state.listId = event.target.value;
      fetchAndRenderTodos();
    });
    renderTodosSelect();
    const button = createAndAppend('button', header, {
      text: 'ADD TODO',
      class: 'button',
    });
    button.addEventListener('click', () => editTodo());
  }

  async function main() {
    const root = document.getElementById('root');
    const header = createAndAppend('header', root, { class: 'header' });
    ui.mainContainer = createAndAppend('div', root, { class: 'todos-container' });

    renderEditModalDialog(ui.mainContainer);
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
