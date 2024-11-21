const titlesurahContainer = document.querySelector('.title-surah-choice');
const surahContainer = document.getElementById('surah');
const surahForm = document.querySelector('.surah-form');


function changeBtnBg(checkbox) {
    const label = checkbox.closest('label');

    if (label.classList.contains("selected")) {
        label.classList.remove("selected");
    } else {
        label.classList.add("selected");
    }
}

function toggleSurahChoice() {
    if (titlesurahContainer.classList.contains('opened-form')) {
        titlesurahContainer.classList.remove('opened-form');
        surahContainer.style.transform = "translateY(calc(-100% + 80px))";
        titlesurahContainer.innerHTML = "Click and Select Surahs to Memorize";
    } else{
        titlesurahContainer.classList.add('opened-form');
        surahContainer.style.transform = "translateY(0)";
        titlesurahContainer.innerHTML = "Click again to hide";
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

function saveSelectedSurahs() {
    const selectedSurahs = [];
    document.querySelectorAll('.surah-checkbox:checked').forEach(checkbox => {
        selectedSurahs.push(checkbox.value);
    });

    console.log("Selected surah before submit:", selectedSurahs);

    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));
}

window.onload = () => {
    const selectedSurahs = JSON.parse(localStorage.getItem('selected_surahs')) || [];

    console.log("Data received from localStorage:", selectedSurahs);

    document.querySelectorAll('.surah-checkbox').forEach(checkbox => {
        if (selectedSurahs.includes(checkbox.value)) {
            checkbox.checked = true;
            changeBtnBg(checkbox);
        }
    });
};

surahForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedSurahs = [];
    document.querySelectorAll('.surah-checkbox:checked').forEach(checkbox => {
        selectedSurahs.push(checkbox.value);
    });

    localStorage.setItem('selected_surahs', JSON.stringify(selectedSurahs));

    console.log("Selected surah before submit:", selectedSurahs);

    fetch('submit-surahs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_surahs: selectedSurahs })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
