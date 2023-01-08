const search = document.getElementById('search');
const searchTerm = document.getElementById('searchTerm');
const searchIn = document.getElementById('searchIn');
const filterRegion = document.getElementById('filterRegion');
const sortBy = document.getElementById('sortBy');
const formReset = document.getElementById('formReset');
const countriesDiv = document.getElementById('countries');
const countryDiv = document.getElementById('country');
const hits = document.getElementById('hits');

let state =
{
    searchTerm: searchTerm.value,
    searchIn: searchIn.value,
    filterRegion: 'all',
    sortBy: sortBy.value,
}

window.onload = () => {
    renderRegionOptions()
    getCountries()
}

function renderRegionOptions() {
    fetch('https://restcountries.com/v3.1/all')
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            const regions = [...new Set(response.map((e) => e.region).flat(1))]
            var regionOptionsHTML = '<option value="all" selected>All</option>';
            regions.forEach(region => {
                regionOptionsHTML += `<option value="${region}">${region}</option>`
            })
            filterRegion.innerHTML = regionOptionsHTML;
        })
}

search.onsubmit = function (event) {
    event.preventDefault();
    state.searchTerm = searchTerm.value;
    getCountries();
}

formReset.addEventListener('click', () => {
    state.searchTerm = '';
    countriesDiv.innerHTML = '';
    getCountries();
})

searchIn.addEventListener('change', function (event) {
    state.searchIn = event.target.value;
    state.searchTerm = searchTerm.value;
    getCountries();
})

filterRegion.addEventListener('change', function (event) {
    state.filterRegion = event.target.value;
    state.searchTerm = searchTerm.value;
    getCountries();
})

sortBy.addEventListener('change', function (event) {
    state.sortBy = event.target.value;
    state.searchTerm = searchTerm.value;
    getCountries();
})

function getCountries() {
    if (state.searchTerm.length > 0) {
        apiUrl = `https://restcountries.com/v3.1/${state.searchIn}/${state.searchTerm}`
    }
    else apiUrl = 'https://restcountries.com/v3.1/all';

    fetch(apiUrl)
        .then(function (response) {
            if (!response.ok) {
                return Promise.reject('No result')
            }
            return response.json();
        })
        .then(function (countries) {
            renderCountries(countries)
        })
        .catch(function (error) {
            countriesDiv.innerHTML = '';
            hits.innerHTML = 'Number of hits: ' + error
        })
}

function renderCountries(countries) {
    switch (state.sortBy) {
        case 'sortByNameAZ':
            countries.sort((a, b) => {
                if (a.name.common < b.name.common) { return -1 }
                if (a.name.common > b.name.common) { return 1 }
                return 0
            })
            break;
        case 'sortByNameZA':
            countries.sort((a, b) => {
                if (a.name.common > b.name.common) { return -1 }
                if (a.name.common < b.name.common) { return 1 }
                return 0
            })
            break;
        case 'sortByPopulationAsc':
            countries.sort((a, b) => b.population - a.population)
            break;
        case 'sortByPopulationDesc':
            countries.sort((a, b) => a.population - b.population)
        default:
            break;
    }
    if (state.filterRegion != 'all') countries = countries.filter(country => country.region == state.filterRegion)
    hits.innerHTML = 'Number of hits: ' + countries.length;
    var countriesHTML = '<ul role="list">';
    countries.forEach(country => {
        countriesHTML += `<li class="country-card" data-id="${country.name.common}">`;
        countriesHTML += `<img loading="lazy" src="${country.flags.png}" alt="${country.name.common} flag">`;
        countriesHTML += `<div class="content">`;
        countriesHTML += `<h3>${country.name.common}</h3>`;
        countriesHTML += `<div><strong>Population:</strong> ${new Intl.NumberFormat('hu-HU').format(country.population)}</div>`;
        countriesHTML += `<div><strong>Region:</strong> ${country.region} (${country.subregion})</div>`;
        countriesHTML += `<div><strong>Capital:</strong> ${country.capital}</div>`;
        countriesHTML += `</div>`;
        countriesHTML += `</li>`;
    });
    countriesHTML += '</ul>';
    countriesDiv.innerHTML = countriesHTML;

    for (var card of document.querySelectorAll('.country-card')) {
        card.onclick = function (e) {
            const country = e.currentTarget.dataset.id
            renderCountry(country);
        }
    }

}

function renderCountry(country) {
    var countryHTML = `<dialog open>
        ${country}
        <form method="dialog">
          <button>Close</button>
        </form>
      </dialog>`;
    countryDiv.innerHTML = countryHTML

}