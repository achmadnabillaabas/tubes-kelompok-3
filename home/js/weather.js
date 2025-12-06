const API_KEY = '841424fc89a9a338c8855c101ff05d35';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const provincialCapitals = [
    'Banda Aceh,ID', 'Medan,ID', 'Padang,ID', 'Pekanbaru,ID', 'Jambi,ID', 'Palembang,ID',
    'Bengkulu,ID', 'Bandar Lampung,ID', 'Pangkal Pinang,ID', 'Tanjung Pinang,ID',
    'Jakarta,ID', 'Bandung,ID', 'Semarang,ID', 'Yogyakarta,ID', 'Surabaya,ID',
    'Serang,ID', 'Denpasar,ID', 'Mataram,ID', 'Kupang,ID', 'Pontianak,ID',
    'Palangkaraya,ID', 'Banjarmasin,ID', 'Samarinda,ID', 'Tanjung Selor,ID',
    'Manado,ID', 'Gorontalo,ID', 'Palu,ID', 'Makassar,ID', 'Kendari,ID',
    'Mamuju,ID', 'Ambon,ID', 'Ternate,ID', 'Manokwari,ID', 'Jayapura,ID'
];

// Weather form submission
document.getElementById('weatherForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const city = document.getElementById('cityInput').value;
    const unit = document.getElementById('unitSelect').value;
    const loading = document.querySelector('.loading');
    const result = document.getElementById('weatherResult');
    
    loading.style.display = 'block';
    result.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=id`);
        const data = await response.json();
        
        if (response.ok) {
            displayWeather(data, unit);
        } else {
            result.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> ${data.message || 'Kota tidak ditemukan'}</div>`;
            result.style.display = 'block';
        }
    } catch (error) {
        result.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Terjadi kesalahan saat mengambil data</div>`;
        result.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
});

function displayWeather(data, unit) {
    const result = document.getElementById('weatherResult');
    const tempUnit = unit === 'metric' ? '°C' : '°F';
    const windUnit = unit === 'metric' ? 'm/s' : 'mph';
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    
    result.innerHTML = `
        <div class="text-center">
            <h3><i class="bi bi-geo-alt-fill"></i> ${data.name}, ${data.sys.country}</h3>
            <div class="weather-icon" style="font-size: 4rem;">${weatherIcon}</div>
            <h1 style="font-size: 3.5rem; font-weight: bold;">${Math.round(data.main.temp)}${tempUnit}</h1>
            <h4>${data.weather[0].description}</h4>
            <div class="row mt-4">
                <div class="col-4">
                    <i class="bi bi-thermometer-half"></i><br>
                    <strong>Terasa</strong><br>
                    ${Math.round(data.main.feels_like)}${tempUnit}
                </div>
                <div class="col-4">
                    <i class="bi bi-droplet"></i><br>
                    <strong>Kelembapan</strong><br>
                    ${data.main.humidity}%
                </div>
                <div class="col-4">
                    <i class="bi bi-wind"></i><br>
                    <strong>Angin</strong><br>
                    ${data.wind.speed} ${windUnit}
                </div>
            </div>
        </div>
    `;
    result.style.display = 'block';
}

function getWeatherIcon(weather) {
    const icons = {
        'Clear': '☀️', 
        'Clouds': '☁️', 
        'Rain': '🌧️', 
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️', 
        'Snow': '❄️', 
        'Mist': '🌫️', 
        'Fog': '🌫️', 
        'Haze': '🌫️'
    };
    return icons[weather] || '🌤️';
}

function getWeatherBackground(weatherData) {
    const main = weatherData.main;
    const description = weatherData.description.toLowerCase();
    
    // Check for specific cloud conditions
    if (main === 'Clear') {
        return 'img/clear.jpg';
    } else if (main === 'Clouds') {
        // few clouds = sedikit berawan (11-25%)
        // scattered clouds = berawan tersebar (25-50%)
        // broken clouds = berawan pecah (51-84%)
        // overcast clouds = mendung (85-100%)
        if (description.includes('few clouds') || description.includes('sedikit berawan')) {
            return 'img/default.jpg';
        } else {
            return 'img/clouds.jpg';
        }
    } else if (main === 'Rain') {
        // light rain = hujan ringan/rintik-rintik
        // moderate rain = hujan sedang
        // heavy rain = hujan lebat
        if (description.includes('light rain') || 
            description.includes('hujan ringan') || 
            description.includes('rintik')) {
            return 'img/drizzle.jpg';
        } else {
            return 'img/rain.jpg';
        }
    } else if (main === 'Drizzle') {
        return 'img/drizzle.jpg';
    } else if (main === 'Thunderstorm') {
        return 'img/thunderstorm.jpg';
    } else if (main === 'Snow') {
        return 'img/snow.jpg';
    } else if (main === 'Mist') {
        return 'img/mist.jpg';
    } else if (main === 'Fog') {
        return 'img/fog.jpg';
    } else if (main === 'Haze') {
        return 'img/haze.jpg';
    }
    
    return 'img/default.jpg';
}

async function loadPopularCities() {
    const container = document.getElementById('popularCities');
    const citiesData = [];
    
    // Fetch weather data for all cities
    for (const city of provincialCapitals) {
        try {
            const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`);
            const data = await response.json();
            if (response.ok) citiesData.push(data);
        } catch (error) {
            console.error('Error loading city:', city, error);
        }
    }
    
    // Create carousel items (3 cities per slide)
    container.innerHTML = '';
    const citiesPerSlide = 3;
    const totalSlides = Math.ceil(citiesData.length / citiesPerSlide);
    
    for (let i = 0; i < totalSlides; i++) {
        const startIdx = i * citiesPerSlide;
        const endIdx = Math.min(startIdx + citiesPerSlide, citiesData.length);
        const slideActive = i === 0 ? 'active' : '';
        
        let slideHTML = `<div class="carousel-item ${slideActive}"><div class="row">`;
        
        for (let j = startIdx; j < endIdx; j++) {
            const data = citiesData[j];
            const weatherIcon = getWeatherIcon(data.weather[0].main);
            
            const weatherBg = getWeatherBackground(data.weather[0]);
            
            slideHTML += `
                <div class="col-md-4">
                    <div class="city-card" onclick="searchCity('${data.name},ID')" style="background-image: url('${weatherBg}');">
                        <h5><i class="bi bi-geo-alt-fill"></i> ${data.name}</h5>
                        <div class="weather-icon">${weatherIcon}</div>
                        <div class="temp">${Math.round(data.main.temp)}°C</div>
                        <p class="mb-2"><strong>${data.weather[0].description}</strong></p>
                        <small class="text-muted">
                            <i class="bi bi-droplet"></i> ${data.main.humidity}% | 
                            <i class="bi bi-wind"></i> ${data.wind.speed} m/s
                        </small>
                    </div>
                </div>
            `;
        }
        
        slideHTML += '</div></div>';
        container.innerHTML += slideHTML;
    }
}

function searchCity(cityName) {
    document.getElementById('cityInput').value = cityName;
    document.getElementById('weatherForm').dispatchEvent(new Event('submit'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load popular cities when page loads
window.addEventListener('load', loadPopularCities);

// Dark Mode Toggle Switch
const themeCheckbox = document.getElementById('themeCheckbox');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeCheckbox.checked = true;
}

themeCheckbox.addEventListener('change', function() {
    if (this.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});

// Testimonial Management
const testimonialForm = document.getElementById('testimonialForm');
const testimonialList = document.getElementById('testimonialList');
const testimonialMessage = document.getElementById('testimonialMessage');
const charCount = document.getElementById('charCount');

// Character counter
testimonialMessage.addEventListener('input', function() {
    charCount.textContent = this.value.length;
});

// Load testimonials from localStorage
function loadTestimonials() {
    const testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
    
    // Clear current list except default testimonials
    const defaultTestimonials = testimonialList.innerHTML;
    
    // Add user testimonials
    testimonials.forEach((testimonial, index) => {
        const testimonialHTML = `
            <div class="col-md-6">
                <div class="testimonial-card user-testimonial">
                    <button class="delete-btn" onclick="deleteTestimonial(${index})" title="Hapus testimoni">×</button>
                    <div class="quote">
                        "${testimonial.message}"
                    </div>
                    <div class="author">
                        <span class="emoji-3d">👤</span> ${testimonial.name}, ${testimonial.city}
                    </div>
                </div>
            </div>
        `;
        testimonialList.insertAdjacentHTML('beforeend', testimonialHTML);
    });
}

// Save testimonial
testimonialForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('testimonialName').value.trim();
    const city = document.getElementById('testimonialCity').value.trim();
    const message = document.getElementById('testimonialMessage').value.trim();
    
    if (name && city && message) {
        // Get existing testimonials
        const testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
        
        // Add new testimonial
        testimonials.push({
            name: name,
            city: city,
            message: message,
            date: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        
        // Clear form
        testimonialForm.reset();
        charCount.textContent = '0';
        
        // Reload testimonials
        testimonialList.innerHTML = `
            <div class="col-md-6">
                <div class="testimonial-card">
                    <div class="quote">
                        "Sangat membantu sebelum berangkat kerja! Saya jadi tahu kapan harus bawa payung."
                    </div>
                    <div class="author">
                        <span class="emoji-3d">👤</span> Anin, Kediri
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="testimonial-card">
                    <div class="quote">
                        "Aplikasinya ringan dan tampilannya bagus banget. Mudah digunakan!"
                    </div>
                    <div class="author">
                        <span class="emoji-3d">👤</span> Leo, Kediri
                    </div>
                </div>
            </div>
        `;
        loadTestimonials();
        
        // Show success message
        alert('✅ Testimoni Anda berhasil ditambahkan!');
        
        // Scroll to testimonials
        testimonialList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Delete testimonial
function deleteTestimonial(index) {
    if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
        const testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
        testimonials.splice(index, 1);
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        
        // Reload testimonials
        testimonialList.innerHTML = `
            <div class="col-md-6">
                <div class="testimonial-card">
                    <div class="quote">
                        "Sangat membantu sebelum berangkat kerja! Saya jadi tahu kapan harus bawa payung."
                    </div>
                    <div class="author">
                        <span class="emoji-3d">👤</span> Anin, Kediri
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="testimonial-card">
                    <div class="quote">
                        "Aplikasinya ringan dan tampilannya bagus banget. Mudah digunakan!"
                    </div>
                    <div class="author">
                        <span class="emoji-3d">👤</span> Leo, Kediri
                    </div>
                </div>
            </div>
        `;
        loadTestimonials();
    }
}

// Load testimonials on page load
window.addEventListener('load', loadTestimonials);
