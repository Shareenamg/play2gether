export {};
/*
  moneybox.js - The logic for the MoneyBox page
  This file:
    1. Finds the page elements and sets up the data.
    2. Has helper functions to format money and work out the balance.
    3. Saves and loads the data using localStorage (so it's still there after closing the page).
    4. Updates the page and deletes entries.
    5. Connects the forms to the code, then shows saved data when the page opens.

  IMPORTANT DECISION: I store all money as whole numbers of CENTS (e.g. €2.50 is stored as 250).
  This is because computers can't store some decimals exactly. For example, in JavaScript
  0.1 + 0.2 gives 0.30000000000000004. With whole cents the maths is always exact.
*/

// ---- 1. Elements and data ----
// Elements I use often, stored once at the start.
const moneyForm = document.getElementById('money-form') as HTMLFormElement;
const goalForm = document.getElementById('goal-form') as HTMLFormElement;
const message = document.getElementById('message') as HTMLParagraphElement;
const historyList = document.getElementById('history') as HTMLUListElement;
const storageMessage = document.getElementById('storage-message') as HTMLParagraphElement;

// The name the data is saved under in localStorage. "v1" (version 1) means that if I change
// how the data is stored in the future, I can use a new name and old data won't break the page.
const storageKey = 'play2gether-beginner-v1';
// The list of entries. Each one is an object like: { type: 'in', cents: 500, note: 'Pocket money' }
interface MoneyEntry {
  type: string;
  cents: number;
  note: string;
}
let entries: MoneyEntry[] = [];
// The savings goal. goalCents is 0 when no goal has been set.
let goalName = '';
let goalCents = 0;


// ---- 2. Helper functions ----

// Turns cents into a euro string for showing on the page, e.g. 250 -> "€2.50".
// toFixed(2) always shows two decimal places, so €2.5 becomes €2.50.
function money(cents: number) {
  return '€' + (cents / 100).toFixed(2);
}

// Works out the current balance: add all "in" entries and subtract all "out" entries.
function getBalance() {
  let balance = 0;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].type === 'in') balance += entries[i].cents;
    else balance -= entries[i].cents;
  }
  return balance;
}


// ---- 3. Saving and loading ----

// Saves entries and the goal in the browser's localStorage.
// localStorage can only store text, so JSON.stringify turns the data into a text string first.
function saveData() {
  const data = { entries: entries, goalName: goalName, goalCents: goalCents };
  // try/catch because saving can fail (e.g. private browsing or storage is full).
  // If it fails, the page still works and tells the user their changes won't be kept.
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    storageMessage.textContent = 'Entries and goal are saved in this browser.';
  } catch (error) {
    storageMessage.textContent = 'Saving is unavailable. Changes last until this page closes.';
  }
}

// Loads saved data when the page opens.
// I check the data carefully before using it, because saved data could be damaged or
// changed by hand, and bad data could break the page or show wrong totals.
function loadData() {
  try {
    const saved = localStorage.getItem(storageKey);
    // Nothing saved yet (first visit), so keep the empty starting values.
    if (!saved) return;
    // Turn the saved text back into an object.
    const data = JSON.parse(saved);
  
    // Check the overall shape: entries must be a list, the goal name must be text,
    // and the goal must be a whole, non-negative number of cents.
    // "throw" jumps straight to the catch block below.
    if (!Array.isArray(data.entries) || typeof data.goalName !== 'string' ||
        !Number.isSafeInteger(data.goalCents) || data.goalCents < 0) {
      throw new Error('Invalid saved data');
    }
    // Check every single entry, and add up the balance at the same time.
    let balance = 0;
    for (let i = 0; i < data.entries.length; i++) {
      const entry = data.entries[i];
      // Each entry must exist, be "in" or "out", have a whole positive amount no bigger
      // than €1,000,000 (100000000 cents, the same limit as the form), and have a text note.
      if (!entry || (entry.type !== 'in' && entry.type !== 'out') ||
          !Number.isSafeInteger(entry.cents) || entry.cents <= 0 ||
          entry.cents > 100000000 || typeof entry.note !== 'string') {
        throw new Error('Invalid saved entry');
      }
      if (entry.type === 'in') balance += entry.cents;
      else balance -= entry.cents;
    }
    // The app never allows a negative balance, so if the saved data has one, something is wrong.
    if (balance < 0) throw new Error('Invalid balance');
    // Everything is valid, so it is safe to use the data.
    entries = data.entries;
    goalName = data.goalName;
    goalCents = data.goalCents;
    // Fill the goal form with the saved goal so the user can see and edit it.
    (document.getElementById('goal-name') as HTMLInputElement).value = goalName;
    if (goalCents > 0)(document.getElementById('goal-amount') as HTMLInputElement).value = String(goalCents / 100);
  } catch (error) {
    // Any problem (broken JSON, invalid data, storage blocked): start with an empty tracker
    // and tell the user, instead of crashing.
    storageMessage.textContent = 'Saved data could not be loaded. This tracker starts empty.';
  }
}


// ---- 4. Updating the page ----

// Redraws everything on the page from the data: the history list, the totals and the goal.
// I call this after every change, so the page always matches the data.
function updatePage() {
  let incoming = 0;
  let outgoing = 0;
  // Empty the list first, then rebuild it, so entries are never shown twice.
  historyList.textContent = '';
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    // Work out the totals and choose the sign to show (+ for in, − for out).
    let sign = '+';
    if (entry.type === 'in') incoming += entry.cents;
    else {
      outgoing += entry.cents;
      sign = '−';
    }
    // Create a list item like "Snacks: −€1.50".
    // I use textContent (not innerHTML) so if someone types HTML code in the description,
    // it is shown as plain text and can't run on the page. This is safer.
    const item = document.createElement('li');
    item.textContent = entry.note + ': ' + sign + money(entry.cents);
    // Add a Delete button to each entry.
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    // Every button just says "Delete", so the aria-label adds which entry it deletes,
    // e.g. "Delete Snacks", so screen reader users know which one they're on.
    deleteButton.setAttribute('aria-label', 'Delete ' + entry.note);
    // When clicked, delete the entry at this position (i).
    deleteButton.addEventListener('click', function () { deleteEntry(i); });
    item.appendChild(deleteButton);
    historyList.appendChild(item);
  }
  // Show the three totals at the top of the page.
  const balance = incoming - outgoing;
  document.getElementById('balance')!.textContent = money(balance);
  document.getElementById('money-in')!.textContent = money(incoming);
  document.getElementById('money-out')!.textContent = money(outgoing);
  // Hide "No entries yet." when there is at least one entry.
  document.getElementById('empty')!.hidden = entries.length > 0;
  // Only update the goal if one has been set (also avoids dividing by zero).
  if (goalCents > 0) {
    document.getElementById('goal-text')!.textContent =
      goalName + ': ' + money(balance) + ' of ' + money(goalCents);
    // Percentage of the goal reached. Math.min caps it at 100 so the bar never goes over full.
    (document.getElementById('progress') as HTMLProgressElement).value = Math.min(100, balance / goalCents * 100);
  }
}

// Deletes one entry after checking it is allowed.
function deleteEntry(index: number) {
  // Deleting money that came IN lowers the balance. If that would make the balance negative
  // (because some of that money was already spent), I block it and explain why.
  if (entries[index].type === 'in' && entries[index].cents > getBalance()) {
    message.textContent = 'Delete spending first so the balance stays above zero.';
    return;
  }
  // Ask the user to confirm, because a delete can't be undone.
  if (!window.confirm('Delete this entry?')) return;
  entries.splice(index, 1); // Remove one entry at this position.
  // Save the change, redraw the page and confirm it worked.
  saveData();
  updatePage();
  message.textContent = 'Entry deleted.';
  // The Delete button that was clicked no longer exists, so move focus somewhere useful.
  document.getElementById('amount')!.focus();
}


// ---- 5. Event listeners ----

// When a new entry is submitted...
moneyForm.addEventListener('submit', function (event) {
  // Stop the page reloading so the data isn't lost.
  event.preventDefault();
  const type = (document.getElementById('type') as HTMLSelectElement).value;
  // Input values are always text, so Number() turns the amount into a number.
  const amount = Number((document.getElementById('amount') as HTMLInputElement).value);
  // Change euros to whole cents. Math.round fixes tiny decimal errors (e.g. 2.5 * 100).
  const cents = Math.round(amount * 100);
  const note = (document.getElementById('note') as HTMLInputElement).value.trim();
  // Check the input again in JavaScript, because HTML rules (min, step, required) can be skipped.
  // The amount must be a real number, more than 0, at most €1,000,000, and have no more than
  // 2 decimal places (if amount*100 isn't almost exactly a whole number, there were too many decimals).
  // The description can't be empty.
  if (!Number.isFinite(amount) || cents <= 0 || cents > 100000000 ||
      Math.abs(amount * 100 - cents) > 0.00001 || !note) {
    message.textContent = 'Enter a description and a positive amount with up to two decimal places.';
    return;
  }
  // You can't spend money you don't have, so the balance never goes below zero.
  if (type === 'out' && cents > getBalance()) {
    message.textContent = 'You cannot spend more than your balance.';
    return;
  }
  // Everything is valid: add the entry, save, redraw, clear the form and confirm.
  entries.push({ type: type, cents: cents, note: note });
  saveData();
  updatePage();
  moneyForm.reset();
  message.textContent = 'Entry added.';
  // Put the cursor back in the amount box, ready for the next entry.
  document.getElementById('amount')!.focus();
});
// When a savings goal is submitted...
goalForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const name = (document.getElementById('goal-name') as HTMLInputElement).value.trim();
  const amount = Number((document.getElementById('goal-amount') as HTMLInputElement).value);
  const cents = Math.round(amount * 100);
  // Same checks as for entries: a name, and a valid positive amount with up to two decimals.
  if (!name || !Number.isFinite(amount) || cents <= 0 || cents > 100000000 ||
      Math.abs(amount * 100 - cents) > 0.00001) {
    document.getElementById('goal-text')!.textContent = 'Enter a name and a positive target with up to two decimal places.';
    return;
  }
  // Save the new goal and update the progress bar.
  goalName = name;
  goalCents = cents;
  saveData();
  updatePage();
});

// Show saved data when the page opens.
// First load anything saved before, then draw the page with it.
loadData();
updatePage();
