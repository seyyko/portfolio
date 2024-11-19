// constant nightmares - aka the stuff we have to deal with.

const navBar = document.getElementById('navbar');
const menuBtn = document.querySelector('.menu');
const upperLayer = document.querySelector('.upper-layer');
const lowerLayer = document.querySelector('.lower-layer');

const floatingMenu = document.querySelector('.floating-menu');
const circles = document.querySelectorAll('.circle');
// Because what's a website without random floating circles?

const tracker = document.querySelector('.tracker');
const currentCursor = document.querySelector('.currentCursor'); // The currentCursor - always knows where you are.
const hoverElements = document.querySelectorAll('.hover-cursor-event');


// all cursor-related stuff - basically, making the cursor feel special.
let mouseX = 0, mouseY = 0;     // The classic duo: X and Y.
let trackerX = 0, trackerY = 0; // The wannabe coordinates, trying to catch up with the real ones.

function updateCursor() {
  // The pursuit: tracker tries to reach mouse position but... slowly. Drama is important.
  trackerX += (mouseX - trackerX) * 0.2; // Slow and steady wins the race (not really).
  trackerY += (mouseY - trackerY) * 0.2;

  // The tracker follows like a loyal puppy, but one that lags a bit.
  // Meanwhile, the currentCursor is right on your tail, like that one friend who always wants to hang out.
  tracker.style.transform = `translate(${trackerX - tracker.offsetWidth / 2}px, ${trackerY - tracker.offsetHeight / 2}px)`;
  currentCursor.style.transform = `translate(${mouseX - currentCursor.offsetWidth / 2}px, ${mouseY - currentCursor.offsetHeight / 2}px)`;

  // Keep the party going. Never stop. Never look back.
  requestAnimationFrame(updateCursor);
}


// a boring parallax trick - but hey, it looks cool.
function updateParallax() {
  const x = (window.innerWidth - mouseX) / 100; // The further you go, the more it shifts. Life lessons, right?
  const y = (window.innerHeight - mouseY) / 100;

  // Move those circles around like you're some kind of digital puppeteer.
  circles.forEach((circle, index) => {
    const speed = index + 1; // Speed increases with every circle. Because we can.
    circle.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
}

// Listen to every move the user makes. Because we're attentive like that.
document.addEventListener('mousemove', (e) => {
  mouseX = e.pageX;
  mouseY = e.pageY;

  updateParallax(); // Trigger the parallax illusion. Make them think your site is alive.
});


// finally, a good interaction with the user - because we care (or pretend to).
hoverElements.forEach((element) => {
  // Hover state: make the cursor feel important for a second.
  element.addEventListener('mouseenter', () => {
    currentCursor.classList.add('hovering'); // Ooooh, shiny!
  });

  // Leave state: back to being ordinary.
  element.addEventListener('mouseleave', () => {
    currentCursor.classList.remove('hovering'); // Boring again.
  });
});

requestAnimationFrame(updateCursor);


// theme-related crap - because dark mode is the only correct mode.
const currentTheme = localStorage.getItem('theme');

function changeMenuBg(color) {
    upperLayer.style.background = color;
    lowerLayer.style.background = color;
}

document.addEventListener('keydown', function(event) {
    // Because users love pressing random keys, let's react to it.
    if (event.key === 'Escape') {
        toggleMenu(); // Open or close, depending on your mood.
    }
});


// close your eyes till line 102, to keep your sanity.
// This function is here to toggle the menu. Yes, it’s a cliché.
function toggleMenu() {
    if (menuBtn.classList.contains('menu-opened')) {
        menuBtn.classList.remove('menu-opened');
        changeMenuBg("var(--background-tertiary)");                 // Back to the boring background.
        navBar.style.transform = "translateY(calc(-100vh + 80px))"; // Send it to the shadow realm.
    } else{
        menuBtn.classList.add('menu-opened');
        changeMenuBg("var(--menu-close-color)");        // Change the background to something spicy.
        navBar.style.transform = "translateY(-20vh)";   // Bring it down a notch.
    }
}


// If the current theme is 'light', we're going to flaunt it.
if (currentTheme === 'light') {
    document.documentElement.classList.add('light-mode');
}

// Toggle the theme and save it to localStorage. Because preferences matter... sometimes.
function toggleTheme() {
    document.documentElement.classList.toggle('light-mode');
    const theme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme); // Store it so we remember your questionable choices.
}


function deleteUserData() {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
        localStorage.clear();                       // Boom! Everything is gone.
        alert("All your data has been deleted.");   // Sorry, not sorry.
        location.reload();                          // And let's refresh for good measure.
    }
}