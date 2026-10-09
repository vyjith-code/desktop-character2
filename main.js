const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let win;
let reminderTimer = null;

// ===============================
// TEST MODE
// ===============================

// true  = 10 seconds
// false = 30 minutes

const TEST_MODE = false;


const REMINDER_INTERVAL = 30 * 60 * 1000;

// ===============================
// CREATE WINDOW 
// ===============================

function createWindow() {


const display = screen.getPrimaryDisplay();
const { width, height } = display.workAreaSize;

win = new BrowserWindow({
    width: 360,
    height: 500,

    x: -320,
    y: height - 380,

    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,

    show: false,

   webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      autoplayPolicy: 'no-user-gesture-required'
}
});

win.loadFile('index.html');

// First reminder
scheduleNextReminder();


}

// ===============================
// SCHEDULE NEXT REMINDER
// ===============================

function scheduleNextReminder() {


if (reminderTimer) {
    clearTimeout(reminderTimer);
}

reminderTimer = setTimeout(() => {
    showReminder();
}, REMINDER_INTERVAL);


}

// ===============================
// SHOW REMINDER
// ===============================

function showReminder() {

if (!win || win.isDestroyed()) return;

const display = screen.getPrimaryDisplay();
const { height } = display.workAreaSize;

// Start outside left
const startX = -320;
const groundY = height - 380;

win.setPosition(startX, groundY);

win.show();

// Tell renderer to reset character
win.webContents.send('show-character');

// Fly / enter from left
flyIn(startX, 80, () => {

    // Character reached position
    win.webContents.send('show-reminder');

});


}

// ===============================
// FLY IN FROM LEFT
// ===============================

function flyIn(startX, targetX, callback) {


if (!win || win.isDestroyed()) return;

let x = startX;

const display = screen.getPrimaryDisplay();
const { height } = display.workAreaSize;

const groundY = height - 380;

const timer = setInterval(() => {

    if (!win || win.isDestroyed()) {
        clearInterval(timer);
        return;
    }

    x += 7;

    if (x >= targetX) {

        x = targetX;

        win.setPosition(x, groundY);

        clearInterval(timer);

        // Character arrived
        win.webContents.send('character-arrived');

        if (callback) {
            callback();
        }

        return;
    }

    win.setPosition(x, groundY);

}, 20);


}

// ===============================
// USER CLICKED OK
// ===============================

ipcMain.on('reminder-ok', () => {


if (!win || win.isDestroyed()) return;

// Hide popup
win.webContents.send('hide-reminder');

// Tell character to prepare flying animation
win.webContents.send('start-flying');

// Small delay so animation changes to Superman pose
setTimeout(() => {

    flyOut();

}, 150);


});



// ===============================
// FLY TO RIGHT - SAME HEIGHT
// ===============================

function flyOut() {

    if (!win || win.isDestroyed()) return;

    const display = screen.getPrimaryDisplay();
    const { width } = display.workAreaSize;

    let [x, y] = win.getPosition();

    const targetX = width + 50;

    const timer = setInterval(() => {

        if (!win || win.isDestroyed()) {
            clearInterval(timer);
            return;
        }

        // Move horizontally only
        x += 12;

        // Keep the same vertical position
        win.setPosition(
            Math.round(x),
            y
        );

        // Finished leaving the screen
      if (x >= targetX) {
  clearInterval(timer);

  win.webContents.send('stop-exit-sound');
  win.hide();
  win.webContents.send('reset-character');

  scheduleNextReminder();
}

    }, 20);
}





// ===============================
// APP READY
// ===============================

app.whenReady().then(createWindow);

// ===============================
// CLEANUP
// ===============================

app.on('window-all-closed', () => {


if (process.platform !== 'darwin') {
    app.quit();
}


});
