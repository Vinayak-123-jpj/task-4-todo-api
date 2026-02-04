const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "tasks.json";

// Simple authentication middleware (bonus feature)
// TODO: make this more secure later
const users = {
  student: "pass123",
  admin: "admin123",
};

function authenticate(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: "No credentials provided" });
  }

  // Basic auth format: "Basic base64(username:password)"
  const credentials = Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");
  const username = credentials[0];
  const password = credentials[1];

  if (users[username] && users[username] === password) {
    req.username = username;
    next();
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
}

// Create task
app.post("/tasks", authenticate, (req, res) => {
  const task = req.body;

  let tasks = [];
  if (fs.existsSync(FILE)) {
    tasks = JSON.parse(fs.readFileSync(FILE));
  }

  task.id = Date.now();
  task.createdBy = req.username; // track who created it
  task.createdAt = new Date().toISOString();
  task.completed = false;

  // Add reminder if provided (bonus feature)
  if (task.reminder) {
    task.reminderDate = task.reminder;
  }

  tasks.push(task);

  fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));

  res.json({ message: "Task added", task });
});

// Get all tasks
app.get("/tasks", authenticate, (req, res) => {
  let tasks = [];

  if (fs.existsSync(FILE)) {
    tasks = JSON.parse(fs.readFileSync(FILE));
  }

  // filter by user if needed
  const userTasks = tasks.filter(
    (t) => t.createdBy === req.username || req.username === "admin",
  );

  res.json(userTasks);
});

// Get single task by ID
app.get("/tasks/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);

  if (!fs.existsSync(FILE)) {
    return res.status(404).json({ error: "No tasks found" });
  }

  let tasks = JSON.parse(fs.readFileSync(FILE));
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// Update task
app.put("/tasks/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  let tasks = JSON.parse(fs.readFileSync(FILE));
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // merge updates
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  tasks[taskIndex].updatedAt = new Date().toISOString();

  fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));

  res.json({ message: "Task updated", task: tasks[taskIndex] });
});

// Delete task
app.delete("/tasks/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);

  let tasks = JSON.parse(fs.readFileSync(FILE));
  tasks = tasks.filter((t) => t.id !== id);

  fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));

  res.json({ message: "Task deleted" });
});

// Bonus: Get tasks with reminders that are due
app.get("/reminders/check", authenticate, (req, res) => {
  let tasks = [];

  if (fs.existsSync(FILE)) {
    tasks = JSON.parse(fs.readFileSync(FILE));
  }

  const now = new Date();
  const dueReminders = tasks.filter((t) => {
    if (t.reminderDate) {
      const reminderTime = new Date(t.reminderDate);
      return reminderTime <= now && !t.completed;
    }
    return false;
  });

  res.json({
    count: dueReminders.length,
    reminders: dueReminders,
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available endpoints:");
  console.log("  POST   /tasks");
  console.log("  GET    /tasks");
  console.log("  GET    /tasks/:id");
  console.log("  PUT    /tasks/:id");
  console.log("  DELETE /tasks/:id");
  console.log("  GET    /reminders/check");
});
