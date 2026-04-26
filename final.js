const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/habitforge")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const habitSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: null }
});

const Habit = mongoose.model("Habit", habitSchema);

let xp = 0;

function getLevel() {
  return Math.floor(xp / 50) + 1;
}

function getProgress() {
  return xp % 50;
}

function getProgressPercent() {
  return (getProgress() / 50) * 100;
}

function getBadges(habits) {
  const badges = [];
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

  if (totalStreak >= 5) badges.push("🔥 Streak Starter");
  if (totalStreak >= 10) badges.push("👑 Consistency King");
  if (xp >= 100) badges.push("⭐ XP Collector");
  if (habits.length >= 3) badges.push("📌 Habit Builder");

  return badges;
}

async function seedHabits() {
  const count = await Habit.countDocuments();

  if (count === 0) {
    await Habit.insertMany([
      { title: "Drink Water", completed: false, streak: 3 },
      { title: "Gym", completed: true, streak: 5 },
      { title: "Read 30 mins", completed: false, streak: 2 }
    ]);

    console.log("Demo habits added");
  }
}

seedHabits();

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>HabitForge</title>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
  body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea, #764ba2);
    min-height: 100vh;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container {
    background: white;
    width: 560px;
    padding: 30px;
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  h1 {
    text-align: center;
    color: #4b3f72;
  }

  .stats {
    display: flex;
    justify-content: space-between;
    background: #f3f0ff;
    padding: 15px;
    border-radius: 12px;
    margin-bottom: 15px;
  }

  .progress-title {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .progress-box {
    background: #eee;
    border-radius: 20px;
    overflow: hidden;
    height: 18px;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    width: 0%;
  }

  .progress-text {
    font-size: 14px;
    margin-bottom: 15px;
    color: #555;
  }

  .badge {
    background: #f3f0ff;
    padding: 8px;
    margin: 5px;
    border-radius: 10px;
    display: inline-block;
  }

  .input-row {
    display: flex;
    gap: 8px;
    margin-top: 15px;
  }

  input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 10px;
  }

  button {
    padding: 12px 16px;
    border: none;
    border-radius: 10px;
    background: #667eea;
    color: white;
    cursor: pointer;
  }

  button:hover {
    background: #4b5bdc;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    background: #f8f8ff;
    margin-top: 10px;
    padding: 12px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .done {
    text-decoration: line-through;
    color: gray;
  }

  .delete {
    background: #ff5f6d;
  }

  .habit-left {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .chart-box {
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
</head>

<body>
<div class="container">
  <h1>🔥 HabitForge</h1>

  <div class="stats">
    <strong>Level: <span id="level"></span></strong>
    <strong>XP: <span id="xp"></span></strong>
  </div>

  <div class="progress-title">Progress to Next Level</div>
  <div class="progress-box">
    <div class="progress-fill" id="progressFill"></div>
  </div>
  <div class="progress-text">
    <span id="progressText"></span>
  </div>

  <h3>Badges</h3>
  <div id="badgeList"></div>

  <div class="input-row">
    <input id="habitInput" placeholder="Enter habit">
    <button onclick="addHabit()">Add</button>
  </div>

  <div class="chart-box">
    <h3>Streak Analytics</h3>
    <canvas id="streakChart"></canvas>
  </div>

  <h2>Habits</h2>
  <ul id="habitList"></ul>
</div>

<script>
async function loadHabits() {
  const res = await fetch("/habits");
  const data = await res.json();

  document.getElementById("xp").innerText = data.xp;
  document.getElementById("level").innerText = data.level;

  document.getElementById("progressFill").style.width = data.progressPercent + "%";
  document.getElementById("progressText").innerText =
    data.progress + " / 50 XP toward Level " + (data.level + 1);

  document.getElementById("badgeList").innerHTML =
    data.badges.map(b => "<span class='badge'>" + b + "</span>").join("");

  const list = document.getElementById("habitList");
  list.innerHTML = "";

  data.habits.forEach((h) => {
    const li = document.createElement("li");

    li.innerHTML = \`
      <div class="habit-left">
        <input type="checkbox" \${h.completed ? "checked" : ""} onclick="toggleHabit('\${h._id}')">
        <span class="\${h.completed ? "done" : ""}">\${h.title} 🔥 \${h.streak}</span>
      </div>
      <button class="delete" onclick="deleteHabit('\${h._id}')">Delete</button>
    \`;

    list.appendChild(li);
  });

  const ctx = document.getElementById("streakChart");

  if (window.streakChartInstance) {
    window.streakChartInstance.destroy();
  }

  window.streakChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.habits.map(h => h.title),
      datasets: [{
        label: "Habit Streaks",
        data: data.habits.map(h => h.streak)
      }]
    }
  });
}

async function addHabit() {
  const input = document.getElementById("habitInput");

  if (!input.value) return;

  await fetch("/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.value })
  });

  input.value = "";
  loadHabits();
}

async function deleteHabit(id) {
  await fetch("/habits/" + id, { method: "DELETE" });
  loadHabits();
}

async function toggleHabit(id) {
  await fetch("/habits/" + id, { method: "PUT" });
  loadHabits();
}

loadHabits();
</script>
</body>
</html>
`);
});

app.get("/habits", async (req, res) => {
  const habits = await Habit.find();

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  xp = totalStreak * 10;

  res.json({
    xp,
    level: getLevel(),
    progress: getProgress(),
    progressPercent: getProgressPercent(),
    badges: getBadges(habits),
    habits
  });
});

app.post("/habits", async (req, res) => {
  const habit = new Habit({
    title: req.body.title,
    completed: false,
    streak: 0,
    lastCompletedDate: null
  });

  await habit.save();
  res.json({ success: true });
});

app.delete("/habits/:id", async (req, res) => {
  await Habit.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.put("/habits/:id", async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  const today = new Date().toDateString();

  if (habit.lastCompletedDate !== today) {
    habit.streak += 1;
    habit.lastCompletedDate = today;
  }

  habit.completed = !habit.completed;

  await habit.save();
  res.json({ success: true });
});

app.listen(7000, () => {
  console.log("FINAL APP RUNNING ON http://127.0.0.1:7000");
});