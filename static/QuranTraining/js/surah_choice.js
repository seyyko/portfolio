// Grab all the important elements. Yes, we love getting our hands dirty with querySelectors.
const titleSurahChoice = document.querySelector('.title-surah-choice');
const surahChoice = document.getElementById('surah-choice');
const surahForm = document.querySelector('.surah-form');


function changeBtnBg(checkbox) {
    const label = checkbox.closest('label'); // Get the parent label, because we like family connections.

    if (label.classList.contains("selected")) {
        label.classList.remove("selected"); // Sorry, you're not special anymore.
    } else {
        label.classList.add("selected"); // Congrats! You're back on the list.
    }

    updateLocalStorage(checkbox); // Oh, and don't forget to tell localStorage. It needs to stay in the loop.
}

function toggleSurahChoice() {
    if (titleSurahChoice.classList.contains('opened-form')) {
        titleSurahChoice.classList.remove('opened-form');
        surahForm.style.opacity = "0";                                      // *Poof* the form disappears.
        surahChoice.style.transform = "translateY(calc(-100% + 80px))"; // Magic trick: it slides up.
        titleSurahChoice.innerHTML = "Click and Select Surahs to Memorize";
    } else{
        titleSurahChoice.classList.add('opened-form');
        surahForm.style.opacity = "1";                  // And voilà! It's back.
        surahChoice.style.transform = "translateY(0)";  // Sliding down like butter.
        titleSurahChoice.innerHTML = "Click again to hide";
    }
}


function saveSelectedSurahs() {
    const selectedSurahs = [];
    document.querySelectorAll('.surah-checkbox:checked').forEach(checkbox => {
        selectedSurahs.push(checkbox.value);
    });
    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs)); // Store them for safekeeping.
}

// Update localStorage whenever a checkbox gets some attention (i.e., checked/unchecked).
function updateLocalStorage(checkbox) {
    let selectedSurahs = JSON.parse(localStorage.getItem('selected_surahs')) || [];

    if (checkbox.checked) {
        selectedSurahs.push(checkbox.value); // Welcome to the club.
    } else {
        selectedSurahs = selectedSurahs.filter(surah => surah !== checkbox.value); // Sorry, you've been voted off the island.
    }

    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));
}

// When the page loads, we need to recheck all the checkboxes because... trust issues.
window.onload = () => {
    const selectedSurahs = JSON.parse(localStorage.getItem('selected_surahs')) || [];

    // Go through all the checkboxes and make them feel special again if they were selected before.
    document.querySelectorAll('.surah-checkbox').forEach(checkbox => {
        if (selectedSurahs.includes(checkbox.value)) {
            checkbox.checked = true;    // Checkbox, you've earned this tick mark.
            changeBtnBg(checkbox);      // And your background color upgrade.
        }
    });
};

// Let's handle form submission like pros: without refreshing the page. Because we're fancy like that.
surahForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Nah, you’re not reloading this page. Not on my watch.

    const selectedSurahs = [];
    document.querySelectorAll('.surah-checkbox:checked').forEach(checkbox => {
        selectedSurahs.push(checkbox.value); // Capture those checked Surahs.
    });

    // Let's send the data to the server like a love letter via Fetch API.
    fetch('/submit-surahs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_surahs: selectedSurahs }) // Wrap it up nicely in JSON.
    })
    .then(response => response.json()) // Wait for the server to write back. Please, write back.
    .then(data => {
        console.log('Success:', data); // Hooray! We've got a response!
    })
    .catch((error) => {
        console.error('Error:', error); // Oh no! Our fetch broke... :(
    });
});