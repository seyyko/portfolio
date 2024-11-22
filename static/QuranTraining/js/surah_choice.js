const titleSurahContainer = document.querySelector('.title-surah-choice');
const surahContainer = document.getElementById('surah');
const surahForm = document.querySelector('.surah-form');
const randomSurahSection = document.getElementById("training");


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
        titleSurahContainer.innerHTML = "Click and Select Surahs to Memorize";
        localStorage.setItem('surah_container_status', 'open');
    } else{
        titleSurahContainer.classList.add('opened-form');
        randomSurahSection.classList.add('opened-form');
        surahContainer.style.transform = "translateY(0)";
        titleSurahContainer.innerHTML = "Click again to hide";
        localStorage.setItem('surah_container_status', 'close');
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
        console.log('Success');

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

    const savedPosition = localStorage.getItem("verse_position") || 0;

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
        titleSurahContainer.classList.remove('opened-form');
        randomSurahSection.classList.remove('opened-form');
        surahContainer.style.transform = "translateY(calc(-500px))";
        titleSurahContainer.innerHTML = "Click and Select Surahs to Memorize";
    } else{
        titleSurahContainer.classList.add('opened-form');
        randomSurahSection.classList.add('opened-form');
        surahContainer.style.transform = "translateY(0)";
        titleSurahContainer.innerHTML = "Click again to hide";
    }
}

let history = [];
let currentIndex = -1;

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
        alert('No surahs selected.');
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

    if (currentIndex >= 0 && currentIndex < history.length) {
        const current = history[currentIndex];
        verseDiv.innerHTML = `
            <h3>Current verse</h3>

            <div class="verse-group">
                <p class="current-verse verse-text-ar verse-text-hafs">${current.verse.text_hafs}</p>
                <p class="current-verse verse-text-ar verse-text-warsh">${current.verse.text_warsh}</p>
                <p class="verse-translation verse-text-en"><em>${current.verse.text_en}</em></p>
                <p class="verse-translation verse-text-fr"><em>${current.verse.text}</em></p>
            </div>
        `;

        const button = document.createElement("button");
        button.className = "verse-btn show-answer hover-cursor-event uppercase";
        button.textContent = "Show answer";
        button.onclick = showAnswer;

        verseDiv.appendChild(button);
        
        if (currentIndex >= history.length - 1) {
            nextButton.innerHTML = "Generate";
        } else {
            nextButton.innerHTML = "Next";
        }
    } else {
        verseDiv.innerHTML = "<p>No verses to display.</p>";
    }
}

function showAnswer() {
    if (currentIndex >= 0 && currentIndex < history.length) {
        const current = history[currentIndex];
        const surah = current.surah;
        let verseIndex = current.verseIndex;

        let nextVerses = [];
        nextVerses.push(`
            <h3>Current verse</h3>

            <div class="verse-group">
                <p class="current-verse verse-text-ar verse-text-hafs">${verseIndex + 1} - ${surah.versets[verseIndex].text_hafs}</p>
                <p class="current-verse verse-text-ar verse-text-warsh">${verseIndex + 1} - ${surah.versets[verseIndex].text_warsh}</p>
                <p class="verse-translation verse-text-en"><em>${surah.versets[verseIndex].text_en}</em></p>
                <p class="verse-translation verse-text-fr"><em>${surah.versets[verseIndex].text}</em></p>
            </div>

            <h3>Following verses</h3>
        `);
        for (let i = verseIndex + 1; i < Math.min(verseIndex + 5, surah.versets.length); i++) {
            nextVerses.push(`
                <div class="verse-group">
                    <p class="verse-text-ar verse-text-hafs">${i + 1} - ${surah.versets[i].text_hafs}</p>
                    <p class="verse-text-ar verse-text-warsh">${i + 1} - ${surah.versets[i].text_warsh}</p>
                    <p class="verse-translation verse-text-en"><em>${surah.versets[i].text_en}</em></p>
                    <p class="verse-translation verse-text-fr"><em>${surah.versets[i].text}</em></p>
                </div>
            `);
        }

        const verseDiv = document.querySelector('.verse-display');
        verseDiv.innerHTML = `
            <h1 class="surah-fullname">${surah.nom_phonetique} (${surah.nom})</h1>
            ${nextVerses.join('')}
        `;
    }
}

function nextVerse() {
    const nextButton = document.querySelector('.next-verse');

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

document.addEventListener("DOMContentLoaded", loadSliderChoice);