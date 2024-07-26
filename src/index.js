const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());


const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "User not found!"})
  }

  request.username = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userNameExists = users.find(user => user.username === username);
  
  if(userNameExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  console.log(username)

  return response.json(username.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { username } = request;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(newToDo)

/*   const index = users.findIndex(u => u.username === username)

  users[index].todos.push(newToDo) */

  return response.status(201).json(newToDo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = username.todos.find(todo => todo.id === id)
  if(!todo) {
    return response.status(404).json({ error: "To do list does not exist!" })
  }

  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find(todo => todo.id === id)
  if(!todo) {
    return response.status(404).json({ error: "To do list does not exist!" })
  }

  todo.done = true;

  return response.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todoIndex = username.todos.findIndex(todo => todo.id === id)
  if(todoIndex === -1) {
    return response.status(404).json({ error: "To do list does not exist!" })
  }

  username.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;