# Play2gether

Play2gether is a small website I built with HTML, CSS and JavaScript. It gives people three simple activities in one place: a two-player **Tic Tac Toe** game, a **Music** break page, and a **MoneyBox** pocket money tracker.

The site's slogan is *"Play, relax, and grow."*

**Author:** Shareena Goulbourn
**Course:** Estudiante de 2.º año de FP Superior en DAM en Ucademy. Prácticas en Music Well Tech: 1.ª tarea.
**Date:** 5/10/2026

---

## TypeScript version (this branch)

On the `version-typescript` branch, the logic for Tic Tac Toe and MoneyBox is written in **TypeScript** instead of JavaScript. The `.ts` files in `src/` are compiled into `.js` files in `dist/`, which the HTML pages load.

📄 **[Read the full migration summary](TYPESCRIPT-MIGRATION.md)**: how the environment was set up, the 93 compiler errors found, and how each kind was fixed.

---

## How to run it

1. Install [Node.js](https://nodejs.org/) (LTS version), which includes npm.
2. In the project folder, install the dependencies (this creates `node_modules/`):
   ```bash
   npm install
   ```
3. Compile the TypeScript into JavaScript:
   ```bash
   npm run build
   ```
   While editing, use `npm run watch` instead: it recompiles automatically every time you save.
4. Open `index.html` with a local server, for example **Live Server** in VS Code (right-click `index.html` → *Open with Live Server*).

> **Note:** Opening `index.html` by double-clicking will not work for Tic Tac Toe and MoneyBox. The scripts are loaded as modules (`type="module"`), and browsers only run modules from a server.

---

## Folder structure

```
play2gether/
├── index.html               Home page with links to the three activities
├── tictactoe.html           Tic Tac Toe page (layout)
├── music.html               Music break page
├── moneybox.html            MoneyBox page (layout)
├── style.css                One stylesheet shared by every page
├── src/                     TypeScript source (the files I edit)
│   ├── tictactoe.ts         Tic Tac Toe game logic
│   └── moneybox.ts          MoneyBox logic (totals, goal, saving)
├── dist/                    Compiled JavaScript (made by npm run build, never edited by hand)
│   ├── tictactoe.js
│   └── moneybox.js
├── package.json             Project info, npm scripts and dependencies
├── package-lock.json        Exact versions of the installed dependencies
├── tsconfig.json            TypeScript settings (src → dist, strict mode)
├── .gitignore               Keeps node_modules/ out of Git
├── TYPESCRIPT-MIGRATION.md  Summary of the JavaScript → TypeScript migration
└── sounds/
    ├── x.mp3         Sound when X makes a move
    ├── o.mp3         Sound when O makes a move
    ├── win.mp3       Sound when someone wins
    ├── draw.mp3      Sound when the game is a draw
    └── abc-song.mp3  Song on the Music page
```

I kept the structure (HTML), the look (CSS) and the behaviour (JavaScript) in separate files. This makes each file shorter and easier to understand, and means I can change the design without touching the code.

---

## The pages

### 🏠 Home (`index.html`)
Welcomes the user and shows three cards, one for each activity, with a link to each.

### 🎮 Tic Tac Toe (`tictactoe.html` + `src/tictactoe.ts`)
- Two players enter their names, then take turns placing X and O on a 3×3 board.
- The game checks every move for three in a row (rows, columns and diagonals) or a draw.
- The status message uses the players' real names, e.g. *"Sam's turn (O)"* or *"Alex wins!"*.
- **Play again** starts a new game with the same names; **Change players** goes back to the name form.
- Optional sound effects can be turned on with a checkbox. They are **off by default** so the page never makes a surprise noise.

### 🎵 Music (`music.html`)
A calm break page with one song, *Rock your ABC's*. It uses the browser's built-in audio player, so it needs no JavaScript. The music never plays automatically.

### 🪙 MoneyBox (`moneybox.html` + `src/moneybox.ts`)
- Add money you receive (**Money in**) or spend (**Money out**) with a short description.
- See your **Balance**, total **Money in** and total **Money out** at the top of the page.
- Set a **savings goal** and watch a progress bar fill up.
- View and delete entries in the **History** list.
- Your data is **saved in your browser** (using `localStorage`), so it's still there when you come back.

---

## Key design decisions

**Money is stored in cents, not euros.**
Computers can't store some decimal numbers exactly (in JavaScript, `0.1 + 0.2` gives `0.30000000000000004`). Storing €2.50 as `250` cents keeps every calculation exact.

**The balance can never go below zero.**
You can't spend more than you have, and you can't delete money that's already been spent. This keeps the tracker realistic.

**Input is checked twice.**
The HTML forms have rules (`required`, `min`, `step`), but these can be skipped, so the JavaScript checks every value again before using it.

**Saved data is checked before it's loaded.**
If the saved data is broken or has been changed, MoneyBox starts empty and shows a message instead of crashing.

**User text is shown safely.**
Descriptions are added with `textContent` instead of `innerHTML`, so if someone types HTML code it is shown as plain text and can't run on the page.

**One shared stylesheet.**
Every page uses `style.css`, so the whole site looks the same and a change in one place updates every page.

---

## Accessibility

I wanted the site to work for everyone, including keyboard and screen reader users:

- **Real buttons** for the board squares, so they work with the Tab, Enter and Space keys.
- **`aria-label`s** describe things that have no visible text, e.g. *"Square 5, X"* or *"Delete Snacks"*.
- **Live status messages** (`role="status"`, `aria-live="polite"`) so screen readers announce turns, results and errors.
- **`aria-current="page"`** marks the current page in the menu, for both screen readers and the visual highlight.
- **Keyboard focus is managed**, e.g. focus moves to the next free square after a move, and to *Play again* when a game ends.
- **A clear focus outline** (`:focus-visible`) shows keyboard users where they are.
- **Labels on every form field**, and the page language is set with `lang="en"`.
- **Strong colour contrast** between text and background.

---

## Responsive design

The site works on phones, tablets and computers:

- On screens **800px or narrower**, the menu moves onto its own row so the links aren't squashed.
- On screens **650px or narrower**, the cards stack into one column.
- On screens **400px or narrower**, the header is centred and the menu links get slightly smaller padding.

---

## Technologies used

- **HTML5** – page structure
- **CSS3** – layout (Flexbox and Grid), styling and media queries
- **TypeScript** – game logic, calculations, form checking and saving data (compiled to JavaScript)
- **Node.js and npm** – installing TypeScript and running the build
- **localStorage** – saving MoneyBox data in the browser

No frameworks or libraries were used. TypeScript is only a development tool: the browser runs the compiled JavaScript.

---

## Limitations and future ideas

- The language selector only has **English** for now. It's built so more languages can be added later.
- MoneyBox data is saved **only in the browser it was entered in**. It won't appear on another device, and clearing the browser data deletes it.
- Possible improvements:
  - Add more languages (e.g. Spanish).
  - Add a one-player mode against the computer in Tic Tac Toe, and a score counter.
  - Add more songs to the Music page.
  - Add categories or dates to MoneyBox entries.

---

## Credits

- **Music:** *Rock your ABC's* by Brad Priore, from [Pixabay](https://pixabay.com/).
- **Game sound effects:** from [Pixabay](https://pixabay.com/)
