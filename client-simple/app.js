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

  async function saveTodo(todo) {
    const todoData = Object.assign({}, todo, {
      due_date: todo.due_date ? todo.due_date.slice(0, 10) : null,
      list_id: todo.list_id || state.listId,
    });

    const method = todoData.id ? 'PATCH' : 'POST';
    try {
      state.todos = await fetchJSON(`/todos`, {
        method,
        body: JSON.stringify(todoData),
      });
      updateTodoListItems();
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
      saveTodo(todo);
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
        updateTodoListItems();
      }
    });
  }

  function renderTodoListItem(todo, container) {
    const li = createAndAppend('li', container, { class: 'todo-list-item' });
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

  function updateTodoListItems() {
    const container = document.getElementById('todo-list-item-container');
    clearContainer(container);
    state.todos.forEach(todo => renderTodoListItem(todo, container));
  }

  function updateListSelectorContent() {
    const select = document.getElementById('todo-list-selector');
    clearContainer(select);
    state.todoLists.forEach(list => {
      createAndAppend('option', select, {
        value: list.id,
        text: list.description,
      });
    });
  }

  function updateSaveButtonState() {
    const text = ui.editModalTextInput.value;
    if (text.trim() === '') {
      ui.editModalSaveButton.setAttribute('disabled', '');
    } else {
      ui.editModalSaveButton.removeAttribute('disabled');
    }
  }

  function editTodo(todo = {}) {
    state.currentTodo = todo;
    ui.editModalTitle.innerText = todo.id ? 'Edit Todo' : 'Add Todo';
    ui.editModalTextInput.value = todo.description || '';
    updateSaveButtonState();
    const dateString = todo.due_date ? todo.due_date.slice(0, 10) : '';
    ui.editModalDateInput.value = dateString;
    ui.editModalOverlay.style.display = 'block';
    ui.editModalTextInput.focus();
  }

  async function fetchAndRenderTodos(listId) {
    state.listId = listId;
    try {
      state.todos = await fetchJSON(`/todos?listId=${listId}`);
      updateTodoListItems();
    } catch (error) {
      renderError(error);
    }
  }

  function getElements() {
    ui.mainContainer = document.getElementById('main-container');
    ui.todoListSelector = document.getElementById('todo-list-selector');
    ui.todoListContainer = document.getElementById('todo-list-item-container');
    ui.addButton = document.getElementById('add-button');
    ui.editModalSaveButton = document.getElementById('save-button');
    ui.editModalOverlay = document.getElementById('edit-modal-overlay');
    ui.editModalTitle = document.getElementById('edit-modal-title');
    ui.editModalTextInput = document.getElementById('edit-modal-text-input');
    ui.editModalDateInput = document.getElementById('edit-modal-date-input');
  }

  function handleSave() {
    state.currentTodo.description = ui.editModalTextInput.value;
    state.currentTodo.due_date = ui.editModalDateInput.value;
    ui.editModalOverlay.style.display = 'none';
    saveTodo(state.currentTodo);
  }

  async function main() {
    getElements();

    ui.todoListSelector.addEventListener('change', event => {
      fetchAndRenderTodos(event.target.value);
    });

    ui.addButton.addEventListener('click', () => editTodo());
    ui.editModalSaveButton.addEventListener('click', handleSave);
    ui.editModalTextInput.addEventListener('input', updateSaveButtonState);

    window.onclick = event => {
      if (event.target === ui.editModalOverlay) {
        ui.editModalOverlay.style.display = 'none';
      }
    };

    try {
      state.todoLists = await fetchJSON('/lists');
      updateListSelectorContent();
      fetchAndRenderTodos(state.todoLists[0].id);
    } catch (error) {
      renderError(error);
    }
  }

  window.onload = main;
}
