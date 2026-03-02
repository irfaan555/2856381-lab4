// DOM Elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// FIX: Hide sections immediately when page loads
countryInfo.classList.add('hidden');
borderingCountries.classList.add('hidden');
errorMessage.classList.add('hidden');
loadingSpinner.classList.add('hidden'); // This stops the buffering sign on load

// Show loading
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

// Hide loading
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Main search function
async function searchCountry(countryName) {

    if (!countryName.trim()) {
        showError("Please enter a country name.");
        return;
    }

    showLoading();

    try {
        // Fetch country data
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${countryName}`
        );

        if (!response.ok) {
            throw new Error("Country not found.");
        }

        const data = await response.json();
        const country = data[0];

        // Display country info
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;

        countryInfo.classList.remove('hidden');

        // Clear previous borders
        borderingCountries.innerHTML = '';

        if (country.borders && country.borders.length > 0) {

            borderingCountries.classList.remove('hidden');

            const title = document.createElement('h3');
            title.textContent = "Bordering Countries:";
            title.style.gridColumn = "1 / -1";
            borderingCountries.appendChild(title);

            // Fetch borders in parallel
            await Promise.all(
                country.borders.map(code => fetchBorderCountry(code))
            );

        } else {
            borderingCountries.classList.add('hidden');
        }

    } catch (error) {
        showError(error.message || "An error occurred.");
    } finally {
        hideLoading();
    }
}

// Fetch border country
async function fetchBorderCountry(code) {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/alpha/${code}`
        );

        if (!response.ok) return;

        const data = await response.json();
        const borderCountry = data[0];

        const div = document.createElement('div');
        div.classList.add('border-item');

        div.innerHTML = `
            <img src="${borderCountry.flags.svg}" alt="${borderCountry.name.common} flag">
            <p>${borderCountry.name.common}</p>
        `;

        borderingCountries.appendChild(div);

    } catch (error) {
        console.error("Border fetch failed");
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    searchCountry(countryInput.value);
});

countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCountry(countryInput.value);
    }
});
