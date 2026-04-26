const express = require("express");
const app = express();

app.use(express.json());

let habits = [
  { title: "Drink Water", frequency: "Daily", completed: false, streak: 4 },
  { title: "Gym", frequency: "Weekly", completed: false, streak: 6 },
  { title: "Read 30 mins", frequency: "Daily", completed: false, streak: 3 }
];

let xp = 130;

function getLevel() {
  return Math.floor(xp / 50) + 1;
}

function getProgress() {
  return xp % 50;
}

function getProgressPercent() {
  return (getProgress() / 50) * 100;
}

function getBadges() {
  return ["🔥 Streak Starter", "👑 Consistency King", "⭐ XP Collector", "📌 Habit Builder"];
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>HabitForge</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
<style>
body {
  font-family: Arial;
  background: linear-gradient(135deg,#667eea,#764ba2);
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
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
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

.progress-box {
  background: #eee;
  border-radius: 20px;
  overflow: hidden;
  height: 18px;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg,#667eea,#764ba2);
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

input, select {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

input {
  flex: 1;
}

button {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white;
  cursor: pointer;
  transition: 0.3s ease;
  font-weight: bold;
}

button:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 18px rgba(0,0,0,.15);
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

.delete {
  background: #ff5f6d;
}

.done {
  text-decoration: line-through;
  color: gray;
}
  <div class="profile-card">
  <div class="avatar">AJ</div>
  <div>
    <h3>Akshata Jadimath</h3>
    <p>Gamified Habit Builder</p>
    <p>🏆 Badges: <span id="badgeCount"></span> | 🔥 Best Streak: <span id="bestStreak"></span></p>
  </div>
</div>
.dark {
  background: #111 !important;
}

.dark .container {
  background: #1e1e1e;
  color: white;
}

.dark li,
.dark .stats,
.dark .profile-card,
.dark .badge {
  background: #2c2c2c;
  color: white;
}

.dark input,
.dark select {
  background: #333;
  color: white;
  border: 1px solid #555;
}
</style>
</head>

<body>
<div class="container">
  <h1>🔥 HabitForge</h1>
  <button onclick="toggleDarkMode()" style="float:right;margin-bottom:10px;">
🌙 Dark Mode
</button>
  <div class="profile-card">
  <div class="avatar">AJ</div>
  <div>
    <h3>Akshata Jadimath</h3>
    <p>Gamified Habit Builder</p>
    <p>🏆 Badges: <span id="badgeCount"></span> | 🔥 Best Streak: <span id="bestStreak"></span></p>
  </div>
</div>

  <div class="stats">
    <strong>Level: <span id="level"></span></strong>
    <strong>XP: <span id="xp"></span></strong>
  </div>

  <h3>Progress to Next Level</h3>
  <div class="progress-box">
    <div class="progress-fill" id="progressFill"></div>
  </div>
  <p><span id="progressText"></span></p>

  <h3>Badges</h3>
  <div id="badgeList"></div>

  <div class="input-row">
    <input id="habitInput" placeholder="Enter habit">

    <select id="frequency">
      <option value="Daily">Daily</option>
      <option value="Weekly">Weekly</option>
    </select>

    <button onclick="addHabit()">Add</button>
  </div>

  <h3>Streak Analytics</h3>
  <canvas id="streakChart"></canvas>
  <h3>Premium Features</h3>
<div style="background:#fff3cd;padding:15px;border-radius:12px;margin-top:15px;">
  <p>🔒 Advanced Analytics - Premium</p>
  <p>🔒 CSV Export - Premium</p>
  <p>🔒 Unlimited Habits - Premium</p>
</div>

  <h2>Habits</h2>
  <ul id="habitList"></ul>
</div>

<script>
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
async function loadHabits() {
  const res = await fetch("/habits");
  const data = await res.json();

  document.getElementById("xp").innerText = data.xp;
  document.getElementById("level").innerText = data.level;
  document.getElementById("progressFill").style.width = data.progressPercent + "%";
  document.getElementById("progressText").innerText =
    data.progress + " / 50 XP toward Level " + (data.level + 1);

  document.getElementById("badgeList").innerHTML =
  document.getElementById("badgeCount").innerText = data.badges.length;
document.getElementById("bestStreak").innerText =
  Math.max(...data.habits.map(h => h.streak));
    data.badges.map(b => "<span class='badge'>" + b + "</span>").join("");

  const list = document.getElementById("habitList");
  list.innerHTML = "";

  data.habits.forEach((h, i) => {
    const li = document.createElement("li");

    li.innerHTML = \`
      <div>
        <input type="checkbox" \${h.completed ? "checked" : ""} onclick="toggleHabit(\${i})">
        <span class="\${h.completed ? "done" : ""}">
          \${h.title} (\${h.frequency}) 🔥 \${h.streak}
        </span>
      </div>
      <button class="delete" onclick="deleteHabit(\${i})">Delete</button>
    \`;

    list.appendChild(li);
  });

  const ctx = document.getElementById("streakChart");

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
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
  const frequency = document.getElementById("frequency");

  if (!input.value) return;

  await fetch("/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.value,
      frequency: frequency.value
    })
  });

  input.value = "";
  loadHabits();
}

async function deleteHabit(i) {
  await fetch("/habits/" + i, { method: "DELETE" });
  loadHabits();
}

async function toggleHabit(i) {
  await fetch("/habits/" + i, { method: "PUT" });

  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 }
  });

  loadHabits();
}

loadHabits();
</script>
</body>
</html>
`);
});

app.get("/habits", (req, res) => {
  res.json({
    xp,
    level: getLevel(),
    progress: getProgress(),
    progressPercent: getProgressPercent(),
    badges: getBadges(),
    habits
  });
});

app.post("/habits", (req, res) => {
  habits.push({
    title: req.body.title,
    frequency: req.body.frequency,
    completed: false,
    streak: 0
  });

  res.json({ success: true });
});

app.delete("/habits/:index", (req, res) => {
  habits.splice(req.params.index, 1);
  res.json({ success: true });
});

app.put("/habits/:index", (req, res) => {
  const h = habits[req.params.index];

  if (!h.completed) {
    h.streak += 1;
    xp += 10;
  }

  h.completed = !h.completed;
  res.json({ success: true });
});

app.listen(process.env.PORT || 7000, () => {
  console.log("HabitForge running");
});
