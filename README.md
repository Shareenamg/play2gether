# Play2gether

Play2gether is a small website I built with HTML, CSS and JavaScript. It gives people three simple activities in one place: a two-player **Tic Tac Toe** game, a **Music** break page, and a **MoneyBox** pocket money tracker.

The site's slogan is *"Play, relax, and grow."*

**Author:** Shareena Goulbourn
**Course:** Estudiante de 2.º año de FP Superior en DAM en Ucademy. Prácticas en Music Well Tech: 1.ª tarea.
**Date:** 5/10/2026

---

## How to run it

1. Download or copy the project folder so all the files are together (see the folder structure below).
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge or Safari).

That's it. There is nothing to install, and it doesn't need a server or an internet connection.

> **Note:** JavaScript must be turned on for Tic Tac Toe and MoneyBox to work.

---

## Folder structure

```
play2gether/
├── index.html        Home page with links to the three activities
├── tictactoe.html    Tic Tac Toe page (layout)
├── tictactoe.js      Tic Tac Toe game logic
├── music.html        Music break page
├── moneybox.html     MoneyBox page (layout)
├── moneybox.js       MoneyBox logic (totals, goal, saving)
├── style.css         One stylesheet shared by every page
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

### 🎮 Tic Tac Toe (`tictactoe.html` + `tictactoe.js`)
- Two players enter their names, then take turns placing X and O on a 3×3 board.
- The game checks every move for three in a row (rows, columns and diagonals) or a draw.
- The status message uses the players' real names, e.g. *"Sam's turn (O)"* or *"Alex wins!"*.
- **Play again** starts a new game with the same names; **Change players** goes back to the name form.
- Optional sound effects can be turned on with a checkbox. They are **off by default** so the page never makes a surprise noise.

### 🎵 Music (`music.html`)
A calm break page with one song, *Rock your ABC's*. It uses the browser's built-in audio player, so it needs no JavaScript. The music never plays automatically.

### 🪙 MoneyBox (`moneybox.html` + `moneybox.js`)
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
- **JavaScript** – game logic, calculations, form checking and saving data
- **localStorage** – saving MoneyBox data in the browser

No frameworks or libraries were used.

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
