const serverVersion = '2.2'; // Version provenant du serveur
const clientVersion = localStorage.getItem('localStorageVersion');

if (clientVersion !== serverVersion) {
    localStorage.clear();
    localStorage.setItem('localStorageVersion', serverVersion);
    console.log('LocalStorage has been reset to match server version.');
}

/**
 * Clears all data from IndexedDB.
 * @returns {Promise<void>} Resolves when all data has been cleared.
 */
function clearIndexedDB() {
  return openDatabase().then((db) => {
      return new Promise((resolve, reject) => {
          const transaction = db.transaction(db.objectStoreNames, 'readwrite');
          transaction.oncomplete = () => resolve();
          transaction.onerror = (event) => reject(event.target.error);

          // Delete all objects in each store
          for (const storeName of db.objectStoreNames) {
              const store = transaction.objectStore(storeName);
              store.clear();
          }
      });
  });
}

// theme
const currentTheme = localStorage.getItem('theme');
// cursor
const tracker = document.querySelector('.tracker');
const currentCursor = document.querySelector('.currentCursor');
// navbar
const navbar = document.getElementById('navbar');
const menuBtn = document.querySelector('.menu');
const upperLayer = document.querySelector('.upper-layer');
const lowerLayer = document.querySelector('.lower-layer');
// header
const floatingMenu = document.querySelector('.floating-menu');
const circles = document.querySelectorAll('.circle');


let mouseX = 0, 
    mouseY = 0, 
  trackerX = 0, 
  trackerY = 0;
let isScrolling = false;


// Utility functions

/**
 * Updates custom cursor position.
 */
function updateCursor() {
  trackerX += (mouseX - trackerX) * 0.2;
  trackerY += (mouseY - trackerY) * 0.2;

  tracker.style.transform = `translate(${trackerX - tracker.offsetWidth / 2}px, ${trackerY - tracker.offsetHeight / 2}px)`;
  currentCursor.style.transform = `translate(${mouseX - currentCursor.offsetWidth / 2}px, ${mouseY - currentCursor.offsetHeight / 2}px)`;

  requestAnimationFrame(updateCursor);
}

/**
 * Updates the parallax effect on circles (header).
 */
function updateParallax() {
  if (window.innerWidth < 768) { // No parallax effect on mobile.
    return
  }
  const x = (window.innerWidth - mouseX) / 100;
  const y = (window.innerHeight - mouseY) / 100;

  circles.forEach((circle, index) => {
    const speed = index + 2; // Each circle has its own speed.
    circle.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
}

/**
 * Changes the color of the menu logo.
 * @param {string} color - css color.
 */
function changeMenuLogoColor(color) {
    upperLayer.style.background = color;
    lowerLayer.style.background = color;
}

/**
 * Switch the state of the navbar.
 */
function toggleMenu() {
  const isOpened = menuBtn.classList.toggle('opened-menu');
  const color = isOpened ? "var(--menu-close-color)" : "var(--background-tertiary)";
  const transform = isOpened ? "translateY(-20vh)" : "translateY(calc(-100vh + 80px))";

  changeMenuLogoColor(color);
  navbar.style.transform = transform;
}

/**
 * Switch the theme (light/dark).
 */
function toggleTheme() {
    document.documentElement.classList.toggle('light-mode');
    const theme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}

/**
 * Prevents scrolling when loading animation is on
 */
function preventScrollingWhenLoading() {
  const loadingScreen = document.getElementById('loading-screen');

    document.body.classList.add('block-scroll');

    loadingScreen.addEventListener('animationend', () => {
        document.body.classList.remove('block-scroll');
  });
}

/**
 * Deletes all user data (localStorage and IndexedDB).
 */
function deleteUserData() {
  const confirmationMessage = gettext("Are you sure you want to delete all your data? This action cannot be undone.");
  const successMessage = gettext("All your data has been deleted.");

  if (confirm(confirmationMessage)) {
      // Clear localStorage
      localStorage.clear();

      // Clear all data from IndexedDB
      clearIndexedDB()
          .then(() => {
              alert(successMessage);
              location.reload();
          })
          .catch((error) => {
              console.error("Error clearing IndexedDB:", error);
              alert(gettext("An error occurred while deleting your data."));
          });
  }
}

/**
 * Attaches "mouseenter" and "mouseleave" events to the given elements.
 */
function attachCursorEvents() {
  const hoverElements = document.querySelectorAll('.hover-cursor-event');
  const scrollElements = document.querySelectorAll('.scroll-cursor-event');
  
  hoverElements.forEach((element) => {
      element.addEventListener('mouseenter', handleHoverEnter);
      element.addEventListener('mouseleave', handleHoverLeave);
  });
  scrollElements.forEach((element) => {
    element.addEventListener('mouseenter', handleScrollEnter);
    element.addEventListener('mouseleave', handleScrollLeave);
});
}

// Handlers for hoverable elements
function handleHoverEnter() {
  isScrolling = currentCursor.classList.contains('scroll-state');
  currentCursor.classList.remove('scroll-state');
  currentCursor.classList.add('hovering');
}
function handleHoverLeave() {
  currentCursor.classList.remove('hovering');
  if (isScrolling) {
      currentCursor.classList.add('scroll-state');
  }
}

// Handlers for scrollable elements
function handleScrollEnter() {
  if (!currentCursor.classList.contains('hovering')) {
      currentCursor.classList.add('scroll-state');
  }
  isScrolling = true;
}
function handleScrollLeave() {
  currentCursor.classList.remove('scroll-state');
  isScrolling = false;
}

/**
* Tracks mouse position and triggers the parallax update.
* 
* @param {MouseEvent} event - The mousemove event.
*/
function handleMouseMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  updateParallax();
}

/**
* Handles key press events. Toggles the menu when "Escape" is pressed.
* 
* @param {KeyboardEvent} event - The keydown event.
*/
function handleKeyPress(event) {
  if (event.key === 'Escape') {
      toggleMenu();
  }
}

//Handles global events for mouse movement and key presses.
function initializeGlobalEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('keydown', handleKeyPress);
}

attachCursorEvents();
requestAnimationFrame(updateCursor);
initializeGlobalEventListeners();

if (currentTheme === 'light') document.documentElement.classList.add('light-mode');
document.addEventListener("DOMContentLoaded", preventScrollingWhenLoading);