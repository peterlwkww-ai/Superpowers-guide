# Superpowers Guide

A local web app that teaches you how to build great projects using the [Superpowers Claude plugin](https://github.com/anthropics/claude-code). Browse all 7 lifecycle scenarios and 13 skills with step-by-step walkthroughs, copy buttons, and live search. Supports **English** and **繁體中文 (Traditional Chinese)**.

![screenshot](https://raw.githubusercontent.com/peterlwkww-ai/Superpowers-guide/master/docs/screenshot.png)

---

## Prerequisites

Make sure you have the following installed:

- **Git** — https://git-scm.com/downloads
- **Node.js** (v16 or later) — https://nodejs.org

To check if they're installed, open a terminal and run:

```bash
git --version
node --version
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/peterlwkww-ai/Superpowers-guide.git
```

### 2. Enter the project folder

```bash
cd Superpowers-guide
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the server

```bash
npm start
```

You should see:

```
Superpowers Guide running at http://localhost:3000
```

### 5. Open in your browser

Go to **http://localhost:3000**

---

## Usage

| Feature | How to use |
|---|---|
| **Browse scenarios** | Click any card on the home page |
| **Copy a command** | Click the **Copy** button next to any slash command |
| **Search** | Type in the search bar (top right) |
| **Browse all skills** | Click "Browse all 13 skills →" at the bottom of the home page |
| **Switch language** | Click **繁中** (or **EN**) in the top-right corner |

---

## Stopping the server

Press **Ctrl+C** in the terminal where the server is running.

---

## Getting the latest updates

```bash
git pull
npm install
npm start
```

---

## Tech Stack

- **Node.js + Express** — serves the app locally
- **Vanilla JS + CSS** — no build step required
- **Fuse.js** — fuzzy search
