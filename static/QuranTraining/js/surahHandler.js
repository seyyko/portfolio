
function storeDataDirectly(key, data) {
    storeData(key, data)
        .then(() => console.log(`Data for ${key} stored in IndexedDB.`))
        .catch((error) => console.error('Error storing data in IndexedDB:', error));
}

function getDataDirectly(key, callback) {
    getData(key)
        .then((data) => {
            if (!data) {
                console.log("No data found in IndexedDB.");
                callback(null);
                return;
            }
            console.log("Data retrieval complete!");
            callback(data);
        })
        .catch((error) => {
            console.error('Error retrieving data from IndexedDB:', error);
            callback(null);
        });
}

function getLocalStorageSize() {
    let totalSize = 0;

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage[key];
            totalSize += key.length + value.length;
        }
    }

    console.log(`The total size of localStorage is approximately ${totalSize} bytes.`);
    return totalSize;
}

getLocalStorageSize();

// surah selection
const surahContainer = document.getElementById('surah');
const surahForm = document.querySelector('.surah-form');
const titleSurahContainer = document.querySelector('.title-surah-choice');
// verse preferences
const randomSurahSection = document.getElementById("training");
const versePreferencesContainer = document.querySelector('.verse-preferences');
const titleVersesPreferences = document.querySelector('.title-verses-preferences');
const verseDisplayContainer = document.querySelector(".verse-display-container");
// scroll
const scrollUpButton = document.querySelector('.scroll-up');
const targetDiv = document.querySelector('.verse-display');
// input (single mode)
const minInput = document.getElementById("min-input");
const valueInput = document.getElementById("value-input");

let versePreferenceSliderPos;
let modePreferenceSliderPos;
let selectedSurahsDict = null;

getDataDirectly('selected_surahs_dict', (result) => {
    selectedSurahsDict = result || {};
    console.log("Data loaded globally:", selectedSurahsDict);
});

let history = [];
let currentIndex = -1;
let anwserShowed = false;

let currentAudio = null;
let currentSource = ''; 

// Utility functions

/**
 * Toggles the background color of the button when a checkbox is clicked.
 * @param {HTMLElement} checkbox - The checkbox element that was clicked.
 */
function changeBtnBg(checkbox) {
    const label = checkbox.closest('label');
    label.classList.toggle("selected");
}

/**
 * Toggles the visibility of the Surah selection container and updates the UI.
 */
function toggleSurahChoice() {
    const isOpened = !titleSurahContainer.classList.toggle("opened-form");

    randomSurahSection.classList.toggle("opened-form");
    surahContainer.style.transform = isOpened ? "translateY(calc(-500px))" : "translateY(0)";
    titleSurahContainer.innerHTML = isOpened ? gettext("Click and Select Surahs to Memorize") : gettext("Click again to hide");
    localStorage.setItem('surah_selection_status', isOpened ? 'close' : 'open');
}

/**
 * Toggles the visibility of the Verse preferences container.
 */
function toggleVersePreferences() {
    const isOpened = !versePreferencesContainer.classList.toggle('opened-preferences-container');

    titleVersesPreferences.classList.toggle('opened-preferences-container');
    verseDisplayContainer.style.transform = isOpened ? "translateY(-400px)" : "translateY(0px)";
    titleVersesPreferences.innerHTML = isOpened ? gettext("Click to modify preferences") : gettext("Click again to hide");
    localStorage.setItem('verses_preferences_status', isOpened ? 'close' : 'open');
}

/**
 * Toggles the visibility of the differents modes.
 */
function toggleModePreference() {
    document.body.classList.toggle("multi-mode");
}

/**
 * Selects all checkboxes for Surahs and saves the selected Surahs in localStorage.
 */
function selectAllCheckboxes() {
    const checkboxes = document.querySelectorAll('.surah-checkbox');
    const selectedSurahs = [];
    checkboxes.forEach((checkbox) => {
        if (!checkbox.checked) changeBtnBg(checkbox);
        checkbox.checked = true;
        selectedSurahs.push(checkbox.value);
    });
    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));
}

/**
 * Deselects all checkboxes and clears the selected Surahs from localStorage.
 */
function deselectAllCheckboxes() {
    const checkboxes = document.querySelectorAll('.surah-checkbox');
    localStorage.removeItem('selected_surahs');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) changeBtnBg(checkbox);
        checkbox.checked = false;
    });
}

/**
 * Load the saved choices from localStorage.
 */
function loadVersePreferencesChoice() {
    const savedStatusSurahSelection = localStorage.getItem("surah_selection_status");
    const savedStatusPreferences = localStorage.getItem("verses_preferences_status");
    const savedReciter = localStorage.getItem('selectedReciter');

    document.body.classList.toggle("multi-mode", localStorage.getItem("slider_pos_modes") == "0");

    const isSSContainerOpen = savedStatusSurahSelection === "open";
    titleSurahContainer.classList.toggle('opened-form', isSSContainerOpen);
    randomSurahSection.classList.toggle('opened-form', isSSContainerOpen);
    surahContainer.style.transform = isSSContainerOpen ? "translateY(0)" : "translateY(calc(-500px))";
    titleSurahContainer.innerHTML = isSSContainerOpen 
        ? gettext("Click again to hide") 
        : gettext("Click and Select Surahs to Memorize");


    const isSPContainerOpen = savedStatusPreferences === "open";
    versePreferencesContainer.classList.toggle('opened-preferences-container', isSPContainerOpen);
    titleVersesPreferences.classList.toggle('opened-preferences-container', isSPContainerOpen);
    verseDisplayContainer.style.transform = isSPContainerOpen ? "translateY(0px)" : "translateY(-400px)";
    titleVersesPreferences.innerHTML = isSPContainerOpen 
        ? gettext("Click again to hide") 
        : gettext("Click to modify preferences");
    

    if (savedReciter) {
        const select = document.getElementById('reciter');
        select.value = savedReciter;
    }
}

/**
 * Generates a random number between a given minimum and maximum value.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} - A random integer between min and max, inclusive.
 */
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random verse from the selected surahs and updates the display with the verse details.
 * If no surahs are selected, it shows an alert.
 */
function generateRandomVerse() {
    if (selectedSurahsDict.length === 0) {
        alert(gettext('No surahs selected.'));
        return;
    }

    const randomSurah = selectedSurahsDict[generateRandomNumber(0, selectedSurahsDict.length - 1)];
    const totalVerses = randomSurah["versets"].length;
    const randomVerseIndex = generateRandomVerseIndex(totalVerses, versePreferenceSliderPos);
    const randomVerse = randomSurah["versets"][randomVerseIndex];

    history.push({ surah: randomSurah, verse: randomVerse, verseIndex: randomVerseIndex });
    currentIndex = history.length - 1;

    updateDisplayedVerse();
}

/**
 * Generates a random index based on the total number of verses and the current position.
 * @param {number} totalVerses - The total number of verses in the surah.
 * @param {number} position - The position of the verse,
 * @returns {number} - A random index,
 */
function generateRandomVerseIndex(totalVerses, position) {
    let start, end;

    switch (position) {
        case -1: // start
            start = 0;
            end = Math.floor(totalVerses / 3);
            break;
        case 0: // mid
            start = Math.floor((totalVerses / 3) - 1);
            end = Math.floor(((2 * totalVerses) / 3) +1);
            break;
        case 1: // end
            start = Math.floor((2 * totalVerses) / 3);
            end = totalVerses;
            break;
    }

    return Math.floor(Math.random() * (end - start)) + start;
}


/**
 * Updates the displayed verse based on the current history index.
 * It updates the verse text in Arabic (Hafs and Warsh), translations, and other verse details.
 */
function updateDisplayedVerse() {
    const verseDiv = document.querySelector('.verse-display');
    const nextButton = document.querySelector('.next-verse');
    const currentVerse = gettext('Current verse');
    const showAnswer = gettext("Show answer");

    if (currentIndex >= 0 && currentIndex < history.length) {
        const current = history[currentIndex];
        const surah = current.surah;
        let verseIndex = current.verseIndex;

        verseDiv.innerHTML = `
            <h3>${currentVerse}</h3>

            <div class="verse-group versePos-${surah.versets[verseIndex].position_ds_sourate - 1}">
                <p class="current-verse verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playVerse(this)">🔊</button> ${current.verse.text_hafs}</p>
                <p class="verse-translation verse-text-en"><em>${current.verse.text_en}</em></p>
                <p class="verse-translation verse-text-fr"><em>${current.verse.text}</em></p>
            </div>

            <button class="verse-btn show-answer hover-cursor-event uppercase" onclick="showAnswer()">${showAnswer}</button>
        `;

        attachCursorEvents();

        nextButton.innerHTML = currentIndex >= history.length - 1 ? gettext("generate") : gettext("Next");
    } else {
        verseDiv.innerHTML = "<p>" + gettext('No verses to display.') + "</p>";
    }

    anwserShowed = false;
}

/**
 * Shows the full answer for the current verse, including all verses in the surah.
 * It also includes navigation links for jumping to a specific verse within the surah.
 */
function showAnswer() {
    if (currentIndex >= 0 && currentIndex < history.length && !anwserShowed) {
        const current = history[currentIndex];
        const surah = current.surah;
        const verseIndex = current.verseIndex;
        const currentVerse = gettext('Current verse');
        const fullSurah = gettext('Full surah');
        const goToVerse = gettext('Go to verse');

        let nextVerses = [`
            <h3>${currentVerse}</h3>

            <div id="current-verse" class="verse-group versePos-${surah.versets[verseIndex].position_ds_sourate - 1}">
                <p class="current-verse verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playVerse(this)">🔊</button> ${verseIndex + 1} - ${surah.versets[verseIndex].text_hafs}</p>
                <p class="verse-translation verse-text-en"><em>${surah.versets[verseIndex].text_en}</em></p>
                <p class="verse-translation verse-text-fr"><em>${surah.versets[verseIndex].text}</em></p>
            </div>

            <a class="btn-goto-verse menu-btn hover-cursor-event" href="#verse-${verseIndex + 1}">${goToVerse}</a>

            <h3>${fullSurah}</h3>
        `];
        for (let i = 1; i <= surah.versets.length; i++) {
            nextVerses.push(`
                <div class="verse-group ${i == verseIndex + 1 ? 'current-verse-color-change' : ''} versePos-${surah.versets[i - 1].position_ds_sourate - 1}">
                    <div id="verse-${i}" class="offset-anchor"></div>
                    <p class="verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playVerse(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_hafs}</p>
                    <p class="verse-translation verse-text-en"><em>${surah.versets[i - 1].text_en}</em></p>
                    <p class="verse-translation verse-text-fr"><em>${surah.versets[i - 1].text}</em></p>
                </div>
            `);
        }

        const verseDiv = document.querySelector('.verse-display');
        verseDiv.innerHTML = `
            <h1 class="surah-fullname">${surah.nom_phonetique} (${surah.nom})</h1>
            ${nextVerses.join('')}
        `;
        
        attachCursorEvents();
        anwserShowed = true;
    }
}

/**
 * Displays the next verse by updating the index and calling the updateDisplayedVerse function.
 * If at the end of the history, it generates a new random verse.
 */
function nextVerse() {
    if (currentIndex < history.length - 1) {
        currentIndex++;
        updateDisplayedVerse();
    } else {
        generateRandomVerse();
    }
}

/**
 * Displays the previous verse by decrementing the index and calling the updateDisplayedVerse function.
 */
function previousVerse() {
    if (currentIndex > 0) {
        currentIndex--;
        updateDisplayedVerse();
    }
}

/**
 * Clears the verse history and resets the current index to -1, updating the displayed verse.
 */
function clearHistory() {
    history = [];
    currentIndex = -1;
    updateDisplayedVerse();
}

/**
 * Saves the selected reciter's name to localStorage.
 */
function saveReciter() {
    const selectedReciter = document.getElementById('reciter').value;
    localStorage.setItem('selectedReciter', selectedReciter);
}

/**
 * Plays the audio for a specific verse, based on the selected reciter.
 * It manages audio playback, including pausing, stopping, and switching between verses.
 * @param {HTMLElement} button - The button element that was clicked to play or pause the audio.
 */
function playVerse(button) {
    const verseGroup = button.closest('.verse-group');
    if (!verseGroup) return;

    const reciter = document.getElementById('reciter').value;
    const verseClass = Array.from(verseGroup.classList).find(cls => cls.startsWith('versePos-'));
    if (!verseClass) return;

    const verseNumber = verseClass.replace('versePos-', '');
    const current = history[currentIndex];
    const surah = current.surah;
    const verseData = surah.versets[verseNumber];

    if (!verseData[reciter]) {
        console.error(`No audio files found for the narrator : ${reciter}`);
        return;
    }

    const newSource = verseData[reciter];

    if (currentAudio === null || currentSource === '') {
        currentAudio = new Audio(newSource);
        currentSource = newSource;
        currentAudio.play();
        button.innerHTML = "🔇";
        currentAudio.addEventListener('ended', () => {
            currentAudio = null;
            currentSource = '';
            button.innerHTML = "🔊";
        });
    } else if (currentSource !== newSource) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = new Audio(newSource);
        currentSource = newSource;
        currentAudio.play();
        document.querySelectorAll('.play-audio').forEach(el => {
            el.innerHTML = "🔊";
        })
        button.innerHTML = "🔇";
        currentAudio.addEventListener('ended', () => {
            currentAudio = null;
            currentSource = '';
            button.innerHTML = "🔊";
        });
    } else {
        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            document.querySelectorAll('.play-audio').forEach(el => {
                el.innerHTML = "🔊";
            })
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
            currentSource = '';
        }
    }
}

/**
 * Retrieves all the surahs selected by the user.
 * 
 * @returns {Array} An array containing the values of the selected surahs.
 */
function getSelectedSurahs() {
    return Array.from(document.querySelectorAll('.surah-checkbox:checked')).map(checkbox => checkbox.value);
}

/**
 * Submits the selected surahs to the server via a POST request.
 * 
 * @param {Array} selectedSurahs - An array containing the selected surahs.
 */
function submitSurahs(selectedSurahs) {
    fetch('submit-surahs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_surahs: selectedSurahs })
    })
    .then(response => response.json())
    .then(data => {
        selectedSurahsDict = data.selected_surahs;
        storeDataDirectly('selected_surahs_dict', selectedSurahsDict);
    })
    .catch((error) => console.error('Error:', error));
}

/**
 * Updates the state of checkboxes based on the selected surahs.
 * 
 * @param {Array} selectedSurahs - An array containing the selected surahs.
 */
function updateCheckboxes(selectedSurahs) {
    document.querySelectorAll('.surah-checkbox').forEach(checkbox => {
        checkbox.checked = selectedSurahs.includes(checkbox.value);
        if (checkbox.checked) {
            changeBtnBg(checkbox);
        }
    });
}

/**
 * Scrolls the page to the top by simulating a click on an element with the class 'scroll-up'.
 */
function scrollUp() {
    const scrollUpAnchor = document.querySelector('.scroll-up');
    if (scrollUpAnchor) scrollUpAnchor.click();
}

/**
 * Displays the answer to a verse or navigates to the full verse.
 * If the answer has not been shown yet, the `showAnswer()` function is called to display
 * the answer. Otherwise, it navigates to the anchor of the full verse by simulating a click
 * on an element with the class 'btn-goto-verse'.
 */
function showAnswerOrNavigate() {
    if (!anwserShowed) {
        showAnswer();
    } else {
        const gotoVerseAnchor = document.querySelector('.btn-goto-verse');
        if (gotoVerseAnchor) gotoVerseAnchor.click();
    }
}

// Surah Selection and Submission
surahForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedSurahs = getSelectedSurahs();
    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));
    submitSurahs(selectedSurahs);
});

// Surah Loading
window.onload = () => {
    const selectedSurahs = JSON.parse(localStorage.getItem('selected_surahs')) || [];
    updateCheckboxes(selectedSurahs);
};

// Scroll Handling
window.addEventListener('scroll', () => {
    const targetPosition = targetDiv.getBoundingClientRect().top + window.scrollY;
    const currentScroll = window.scrollY;
    scrollUpButton.classList.toggle('anchor-visible', currentScroll > targetPosition);
});

// Keydown Event Handling
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowRight': nextVerse(); break;
        case 'ArrowLeft': previousVerse(); break;
        case 'r': event.preventDefault(); clearHistory(); break;
        case 'ArrowUp': event.preventDefault(); scrollUp(); break;
        case 'ArrowDown': event.preventDefault(); showAnswerOrNavigate(); break;
    }
});

document.addEventListener("DOMContentLoaded", loadVersePreferencesChoice);

/**
 * Initialize the sliders by setting their initial positions based on localStorage.
 */
document.querySelectorAll(".slider-container").forEach(sliderContainer => {
    const parentElement = sliderContainer.parentElement; 
    const parentClass = [...parentElement.classList].find(cls => cls.endsWith("-part-preference")); // Trouver la classe spécifique
    if (!parentClass) return; // Si la classe n'est pas trouvée, on ignore ce slider

    const functionName = parentClass.split("-part-preference")[0]; // Extraire <nom_de_la_fonction>
    const sliderButton = sliderContainer.querySelector(".slider-button");
    const numPositions = parseInt(parentElement.id); // Nombre de positions défini par l'ID

    // Récupérer la valeur du localStorage ou initialiser à -1
    let currentValue = localStorage.getItem(`slider_pos_${functionName}`);
    currentValue = currentValue !== null ? parseInt(currentValue) : -1;

    /**
     * Update the slider position based on the current value.
     */
    function updateSliderPosition() {
        const stepSize = 60; // Distance entre chaque position (en pixels)
        const positionX = (currentValue + 1) * stepSize; // Calculer la position X
        sliderButton.style.transform = `translateY(-50%) translateX(${positionX}px)`;
        localStorage.setItem(`slider_pos_${functionName}`, currentValue);
        versePreferenceSliderPos = parseInt(localStorage.getItem("slider_pos_verse"));
        modePreferenceSliderPos = parseInt(localStorage.getItem("slider_pos_modes"));
    }

    /**
     * Toggle to the next slider value.
     */
    function nextSliderValue() {
        currentValue = currentValue === numPositions - 2 ? -1 : currentValue + 1; // Passer au prochain ou revenir à -1
        updateSliderPosition();
    }

    /**
     * Attach the click event to toggle the slider.
     */
    sliderContainer.addEventListener("click", nextSliderValue);

    // Initial setup
    updateSliderPosition();
});


/**
 * Update the value of the second field when the minimum is modified (via blur)
 */
function updateValueInputMin() {
    const newMin = parseInt(minInput.value) || 0;
    const maxInput = parseInt(valueInput.value) || 0;

    if (maxInput < newMin) {
        valueInput.value = newMin;
    }
    valueInput.min = newMin;
}
minInput.addEventListener("blur", updateValueInputMin);
valueInput.addEventListener("blur", function() {
    const newMin = parseInt(minInput.value) || 0;
    const maxInput = parseInt(valueInput.value) || 0;
    
    if (maxInput < newMin) {
      valueInput.value = newMin;
    }
});

