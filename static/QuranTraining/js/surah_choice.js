// Function to send data to Flask for compression
function storeCompressedData(key, data) {
    // If data is an object or array, convert it to a JSON string
    const dataToSend = typeof data === 'string' ? data : JSON.stringify(data);

    // Send a POST request to the Flask 'compress' endpoint
    fetch('compress', {
        method: 'POST',  // HTTP method for sending data
        headers: {
            'Content-Type': 'application/json'  // Indicate that the request body is in JSON format
        },
        body: JSON.stringify({ data: dataToSend })  // Send the data as JSON in the body of the request
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(result => {
        if (result.result) {
            // If the compression is successful, log a success message and store the compressed data in localStorage
            console.log("Compression completed!");
            localStorage.setItem(key, result.result);
        } else {
            // If there was an error during compression, log the error message
            console.error('Compression error:', result.error);
        }
    })
    .catch(error => {
        // Log any errors that occurred during the fetch request
        console.error('Error sending data to Flask:', error);
    });
}

// Function to send data to Flask for decompression
function getDecompressedData(key, callback) {
    // Retrieve the compressed data from localStorage using the provided key
    const compressedData = localStorage.getItem(key);

    // Send a POST request to the Flask 'decompress' endpoint
    fetch('decompress', {
        method: 'POST',  // HTTP method for sending data
        headers: {
            'Content-Type': 'application/json'  // Indicate that the request body is in JSON format
        },
        body: JSON.stringify({ data: compressedData })  // Send the compressed data as JSON in the body of the request
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(result => {
        if (result.result) {
            // If the decompression is successful, pass the decompressed data to the callback function
            callback(result.result);
        } else {
            // If there was an error during decompression, log the error message and pass null to the callback
            console.error('Decompression error:', result.error);
            callback(null);
        }
    })
    .catch(error => {
        // Log any errors that occurred during the fetch request
        console.error('Error sending data to Flask:', error);
        callback(null);  // In case of an error, pass null to the callback
    });
}

// surah selection
const surahContainer = document.getElementById('surah');
const surahForm = document.querySelector('.surah-form');
const titleSurahContainer = document.querySelector('.title-surah-choice');
// verse preferences
const randomSurahSection = document.getElementById("training");
const versePreferencesContainer = document.querySelector('.verse-preferences');
const titleVersesPreferences = document.querySelector('.title-verses-preferences');
const verseDisplayContainer = document.querySelector(".verse-display-container");
// slider
const sliderButton = document.querySelector(".slider-button");
const sliderContainer = document.querySelector(".slider-container");
// scroll
const scrollUpButton = document.querySelector('.scroll-up');
const targetDiv = document.querySelector('.verse-display');

let currentValue = parseInt(localStorage.getItem("verse_position")) || 0;
let selectedSurahsDict;

getDecompressedData('selected_surahs_dict', (result) => {
    selectedSurahsDict = result || [];
});

console.log(selectedSurahsDict);
console.log(localStorage.getItem('selected_surahs_dict'));

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
    localStorage.setItem('surah_container_status', isOpened ? 'close' : 'open');
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
 * Handles the sliding effect for the sliders (for text and language) and saves the choice in localStorage.
 * @param {HTMLElement} sliderBg - The slider element that was clicked.
 */
function slide(sliderBg) {
    const slider = sliderBg.querySelector('.slider');
    const isActive = slider.classList.toggle("active");

    // Handle different types of sliders using switch-case
    switch (true) {
        case sliderBg.classList.contains('text-slider'):
            handleTextSlider(isActive);
            break;

        case sliderBg.classList.contains('language-slider'):
            handleLanguageSlider(isActive);
            break;

        default:
            console.error("Unknown slider type");
            break;
    }
}
/**
 * Handles the activation and deactivation of the text-slider.
 * @param {boolean} isActive - Indicates whether the slider is active or not.
 */
function handleTextSlider(isActive) {
    const hafsButton = document.querySelector(".hafs");
    const warshButton = document.querySelector(".warsh");

    hafsButton.classList.toggle("active");
    warshButton.classList.toggle("active");
    document.body.classList.toggle("warsh-visible");

    localStorage.setItem("sliderChoice", isActive ? "warsh" : "hafs");
}
/**
 * Handles the activation and deactivation of the language-slider.
 * @param {boolean} isActive - Indicates whether the slider is active or not.
 */
function handleLanguageSlider(isActive) {
    document.body.classList.toggle("fr");
    localStorage.setItem("language", isActive ? "fr" : "en");
}

/**
 * Update the slider position based on the current value.
 */
function updateSliderPosition() {
    const positions = {
        '-1': '0px',
        '0': '60px',
        '1': '120px'
    };
    sliderButton.style.transform = `translateY(-50%) translateX(${positions[currentValue]})`;
    localStorage.setItem("verse_position", currentValue);
}

/**
 * Toggle the slider value between -1, 0, and 1.
 */
function nextSliderValue() {
    currentValue = currentValue === 1 ? -1 : currentValue + 1;
    updateSliderPosition();
}

/**
 * Get the current slider value.
 * @returns {number} The current slider value.
 */
function getSliderValue() {
    return currentValue;
}

/**
 * Load the saved slider choices and preferences from localStorage.
 */
function loadSliderChoice() {
    const savedChoiceText = localStorage.getItem("sliderChoice");
    const savedChoiceLang = localStorage.getItem("language");
    const savedStatus = localStorage.getItem("surah_container_status");
    const savedStatusPreferences = localStorage.getItem("verses_preferences_status");

    const sliderText = document.querySelector(`.text-slider.slider`);
    const sliderLang = document.querySelector(`.language-slider.slider`);
    const hafsButton = document.querySelector(".hafs");
    const warshButton = document.querySelector(".warsh");

    const savedReciter = localStorage.getItem('selectedReciter');

    if (savedChoiceText === "warsh") {
        sliderText.classList.add("active");
        hafsButton.classList.add("active");
        warshButton.classList.add("active");
        document.body.classList.add("warsh-visible");
    } else {
        sliderText.classList.remove("active");
        hafsButton.classList.remove("active");
        warshButton.classList.remove("active");
        document.body.classList.remove("warsh-visible");
    }

    if (savedChoiceLang === "fr") {
        sliderLang.classList.add("active");
        document.body.classList.add("fr");
    } else{
        sliderLang.classList.remove("active");
        document.body.classList.remove("fr");
    }

    if (savedStatus === "open") {
        titleSurahContainer.classList.add('opened-form');
        randomSurahSection.classList.add('opened-form');
        surahContainer.style.transform = "translateY(0)";
        titleSurahContainer.innerHTML = gettext("Click again to hide");
    } else{
        titleSurahContainer.classList.remove('opened-form');
        randomSurahSection.classList.remove('opened-form');
        surahContainer.style.transform = "translateY(calc(-500px))";
        titleSurahContainer.innerHTML = gettext("Click and Select Surahs to Memorize");
    }

    if (savedStatusPreferences == "open"){
        versePreferencesContainer.classList.add('opened-preferences-container');
        titleVersesPreferences.classList.add('opened-preferences-container');
        verseDisplayContainer.style.transform = "translateY(0px)";
        titleVersesPreferences.innerHTML = gettext("Click again to hide");
    } else{
        versePreferencesContainer.classList.remove('opened-preferences-container');
        titleVersesPreferences.classList.remove('opened-preferences-container');
        verseDisplayContainer.style.transform = "translateY(-400px)";
        titleVersesPreferences.innerHTML = gettext("Click to modify preferences");
    }

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
    const randomVerseIndex = generateWeightedRandomVerseIndex(totalVerses, currentValue);
    const randomVerse = randomSurah["versets"][randomVerseIndex];

    history.push({ surah: randomSurah, verse: randomVerse, verseIndex: randomVerseIndex });
    currentIndex = history.length - 1;

    updateDisplayedVerse();
}

/**
 * Generates a weighted random index based on the total number of verses and the current position.
 * The weighting changes based on the position (e.g., -1, 0, 1).
 * @param {number} totalVerses - The total number of verses in the surah.
 * @param {number} position - The position of the verse, affecting the weight distribution.
 * @returns {number} - A random index, based on the weighted distribution.
 */
function generateWeightedRandomVerseIndex(totalVerses, position) {
    const weights = [];
    for (let i = 0; i < totalVerses; i++) {
        switch (position) {
            case -1:
                weights.push(totalVerses - i);
                break;
            case 0:
                weights.push(Math.max(0, totalVerses / 2 - Math.abs(totalVerses / 2 - i)));
                break;
            case 1:
                weights.push(i + 1);
                break;
            default:
                weights.push(1);
        }
    }

    const cumulativeWeights = weights.map((sum => value => (sum += value))(0));
    const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomValue = Math.random() * totalWeight;

    return cumulativeWeights.findIndex(weight => randomValue < weight);
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
                <p class="current-verse verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${current.verse.text_hafs}</p>
                <p class="current-verse verse-text-ar verse-text-warsh"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${current.verse.text_warsh}</p>
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
                <p class="current-verse verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${verseIndex + 1} - ${surah.versets[verseIndex].text_hafs}</p>
                <p class="current-verse verse-text-ar verse-text-warsh"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${verseIndex + 1} - ${surah.versets[verseIndex].text_warsh}</p>
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
                    <p class="verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_hafs}</p>
                    <p class="verse-text-ar verse-text-warsh"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_warsh}</p>
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
function playSong(button) {
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
        storeCompressedData('selected_surahs_dict', selectedSurahsDict);
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

// Slider Handling
sliderContainer.addEventListener("click", nextSliderValue);
updateSliderPosition();

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
        case 'Backspace': event.preventDefault(); clearHistory(); break;
        case 'ArrowUp': event.preventDefault(); scrollUp(); break;
        case 'ArrowDown': event.preventDefault(); showAnswerOrNavigate(); break;
    }
});

document.addEventListener("DOMContentLoaded", loadSliderChoice);