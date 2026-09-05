# Superpowers Guide

**Language / 語言：** English | [繁體中文](#繁體中文)

A local web app that teaches you how to build great projects using the [Superpowers Claude plugin](https://github.com/obra/superpowers). Browse all 7 lifecycle scenarios and 14 skills with step-by-step walkthroughs, copy buttons, and live search. Supports **English** and **繁體中文 (Traditional Chinese)**.

Content matches **superpowers v6.3.0**. See [CHANGELOG.md](CHANGELOG.md) for what changed, when, and by whom.

**Two ways to use it:**

- **Online, nothing to install:** https://peterlwkww-ai.github.io/Superpowers-guide/
- **Locally:** clone and `npm start` (steps below). Useful offline or when editing the content.

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
| **Browse all skills** | Click "Browse all 14 skills →" at the bottom of the home page |
| **Switch language** | Click **繁中** (or **EN**) in the top-left corner |
| **Switch theme** | Click ☾ or ☀ next to the language button. Follows your system setting until you choose |

---

## Opening on Your Phone

You can browse the guide on your phone while the server is running on your PC.

### Requirements
- Your phone and PC must be on the **same WiFi network**

### Steps

**1. Find your PC's local IP address**

Open a terminal and run:

```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your WiFi adapter (e.g. 192.168.1.x or 10.x.x.x)

# macOS / Linux
ifconfig | grep "inet "
```

**2. Open the app on your phone**

In your phone's browser (Chrome or Safari), go to:

```
http://<your-PC-IP>:3000
```

For example: `http://192.168.1.42:3000`

**3. If the page doesn't load — open the firewall port**

Windows may block incoming connections on port 3000. Run this once in a terminal as Administrator:

```
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
```

Then try again on your phone.

### Keep the server running

Your phone connects to the server running on your PC — the server must stay running while you browse. If you close the terminal, the page will stop loading on your phone.

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

- **Node.js + Express** — serves `public/` locally
- **Vanilla JS + CSS** — no build step required
- **Fuse.js** — fuzzy search, vendored in `public/vendor/`

`public/` is a self-contained static site. Every push to `master` runs the tests and deploys it to GitHub Pages via `.github/workflows/pages.yml`.

## Editing the content

All text lives in JSON under `public/data/`:

| File | Contents |
|---|---|
| `scenarios.json` | The 7 scenario walkthroughs |
| `skills.json` | The 14 skills |
| `zh-TW.json` | Traditional Chinese translations |
| `meta.json` | Which superpowers version the content matches |

Run `npm test` after editing. It checks the structure, cross-references, and that every entry has a zh-TW translation.

---

---

# 繁體中文

**Language / 語言：** [English](#superpowers-guide) | 繁體中文

本地端網頁應用程式，教你如何使用 [Superpowers Claude 外掛](https://github.com/obra/superpowers) 打造出色的專案。瀏覽 7 個開發情境與 14 個技能，包含逐步操作說明、一鍵複製指令及即時搜尋功能。支援**英文**與**繁體中文**介面切換。

內容對應 **superpowers v6.3.0**。變更紀錄（日期、修改者、內容）請見 [CHANGELOG.md](CHANGELOG.md)。

**兩種使用方式：**

- **線上，免安裝：** https://peterlwkww-ai.github.io/Superpowers-guide/
- **本機：** clone 後 `npm start`（步驟見下方）。適合離線使用或編輯內容時。

---

## 事前準備

請確認已安裝以下工具：

- **Git** — https://git-scm.com/downloads
- **Node.js**（v16 或以上）— https://nodejs.org

開啟終端機，輸入以下指令確認是否已安裝：

```bash
git --version
node --version
```

---

## 快速開始

### 1. 複製專案

```bash
git clone https://github.com/peterlwkww-ai/Superpowers-guide.git
```

### 2. 進入專案資料夾

```bash
cd Superpowers-guide
```

### 3. 安裝套件

```bash
npm install
```

### 4. 啟動伺服器

```bash
npm start
```

看到以下訊息代表啟動成功：

```
Superpowers Guide running at http://localhost:3000
```

### 5. 在瀏覽器開啟

前往 **http://localhost:3000**

---

## 功能說明

| 功能 | 操作方式 |
|---|---|
| **瀏覽情境** | 點擊首頁任一卡片 |
| **複製指令** | 點擊任一斜線指令旁的**複製**按鈕 |
| **搜尋** | 在頂部搜尋欄輸入關鍵字 |
| **瀏覽所有技能** | 點擊首頁底部的「瀏覽全部 14 個技能 →」 |
| **切換語言** | 點擊左上角的**繁中**（或 **EN**）按鈕 |
| **切換主題** | 點擊語言按鈕旁的 ☾ 或 ☀。未選擇前跟隨系統設定 |

---

## 在手機上開啟

伺服器啟動後，可在手機上瀏覽本應用程式。

### 前提條件
- 手機與電腦必須連接**同一個 WiFi 網路**

### 步驟

**1. 查詢電腦的本機 IP 位址**

開啟終端機，輸入：

```bash
# Windows
ipconfig
# 找到 WiFi 介面卡下的「IPv4 位址」（例如 192.168.1.x 或 10.x.x.x）

# macOS / Linux
ifconfig | grep "inet "
```

**2. 在手機瀏覽器開啟**

使用手機的 Chrome 或 Safari，前往：

```
http://<電腦IP>:3000
```

例如：`http://192.168.1.42:3000`

**3. 若頁面無法載入——開放防火牆連接埠**

Windows 可能會封鎖 3000 連接埠的連線。以系統管理員身分在終端機執行一次以下指令：

```
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
```

之後再從手機重新嘗試。

### 保持伺服器運行

手機連線的是電腦上執行的伺服器——瀏覽時伺服器必須持續運行。若關閉終端機，手機頁面將無法載入。

---

## 停止伺服器

在執行伺服器的終端機按下 **Ctrl+C**。

---

## 取得最新更新

```bash
git pull
npm install
npm start
```

---

## 技術架構

- **Node.js + Express** — 在本機提供 `public/`
- **Vanilla JS + CSS** — 無需建置步驟
- **Fuse.js** — 模糊搜尋，已內建於 `public/vendor/`

`public/` 是可獨立部署的靜態網站。每次 push 到 `master` 都會執行測試，並透過 `.github/workflows/pages.yml` 部署到 GitHub Pages。

## 編輯內容

所有文字都在 `public/data/` 的 JSON 檔裡：

| 檔案 | 內容 |
|---|---|
| `scenarios.json` | 7 個情境的操作說明 |
| `skills.json` | 14 個技能 |
| `zh-TW.json` | 繁體中文翻譯 |
| `meta.json` | 內容對應的 superpowers 版本 |

編輯後執行 `npm test`，會檢查結構、交叉引用，以及每個項目是否都有繁中翻譯。
