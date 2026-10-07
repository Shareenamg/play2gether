# Play2gether: JavaScript to TypeScript Migration

**Author:** Shareena Goulbourn
**Date:** 7/10/2026
**Branch:** `version-typescript`

The Play2gether website's logic now runs on TypeScript: 2 JavaScript files converted, 93 compiler errors fixed, 0 left.

| File | Errors at first build | Errors at the end |
| --- | --- | --- |
| `tictactoe.js` → `src/tictactoe.ts` | 44 | 0 |
| `moneybox.js` → `src/moneybox.ts` | 49 | 0 |
| **Total** | **93** | **0** |

All errors came from `"strict": true` in `tsconfig.json`. Strict mode makes TypeScript check every value that could be missing or of an unknown type, so it reports more errors, but each one is a place where the code was relying on luck.

### Errors after each build

| Build | Errors | What changed before this build |
| --- | --- | --- |
| 1 | 93 | First build after renaming the files to `.ts` |
| 2 | 53 | `tictactoe.ts`: element declarations and function parameters typed |
| 3 | 36 | `tictactoe.ts` finished (0 errors) |
| 4 | 14 | `moneybox.ts`: elements and inputs typed |
| 5 | 2 | Two syntax slips left |
| 6 | 13 | Fixing the syntax errors revealed hidden type errors |
| 7 | **0** | `MoneyEntry` interface added |

The count dropped fastest when the element declarations at the top of each file were fixed, because every line using those elements was fixed at once.

---

## Setting up the environment

The browser cannot run TypeScript, so `.ts` files in `src/` are compiled into `.js` files in `dist/`, and the HTML loads the `dist/` files.

1. Created the branch from the terminal with `git checkout -b version-typescript` and published it with `git push -u origin version-typescript`.
2. Checked Node.js (v24.21.0) and npm (11.19.0) were installed.
3. Ran `npm init -y` to create `package.json`.
4. Installed TypeScript as a development dependency: `npm install --save-dev typescript` (version 7.0.2).
5. Created `tsconfig.json` with `rootDir: "src"`, `outDir: "dist"`, `lib: ["DOM", "ES2020"]` and `strict: true`.
6. Added npm scripts: `npm run build` (runs `tsc` once) and `npm run watch` (runs `tsc --watch`, recompiling on every save).
7. Created `.gitignore` with `node_modules/`, so the installed packages never go to GitHub; `npm install` rebuilds them from `package.json`.
8. Moved both `.js` files into `src/`, renamed them to `.ts`, and added `export {};` at the top of each so each file is its own module and names cannot clash between them.
9. Changed the script tags to `<script type="module" src="dist/tictactoe.js"></script>` and `dist/moneybox.js`.
10. Fixed the errors (next sections), tested both pages with Live Server, then committed and pushed. The only console message was a harmless `favicon.ico 404`: the browser asks for a tab icon the site does not have.

---

## tictactoe.ts: 44 errors

The 44 errors were only 4 kinds, and most were fixed by changing the 6 element declarations at the top of the file, because every later line that used those elements inherited the fix.

| Kind of error | Code | Count | What it means | How we fixed it | Example (before → after) |
| --- | --- | --- | --- | --- | --- |
| Element might be `null` | TS18047, TS2531 | 24 | `getElementById` returns `null` if no element has that id, so TypeScript will not let you use the result without checking. | `as` on the declarations at the top; `!` on one-off lines that only use `.textContent` or `.focus()`. | `getElementById('sound-message').textContent` → `getElementById('sound-message')!.textContent` |
| Property does not exist on `HTMLElement` | TS2339 | 9 | TypeScript only knows it is *some* HTML element. Only inputs have `.value` and `.checked`, only buttons `.disabled`, only audio `.play()`. | `as` with the real element type, in brackets when a `.property` follows. | `getElementById('restart')` → `getElementById('restart') as HTMLButtonElement`; `(getElementById('player-x') as HTMLInputElement).value` |
| Property does not exist on `Element` (the 9 squares) | TS2339 | 7 | `querySelectorAll` returns a list of generic `Element`s, which have no `.disabled` or `.focus()`. | Told `querySelectorAll` what is inside the list with angle brackets. | `querySelectorAll('.square')` → `querySelectorAll<HTMLButtonElement>('.square')` |
| Parameter has no type | TS7006 | 4 | A function parameter with no type is `any`, which strict mode does not allow. | Found where each function is called and typed the parameter by what it receives. | `makeMove(index)` → `makeMove(index: number)`; `playSound(id: string)`; `finishGame(message: string, sound: string)` |

Element types used: `HTMLButtonElement` (restart, change players, squares), `HTMLInputElement` (sound checkbox, name boxes), `HTMLFormElement` (player form), `HTMLAudioElement` (sounds), `HTMLElement` or `!` (status text).

---

## moneybox.ts: 49 errors

The 49 errors were 4 kinds again, with one new concept: an `interface` to describe the shape of each money entry, which fixed 9 errors with one definition.

| Kind of error | Code | Count | What it means | How we fixed it | Example (before → after) |
| --- | --- | --- | --- | --- | --- |
| Element might be `null` | TS18047, TS2531 | 29 | Same as in tictactoe: `getElementById` may return `null`. | `as` on the 5 declarations at the top, matching each HTML tag; `!` on text-only lines. | `getElementById('message')` → `getElementById('message') as HTMLParagraphElement`; `getElementById('balance')!.textContent` |
| Property does not exist on `HTMLElement` | TS2339, TS2551 | 9 | `.value` exists only on inputs, selects and progress bars; `.reset()` only on forms. | `as` with the real type, in brackets. | `(getElementById('note') as HTMLInputElement).value`; `type` → `HTMLSelectElement`; `progress` → `HTMLProgressElement`; `money-form` → `HTMLFormElement` |
| `entries` is an array of `any` | TS7034, TS7005 | 9 | `let entries = []` says nothing about what goes in the array, so TypeScript gives up. | Wrote an `interface MoneyEntry` and typed the array with it. | `let entries = [];` → `let entries: MoneyEntry[] = [];` |
| Parameter has no type | TS7006 | 2 | Same as in tictactoe. | Typed by what the function receives. | `money(cents: number)`; `deleteEntry(index: number)` |

The interface came straight from a comment already in the code, `{ type: 'in', cents: 500, note: 'Pocket money' }`:

```typescript
interface MoneyEntry {
  type: string;   // 'in' or 'out'
  cents: number;  // 500
  note: string;   // 'Pocket money'
}

let entries: MoneyEntry[] = [];
```

The element types had to match the real tags in `moneybox.html`: `<p>` → `HTMLParagraphElement`, `<ul>` → `HTMLUListElement`, `<form>` → `HTMLFormElement`, `<input>` → `HTMLInputElement`, `<select>` → `HTMLSelectElement`, `<progress>` → `HTMLProgressElement`.

---

## Errors that appeared while fixing

Fixing errors sometimes created new ones; each taught something, and one caught a real bug.

| Error | Code | Cause | Fix | Lesson |
| --- | --- | --- | --- | --- |
| Type `number` is not assignable to type `string` (line 109) | TS2322 | An input's `.value` is always text, but `goalCents / 100` is a number. | `String(goalCents / 100)` | **A real bug caught.** JavaScript converted it silently; TypeScript made the conversion visible. |
| Property `type` does not exist on type `number` (12 errors) | TS2339, TS2345 | `entries` was typed as an array of numbers, not of entry objects. | `let entries: MoneyEntry[] = [];` | One wrong type on one line can produce many errors elsewhere. |
| Cannot find name `MoneyEntry` | — (red underline) | The type was used before it was defined. | Added the `interface MoneyEntry { … }` above it. | A type must be defined before use, like a class in Java. |
| Cannot find name `HTMLListElement` | TS2552 | Typo in the type name. | `HTMLUListElement` (U for unordered, `<ul>`). | Read the suggestion in the error message. |
| `';' expected` / `',' expected` | TS1005 | `String: goalCents / 100` and `money(entry.cents: Number)`. | `String(goalCents / 100)` and `money(entry.cents)` | The colon `:` is only for declaring types, never when calling a function. |
| Wrong element type (no error shown) | — | `<p>` and `<ul>` elements were typed as `HTMLInputElement`. | `HTMLParagraphElement`, `HTMLUListElement` | It compiled, but the type was untrue and would have allowed `.value` on a paragraph. Types must match the real HTML tag. |

The count rose from 2 to 13 at one point because syntax errors (TS1005) stop TypeScript before it checks types; fixing them revealed type errors that had been hidden behind them.

---

## Key lessons

- **Many errors, few kinds.** 93 errors were really 5 kinds; fix the declaration at the top and every line using it is fixed too.
- **`as` or `!`?** Only "possibly null" → `!`. A missing property like `.value` → `as` with the real element type.
- **Brackets with `as`.** When a property follows, wrap it: `(document.getElementById('x') as HTMLInputElement).value`.
- **Types follow the HTML tag.** Check the tag in the HTML file before choosing the type.
- **Type parameters by detective work.** Find where the function is called and look at what is passed in.
- **`:` declares, never calls.** `function money(cents: number)` is right; `money(entry.cents: Number)` is wrong.
- **An interface describes a shape.** One `interface` fixed every error about what is inside `entries`.
- **TypeScript finds real bugs.** The number-into-text mismatch on line 109 was hidden in the JavaScript version.
