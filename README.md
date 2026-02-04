# Task 4 - To-Do API

This is a simple REST API for managing to-do tasks built with Node.js and Express.

## Setup

Install dependencies:
```
npm install
```

Run the server:
```
node index.js
```

The server will start on port 3001.

## Features

- Create new tasks
- Get all tasks
- Get task by ID
- Update tasks
- Delete tasks
- User login (Basic Auth)
- Task reminders

## Endpoints

- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get a specific task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `GET /reminders/check` - Check due reminders

## Tech Used

- Node.js
- Express
- CORS
- File System (for storing data in tasks.json)

## Note

All endpoints require Basic Authentication.
