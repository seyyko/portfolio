const titleSurahContainer = document.querySelector('.title-surah-choice');
const titleVersesPreferences = document.querySelector('.title-verses-preferences');
const versePreferencesContainer = document.querySelector('.verse-preferences');
const surahContainer = document.getElementById('surah');
const surahForm = document.querySelector('.surah-form');
const randomSurahSection = document.getElementById("training");
const verseDisplayContainer = document.querySelector(".verse-display-container");

function changeBtnBg(checkbox) {
    const label = checkbox.closest('label');

    if (label.classList.contains("selected")) {
        label.classList.remove("selected");
    } else {
        label.classList.add("selected");
    }
}

function toggleSurahChoice() {
    if (titleSurahContainer.classList.contains('opened-form')) {
        titleSurahContainer.classList.remove('opened-form');
        randomSurahSection.classList.remove('opened-form');
        surahContainer.style.transform = "translateY(calc(-500px))";
        titleSurahContainer.innerHTML = gettext("Click and Select Surahs to Memorize");
        localStorage.setItem('surah_container_status', 'close');
    } else{
        titleSurahContainer.classList.add('opened-form');
        randomSurahSection.classList.add('opened-form');
        surahContainer.style.transform = "translateY(0)";
        titleSurahContainer.innerHTML = gettext("Click again to hide");
        localStorage.setItem('surah_container_status', 'open');
    }
}

function toggleVersePreferences() {
    if (versePreferencesContainer.classList.contains('opened-preferences-container')) {
        versePreferencesContainer.classList.remove('opened-preferences-container');
        titleVersesPreferences.classList.remove('opened-preferences-container');
        verseDisplayContainer.style.transform = "translateY(-400px)";
        titleVersesPreferences.innerHTML = gettext("Click to modify preferences");
        localStorage.setItem('verses_preferences_status', 'close');
    } else{
        versePreferencesContainer.classList.add('opened-preferences-container');
        titleVersesPreferences.classList.add('opened-preferences-container');
        verseDisplayContainer.style.transform = "translateY(0px)";
        titleVersesPreferences.innerHTML = gettext("Click again to hide");
        localStorage.setItem('verses_preferences_status', 'open');
    }
}

function selectAllCheckboxes() {
    const checkboxes = document.querySelectorAll('.surah-checkbox');
    const selectedSurahs = [];

    checkboxes.forEach((checkbox) => {
        if (!checkbox.checked) {
            changeBtnBg(checkbox);
        }
        checkbox.checked = true;
        selectedSurahs.push(checkbox.value);
    });

    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));
}

function deselectAllCheckboxes() {
    localStorage.removeItem('selected_surahs');
    
    document.querySelectorAll('.surah-checkbox').forEach(checkbox => {
        if (checkbox.checked){
            changeBtnBg(checkbox);
        }
        checkbox.checked = false;
    });
}

window.onload = () => {
    const selectedSurahs = JSON.parse(localStorage.getItem('selected_surahs')) || [];

    // console.log("Data received from localStorage:", selectedSurahs);

    document.querySelectorAll('.surah-checkbox').forEach(checkbox => {
        if (selectedSurahs.includes(checkbox.value)) {
            checkbox.checked = true;
            changeBtnBg(checkbox);
        }
    });
    updateSelectedSurahs();
};

let selectedSurahsDict = JSON.parse(localStorage.getItem('selected_surahs_dict')) || [];

surahForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedSurahs = [];
    document.querySelectorAll('.surah-checkbox:checked').forEach(checkbox => {
        selectedSurahs.push(checkbox.value);
    });

    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));

    fetch('submit-surahs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_surahs: selectedSurahs })
    })
    .then(response => response.json())
    .then(data => {
        // console.log('Success');

        selectedSurahsDict = data.selected_surahs;
        localStorage.setItem('selected_surahs_dict', JSON.stringify(selectedSurahsDict));
        updateSelectedSurahs();
        // console.log('Updated selectedSurahsDict:', selectedSurahsDict);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});


function slide(sliderBg) {
    const slider = document.querySelector(`.${sliderBg.classList[1]}`);
    if (slider.classList.contains("active")) {
        slider.classList.remove("active");
        if (slider.classList.contains('text-slider')) {
            document.querySelector(".hafs").classList.remove("active");
            document.querySelector(".warsh").classList.remove("active");
            document.body.classList.remove("warsh-visible");
            localStorage.setItem("sliderChoice", "hafs");
        } else{
            document.body.classList.remove("fr");
            localStorage.setItem("language", "en");
        }
    } else{
        slider.classList.add("active");
        if (slider.classList.contains('text-slider')) {
            document.querySelector(".hafs").classList.add("active");
            document.querySelector(".warsh").classList.add("active");
            document.body.classList.add("warsh-visible");
            localStorage.setItem("sliderChoice", "warsh");
        } else{
            document.body.classList.add("fr");
            localStorage.setItem("language", "fr");
        }
    }
}

const sliderButton = document.querySelector(".slider-button");
const sliderContainer = document.querySelector(".slider-container");
let currentValue = parseInt(localStorage.getItem("verse_position")) || 0;

function updateSliderPosition() {
    const positions = {
        '-1': '0px',
        '0': '60px',
        '1': '120px'
    };

    sliderButton.style.transform = `translateY(-50%) translateX(${positions[currentValue]})`;
    localStorage.setItem("verse_position", currentValue);
}

function nextSliderValue() {
    currentValue = currentValue === 1 ? -1 : currentValue + 1;
    updateSliderPosition();
}

sliderContainer.addEventListener("click", nextSliderValue);

updateSliderPosition();

function getSliderValue() {
    return currentValue;
}

function loadSliderChoice() {
    const savedChoiceText = localStorage.getItem("sliderChoice");
    const sliderText = document.querySelector(`.text-slider`);

    const savedChoiceLang = localStorage.getItem("language");
    const sliderLang = document.querySelector(`.language-slider`);

    const savedStatus = localStorage.getItem("surah_container_status");

    const savedStatusPreferences = localStorage.getItem("verses_preferences_status");

    if (savedChoiceText === "warsh") {
        sliderText.classList.add("active");
        document.querySelector(".hafs").classList.add("active");
        document.querySelector(".warsh").classList.add("active");
        document.body.classList.add("warsh-visible");
    } else {
        sliderText.classList.remove("active");
        document.querySelector(".hafs").classList.remove("active");
        document.querySelector(".warsh").classList.remove("active");
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

    const savedReciter = localStorage.getItem('selectedReciter');
    if (savedReciter) {
        const select = document.getElementById('reciter');
        select.value = savedReciter;
        // console.log(`Reciter restored: ${savedReciter}`);
    }
}

let history = [];
let currentIndex = -1;
let anwserShowed = false;

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateSelectedSurahs() {
    // const surahsDiv = document.querySelector('.selected-surahs');
    // surahsDiv.innerHTML = '';

    // selectedSurahsDict.forEach((surah, index) => {
    //     const surahElement = document.createElement('div');
    //     surahElement.className = 'surah-item';
    //     surahElement.textContent = `${index + 1}. ${surah.nom_phonetique} (${surah.nom})`;
    //     surahsDiv.appendChild(surahElement);
    // });
}

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


function updateDisplayedVerse() {
    const verseDiv = document.querySelector('.verse-display');
    const nextButton = document.querySelector('.next-verse');
    const currentVerse = gettext('Current verse');

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
        `;

        const button = document.createElement("button");
        button.textContent = gettext("Show answer");
        button.className = "verse-btn show-answer hover-cursor-event uppercase";
        button.onclick = showAnswer;
        
        verseDiv.appendChild(button);
        attachHoverEvents();

        nextButton.innerHTML = currentIndex >= history.length - 1 ? gettext("generate") : gettext("Next");
    } else {
        verseDiv.innerHTML = "<p>" + gettext('No verses to display.') + "</p>";
    }
    anwserShowed = false;
}

function showAnswer() {
    if (currentIndex >= 0 && currentIndex < history.length && !anwserShowed) {
        const current = history[currentIndex];
        const surah = current.surah;
        let verseIndex = current.verseIndex;

        const currentVerse = gettext('Current verse');
        const fullSurah = gettext('Full surah');
        const goToVerse = gettext('Go to verse');

        let nextVerses = [];
        nextVerses.push(`
            <h3>${currentVerse}</h3>

            <div id="current-verse" class="verse-group versePos-${surah.versets[verseIndex].position_ds_sourate - 1}">
                <p class="current-verse verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${verseIndex + 1} - ${surah.versets[verseIndex].text_hafs}</p>
                <p class="current-verse verse-text-ar verse-text-warsh"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${verseIndex + 1} - ${surah.versets[verseIndex].text_warsh}</p>
                <p class="verse-translation verse-text-en"><em>${surah.versets[verseIndex].text_en}</em></p>
                <p class="verse-translation verse-text-fr"><em>${surah.versets[verseIndex].text}</em></p>
            </div>

            <a class="btn-goto-verse menu-btn hover-cursor-event" href="#verse-${verseIndex + 1}">${goToVerse}</a>

            <h3>${fullSurah}</h3>
        `);
        for (let i = 1; i <= surah.versets.length; i++) {
            if (i == verseIndex + 1){
                nextVerses.push(`
                    <div class="verse-group current-verse-color-change versePos-${surah.versets[i - 1].position_ds_sourate - 1}">
                        <div id="verse-${i}" class="offset-anchor"></div>
                        <p class="verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_hafs}</p>
                        <p class="verse-text-ar verse-text-warsh"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_warsh}</p>
                        <p class="verse-translation verse-text-en"><em>${surah.versets[i - 1].text_en}</em></p>
                        <p class="verse-translation verse-text-fr"><em>${surah.versets[i - 1].text}</em></p>
                    </div>
                `);
            } else{
                nextVerses.push(`
                    <div class="verse-group versePos-${surah.versets[i - 1].position_ds_sourate - 1}">
                        <div id="verse-${i}" class="offset-anchor"></div>
                        <p class="verse-text-ar verse-text-hafs"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_hafs}</p>
                        <p class="verse-text-ar verse-text-warsh"><button class="hover-cursor-event play-audio" onclick="playSong(this)">🔊</button> ${i} - ${surah.versets[i - 1].text_warsh}</p>
                        <p class="verse-translation verse-text-en"><em>${surah.versets[i - 1].text_en}</em></p>
                        <p class="verse-translation verse-text-fr"><em>${surah.versets[i - 1].text}</em></p>
                    </div>
                `);
            }
        }

        const verseDiv = document.querySelector('.verse-display');
        verseDiv.innerHTML = `
            <h1 class="surah-fullname">${surah.nom_phonetique} (${surah.nom})</h1>
            ${nextVerses.join('')}
        `;
        attachHoverEvents();

        anwserShowed = true;
    }
}

function nextVerse() {
    if (currentIndex < history.length - 1) {
        currentIndex++;
        updateDisplayedVerse();
    } else {
        generateRandomVerse();
    }
}

function previousVerse() {
    if (currentIndex > 0) {
        currentIndex--;
        updateDisplayedVerse();
    }
}

function clearHistory() {
    history = [];
    currentIndex = -1;
    updateDisplayedVerse();
}

const scrollUpButton = document.querySelector('.scroll-up');
const targetDiv = document.querySelector('.verse-display');

window.addEventListener('scroll', () => {
    const targetPosition = targetDiv.getBoundingClientRect().top + window.scrollY;
    const currentScroll = window.scrollY;

    if (currentScroll > targetPosition) {
        scrollUpButton.classList.add('anchor-visible');
    } else {
        scrollUpButton.classList.remove('anchor-visible');
    }
});

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowRight':
            nextVerse();
            break;
        case 'ArrowLeft':
            previousVerse();
            break;
        case 'Backspace':
            event.preventDefault();
            clearHistory();
            break;
        case 'ArrowUp': {
            event.preventDefault();
            const scrollUpAnchor = document.querySelector('.scroll-up');
            if (scrollUpAnchor) scrollUpAnchor.click();
            break;
        }
        case 'ArrowDown': {
            event.preventDefault();
            if (!anwserShowed) {
                showAnswer();
            } else{
                const gotoVerseAnchor = document.querySelector('.btn-goto-verse');
                if (gotoVerseAnchor) gotoVerseAnchor.click();
            }
            break;
        }
    }
});

function saveReciter() {
    const select = document.getElementById('reciter');
    const selectedReciter = select.value;
    localStorage.setItem('selectedReciter', selectedReciter);
    // console.log(`Reciter saved: ${selectedReciter}`); 
}

let currentAudio = null;
let currentSource = ''; 

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
            button.innerHTML = "🔊";
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
            currentSource = '';
        }
    }
}

document.addEventListener("DOMContentLoaded", loadSliderChoice);