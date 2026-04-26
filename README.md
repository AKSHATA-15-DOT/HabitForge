# HabitForge

A Gamified Habit Tracking Application designed to help users build positive habits using streaks, XP rewards, levels, badges, analytics, and premium feature previews.

## 🚀 Live Demo

https://habitforge-1.onrender.com

## 📂 GitHub Repository

https://github.com/AKSHATA-15-DOT/HabitForge

---

## ✨ Features

- Add new habits
- Delete habits
- Mark habits as completed
- Daily / Weekly habit frequency
- Habit streak tracking 🔥
- XP reward system ⭐
- Level progression 🏆
- Progress bar to next level 📈
- Achievement badges 🎖️
- Analytics chart using Chart.js 📊
- Premium feature preview 🔒
- Responsive modern UI

---

## 🛠 Tech Stack

- Node.js
- Express.js
- JavaScript
- HTML
- CSS
- Chart.js

---

## 🎮 Gamification Logic

### XP Formula

- Completing a habit gives **+10 XP**
- Every **50 XP** increases the level

### Level Formula

Level = Total XP / 50

---

## 🔥 Streak Calculation Algorithm

- If a habit is completed for the first time, streak starts at **1**
- If completed again on the next valid period:
  - Daily habit → next day
  - Weekly habit → next week
- If the required day/week is missed, streak resets

---

## 📅 Frequency Support

- Daily Habits
- Weekly Habits

Examples:

- Drink Water (Daily)
- Gym (Weekly)

---

## 📊 Analytics Dashboard

Includes a streak comparison chart for all habits using Chart.js.

---

## 🔒 Premium Features

Preview section includes:

- Advanced Analytics
- CSV Export
- Unlimited Habits

---

## ▶️ How to Run Locally

1. Install dependencies

```bash
npm install
