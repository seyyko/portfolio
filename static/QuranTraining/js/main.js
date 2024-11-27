// constant nightmares - aka the stuff we have to deal with.

const navBar = document.getElementById('navbar');
const menuBtn = document.querySelector('.menu');
const upperLayer = document.querySelector('.upper-layer');
const lowerLayer = document.querySelector('.lower-layer');

const floatingMenu = document.querySelector('.floating-menu');
const circles = document.querySelectorAll('.circle');

const tracker = document.querySelector('.tracker');
const currentCursor = document.querySelector('.currentCursor');
const hoverElements = document.querySelectorAll('.hover-cursor-event');
const scrollElements = document.querySelectorAll('.scroll-cursor-event');


// all cursor-related stuff
let mouseX = 0, mouseY = 0;
let trackerX = 0, trackerY = 0;

function updateCursor() {
  trackerX += (mouseX - trackerX) * 0.2;
  trackerY += (mouseY - trackerY) * 0.2;

  tracker.style.transform = `translate(${trackerX - tracker.offsetWidth / 2}px, ${trackerY - tracker.offsetHeight / 2}px)`;
  currentCursor.style.transform = `translate(${mouseX - currentCursor.offsetWidth / 2}px, ${mouseY - currentCursor.offsetHeight / 2}px)`;

  requestAnimationFrame(updateCursor);
}


// a boring parallax trick
function updateParallax() {
  const x = (window.innerWidth - mouseX) / 100;
  const y = (window.innerHeight - mouseY) / 100;

  circles.forEach((circle, index) => {
    const speed = index + 2;
    circle.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
}

// Listen to every move the user makes. Because we're attentive like that.
document.addEventListener('mousemove', (e) => {
  mouseX = e.pageX;
  mouseY = e.pageY;

  updateParallax();
});


// finally, some good interaction with the user
let isScrolling = false;

hoverElements.forEach((element) => {
  element.addEventListener('mouseenter', () => {
    isScrolling = currentCursor.classList.contains('scroll-state');
    currentCursor.classList.remove('scroll-state');
    currentCursor.classList.add('hovering');
  });

  element.addEventListener('mouseleave', () => {
    currentCursor.classList.remove('hovering');
    if (isScrolling) {
      currentCursor.classList.add('scroll-state');
    }
  });
});

scrollElements.forEach((element) => {
  element.addEventListener('mouseenter', () => {
    if (!currentCursor.classList.contains('hovering')) {
      currentCursor.classList.add('scroll-state');
    }
    isScrolling = true;
  });

  element.addEventListener('mouseleave', () => {
    currentCursor.classList.remove('scroll-state');
    isScrolling = false;
  });
});

function attachHoverEvents() {
  const hoverElements = document.querySelectorAll('.hover-cursor-event');

  hoverElements.forEach((element) => {
      element.addEventListener('mouseenter', () => {
          isScrolling = currentCursor.classList.contains('scroll-state');
          currentCursor.classList.remove('scroll-state');
          currentCursor.classList.add('hovering');
      });

      element.addEventListener('mouseleave', () => {
          currentCursor.classList.remove('hovering');
          if (isScrolling) {
              currentCursor.classList.add('scroll-state');
          }
      });
  });
}


requestAnimationFrame(updateCursor);


// theme-related crap
const currentTheme = localStorage.getItem('theme');

function changeMenuBg(color) {
    upperLayer.style.background = color;
    lowerLayer.style.background = color;
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        toggleMenu();
    }
});


// close your eyes till line 102, to keep your sanity.
function toggleMenu() {
    if (menuBtn.classList.contains('menu-opened')) {
        menuBtn.classList.remove('menu-opened');
        changeMenuBg("var(--background-tertiary)");
        navBar.style.transform = "translateY(calc(-100vh + 80px))";
    } else{
        menuBtn.classList.add('menu-opened');
        changeMenuBg("var(--menu-close-color)");
        navBar.style.transform = "translateY(-20vh)";
    }
}

if (currentTheme === 'light') {
    document.documentElement.classList.add('light-mode');
}

function toggleTheme() {
    document.documentElement.classList.toggle('light-mode');
    const theme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}


function deleteUserData() {
    if (confirm(gettext("Are you sure you want to delete all your data? This action cannot be undone."))) {
        localStorage.clear();
        alert(gettext("All your data has been deleted."));
        location.reload();
    }
}