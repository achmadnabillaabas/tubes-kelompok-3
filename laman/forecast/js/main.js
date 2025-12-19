/**
 * Main JS - Entry point & orchestrator
 */

// Global state
let currentLocation = {
    lat: CONFIG.defaultLat,
    lon: CONFIG.defaultLon,
    name: CONFIG.defaultLocation
};



/**
 * Initialize application
 */
async function initApp() {
    console.log('Initializing Forecast+ app...');
    console.log('CONFIG:', CONFIG);
    
    WeatherUI.setLoading(true);
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup scroll animations
    WeatherUI.setupScrollAnimations();
    
    // Load REAL weather data from API
    try {
        console.log('Loading REAL weather data from API...');
        await loadWeatherData(currentLocation.lat, currentLocation.lon);
        console.log('Real weather data loaded successfully!');
    } catch (error) {
        console.error('Failed to load real weather data:', error);
        
        // Only use demo as last resort
        console.log('Using demo data as fallback...');
        loadDemoData();
    }
    
    WeatherUI.setLoading(false);
    
    // Emergency fallback - hide loading after 3 seconds no matter what
    setTimeout(() => {
        console.log('Emergency timeout: Forcing loading to stop');
        WeatherUI.setLoading(false);
        
        // If still no data, load demo
        if (!WeatherUI.currentWeatherData) {
            console.log('No data loaded, using demo data');
            loadDemoData();
        }
    }, 3000);
}

/**
 * Load all weather data
 */
async function loadWeatherData(lat, lon, accuracy = null) {
    try {
        console.log(`Loading weather data for coordinates: ${lat}, ${lon}`);
        if (accuracy) {
            console.log(`GPS Accuracy: ${accuracy}m`);
        }
        
        // Get current weather with timeout
        const currentWeather = await Promise.race([
            WeatherAPI.getCurrentWeather(lat, lon),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        console.log('Current weather loaded:', currentWeather);
        
        // Override location name if accuracy is provided (from GPS)
        if (accuracy) {
            try {
                const correctedLocation = await WeatherAPI.getLocationName(lat, lon, accuracy);
                currentWeather.location = correctedLocation;
                console.log('Location corrected to:', correctedLocation);
            } catch (error) {
                console.warn('Failed to correct location:', error);
            }
        }
        
        WeatherUI.updateHero(currentWeather);
        WeatherUI.updateTodayDetails(currentWeather);
        
        // Get forecast data with timeout
        const forecastData = await Promise.race([
            WeatherAPI.getForecast(lat, lon),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        console.log('Forecast data loaded:', forecastData);
        WeatherUI.currentForecastData = forecastData;
        
        // Forecast data loaded and ready for unit conversion
        
        // Update hourly forecast with REAL API data
        console.log(`📊 Updating hourly forecast with ${forecastData.hourly.length} hours of REAL data from API`);
        WeatherUI.updateHourlyCards(forecastData.hourly);
        
        // Update daily forecast with REAL API data
        console.log(`📅 Updating daily forecast with ${forecastData.daily.length} days of REAL data from API`);
        WeatherUI.updateDailyList(forecastData.daily);
        
        // Update charts (with error handling)
        try {
            if (typeof WeatherCharts !== 'undefined') {
                WeatherCharts.updateCharts(forecastData.hourly, forecastData.daily);
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
        

        
        // Initialize map (with error handling)
        try {
            if (typeof WeatherMap !== 'undefined') {
                WeatherMap.initMap(lat, lon);
                WeatherMap.addWeatherMarker(lat, lon, currentWeather);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
        
        // Update current location
        currentLocation.lat = lat;
        currentLocation.lon = lon;
        currentLocation.name = currentWeather.location;
        
        console.log('Weather data loading completed successfully');
        
    } catch (error) {
        console.error('Error loading weather data:', error);
        
        // Show user-friendly error message
        WeatherAPI.showError('Tidak dapat memuat data cuaca. Menggunakan data demo.');
        
        // Load demo data as fallback
        console.log('Loading demo data as fallback...');
        loadDemoData();
        
        // Ensure loading is hidden
        WeatherUI.setLoading(false);
    }
}

/**
 * Load demo data when API fails
 */
function loadDemoData() {
    console.log('Loading demo data as fallback...');
    
    // Demo current weather data for Kediri
    const demoCurrentWeather = {
        location: 'Kota Kediri, ID',
        temp: 28,
        feelsLike: 32,
        description: 'berawan sebagian',
        icon: 'sun',
        iconUrl: 'https://openweathermap.org/img/wn/03d@4x.png',
        humidity: 78,
        pressure: 1013,
        windSpeed: 8,
        windDeg: 180,
        windDirection: 'S',
        clouds: 40,
        visibility: 9.0,
        sunrise: Math.floor(new Date().setHours(5, 45, 0, 0) / 1000), // 05:45 WIB
        sunset: Math.floor(new Date().setHours(17, 50, 0, 0) / 1000), // 17:50 WIB
        condition: 'Clouds',
        isNight: false,
        dt: Math.floor(Date.now() / 1000)
    };
    
    // Demo hourly data for Kediri (24 hours: 01:00-24:00)
    const demoHourlyData = [
        // Jam 01:00 - 06:00 (Dini Hari - Subuh)
        { dt: Math.floor(Date.now() / 1000), time: '01:00', hour: 1, temp: 23, feelsLike: 26, description: 'cerah', icon: '01n', iconUrl: 'https://openweathermap.org/img/wn/01n@2x.png', pop: 5, humidity: 85, windSpeed: 3 },
        { dt: Math.floor(Date.now() / 1000) + 3600, time: '02:00', hour: 2, temp: 22, feelsLike: 25, description: 'cerah', icon: '01n', iconUrl: 'https://openweathermap.org/img/wn/01n@2x.png', pop: 5, humidity: 87, windSpeed: 2 },
        { dt: Math.floor(Date.now() / 1000) + 7200, time: '03:00', hour: 3, temp: 22, feelsLike: 25, description: 'berawan tipis', icon: '03n', iconUrl: 'https://openweathermap.org/img/wn/03n@2x.png', pop: 10, humidity: 88, windSpeed: 2 },
        { dt: Math.floor(Date.now() / 1000) + 10800, time: '04:00', hour: 4, temp: 21, feelsLike: 24, description: 'berawan tipis', icon: '03n', iconUrl: 'https://openweathermap.org/img/wn/03n@2x.png', pop: 10, humidity: 90, windSpeed: 3 },
        { dt: Math.floor(Date.now() / 1000) + 14400, time: '05:00', hour: 5, temp: 22, feelsLike: 25, description: 'berawan tipis', icon: '03n', iconUrl: 'https://openweathermap.org/img/wn/03n@2x.png', pop: 15, humidity: 88, windSpeed: 4 },
        { dt: Math.floor(Date.now() / 1000) + 18000, time: '06:00', hour: 6, temp: 23, feelsLike: 26, description: 'berawan tipis', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 20, humidity: 85, windSpeed: 5 },
        
        // Jam 07:00 - 12:00 (Pagi - Siang)
        { dt: Math.floor(Date.now() / 1000) + 21600, time: '07:00', hour: 7, temp: 25, feelsLike: 28, description: 'berawan tipis', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 15, humidity: 80, windSpeed: 6 },
        { dt: Math.floor(Date.now() / 1000) + 25200, time: '08:00', hour: 8, temp: 27, feelsLike: 30, description: 'cerah', icon: '01d', iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png', pop: 10, humidity: 75, windSpeed: 7 },
        { dt: Math.floor(Date.now() / 1000) + 28800, time: '09:00', hour: 9, temp: 29, feelsLike: 32, description: 'cerah', icon: '01d', iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png', pop: 5, humidity: 70, windSpeed: 8 },
        { dt: Math.floor(Date.now() / 1000) + 32400, time: '10:00', hour: 10, temp: 31, feelsLike: 35, description: 'cerah', icon: '01d', iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png', pop: 5, humidity: 65, windSpeed: 9 },
        { dt: Math.floor(Date.now() / 1000) + 36000, time: '11:00', hour: 11, temp: 33, feelsLike: 37, description: 'berawan tipis', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 10, humidity: 60, windSpeed: 10 },
        { dt: Math.floor(Date.now() / 1000) + 39600, time: '12:00', hour: 12, temp: 34, feelsLike: 38, description: 'berawan tipis', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 20, humidity: 58, windSpeed: 11 },
        
        // Jam 13:00 - 18:00 (Siang - Sore)
        { dt: Math.floor(Date.now() / 1000) + 43200, time: '13:00', hour: 13, temp: 35, feelsLike: 39, description: 'berawan', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 30, humidity: 55, windSpeed: 12 },
        { dt: Math.floor(Date.now() / 1000) + 46800, time: '14:00', hour: 14, temp: 36, feelsLike: 40, description: 'berawan tebal', icon: '04d', iconUrl: 'https://openweathermap.org/img/wn/04d@2x.png', pop: 40, humidity: 52, windSpeed: 13 },
        { dt: Math.floor(Date.now() / 1000) + 50400, time: '15:00', hour: 15, temp: 35, feelsLike: 38, description: 'hujan ringan', icon: '09d', iconUrl: 'https://openweathermap.org/img/wn/09d@2x.png', pop: 60, humidity: 65, windSpeed: 12 },
        { dt: Math.floor(Date.now() / 1000) + 54000, time: '16:00', hour: 16, temp: 32, feelsLike: 35, description: 'hujan ringan', icon: '09d', iconUrl: 'https://openweathermap.org/img/wn/09d@2x.png', pop: 65, humidity: 75, windSpeed: 10 },
        { dt: Math.floor(Date.now() / 1000) + 57600, time: '17:00', hour: 17, temp: 30, feelsLike: 33, description: 'berawan', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 45, humidity: 78, windSpeed: 8 },
        { dt: Math.floor(Date.now() / 1000) + 61200, time: '18:00', hour: 18, temp: 28, feelsLike: 31, description: 'berawan', icon: '03d', iconUrl: 'https://openweathermap.org/img/wn/03d@2x.png', pop: 45, humidity: 80, windSpeed: 8 },
        
        // Jam 19:00 - 24:00 (Malam)
        { dt: Math.floor(Date.now() / 1000) + 64800, time: '19:00', hour: 19, temp: 27, feelsLike: 30, description: 'berawan', icon: '03n', iconUrl: 'https://openweathermap.org/img/wn/03n@2x.png', pop: 35, humidity: 82, windSpeed: 7 },
        { dt: Math.floor(Date.now() / 1000) + 68400, time: '20:00', hour: 20, temp: 26, feelsLike: 29, description: 'berawan', icon: '03n', iconUrl: 'https://openweathermap.org/img/wn/03n@2x.png', pop: 25, humidity: 83, windSpeed: 6 },
        { dt: Math.floor(Date.now() / 1000) + 72000, time: '21:00', hour: 21, temp: 25, feelsLike: 28, description: 'cerah', icon: '01n', iconUrl: 'https://openweathermap.org/img/wn/01n@2x.png', pop: 15, humidity: 84, windSpeed: 5 },
        { dt: Math.floor(Date.now() / 1000) + 75600, time: '22:00', hour: 22, temp: 24, feelsLike: 27, description: 'cerah', icon: '01n', iconUrl: 'https://openweathermap.org/img/wn/01n@2x.png', pop: 10, humidity: 85, windSpeed: 4 },
        { dt: Math.floor(Date.now() / 1000) + 79200, time: '23:00', hour: 23, temp: 24, feelsLike: 27, description: 'cerah', icon: '01n', iconUrl: 'https://openweathermap.org/img/wn/01n@2x.png', pop: 5, humidity: 86, windSpeed: 3 },
        { dt: Math.floor(Date.now() / 1000) + 82800, time: '24:00', hour: 0, temp: 23, feelsLike: 26, description: 'cerah', icon: '01n', iconUrl: 'https://openweathermap.org/img/wn/01n@2x.png', pop: 5, humidity: 87, windSpeed: 3 }
    ];
    
    // Demo daily data for Kediri (7 days)
    const demoDailyData = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // Realistic weather patterns for Kediri (tropical highland) - 10 days
    const kediriWeatherPatterns = [
        { maxTemp: 36, minTemp: 21, description: 'hujan ringan', icon: '09d', pop: 60, humidity: 78 },
        { maxTemp: 34, minTemp: 22, description: 'berawan', icon: '03d', pop: 45, humidity: 75 },
        { maxTemp: 33, minTemp: 23, description: 'berawan', icon: '03d', pop: 40, humidity: 72 },
        { maxTemp: 35, minTemp: 22, description: 'hujan ringan', icon: '09d', pop: 55, humidity: 77 },
        { maxTemp: 32, minTemp: 21, description: 'berawan sebagian', icon: '02d', pop: 35, humidity: 70 },
        { maxTemp: 34, minTemp: 23, description: 'cerah berawan', icon: '02d', pop: 25, humidity: 68 },
        { maxTemp: 33, minTemp: 22, description: 'cerah berawan', icon: '02d', pop: 20, humidity: 65 },
        { maxTemp: 31, minTemp: 20, description: 'berawan', icon: '03d', pop: 50, humidity: 80 },
        { maxTemp: 35, minTemp: 22, description: 'berawan tebal', icon: '04d', pop: 45, humidity: 76 },
        { maxTemp: 34, minTemp: 21, description: 'hujan ringan', icon: '09d', pop: 58, humidity: 79 }
    ];
    
    for (let i = 0; i < 10; i++) {
        const date = new Date(Date.now() + i * 24 * 3600000);
        const pattern = kediriWeatherPatterns[i];
        
        demoDailyData.push({
            dt: Math.floor(date.getTime() / 1000),
            date: date,
            dayName: i === 0 ? 'Hari Ini' : (i === 1 ? 'Besok' : (i === 2 ? 'Lusa' : days[date.getDay()])),
            dateStr: `${date.getDate()} ${months[date.getMonth()]}`,
            maxTemp: pattern.maxTemp,
            minTemp: pattern.minTemp,
            description: pattern.description,
            icon: pattern.icon,
            iconUrl: `https://openweathermap.org/img/wn/${pattern.icon}@2x.png`,
            pop: pattern.pop,
            humidity: pattern.humidity
        });
    }
    
    const demoForecastData = {
        hourly: demoHourlyData,
        daily: demoDailyData
    };
    
    // Update UI with demo data
    try {
        WeatherUI.updateHero(demoCurrentWeather);
        WeatherUI.updateTodayDetails(demoCurrentWeather);
        WeatherUI.currentForecastData = demoForecastData;
        
        // Demo data loaded and ready for unit conversion
        
        WeatherUI.updateHourlyCards(demoForecastData.hourly);
        WeatherUI.updateDailyList(demoForecastData.daily);
        
        // Try to update charts (may fail if Chart.js not loaded)
        try {
            WeatherCharts.updateCharts(demoForecastData.hourly, demoForecastData.daily);
        } catch (error) {
            console.log('Charts not available:', error.message);
        }
        

        
        // Try to init map (may fail if Leaflet not loaded)
        try {
            WeatherMap.initMap(currentLocation.lat, currentLocation.lon);
        } catch (error) {
            console.log('Map not available:', error.message);
        }
        
        console.log('Demo data loaded successfully');
    } catch (error) {
        console.error('Error loading demo data:', error);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // City search functionality
    setupCitySearch();
    
    // Use current location
    const useLocationBtn = document.getElementById('useLocationBtn');
    
    if (useLocationBtn) {
        console.log('✅ Location button found, attaching listener');
        useLocationBtn.addEventListener('click', () => {
            console.log('Location button clicked!');
            handleUseLocation();
        });
    } else {
        console.error('❌ Location button not found!');
    }
    
    // Unit toggle
    const unitToggle = document.getElementById('unitToggle');
    if (unitToggle) {
        unitToggle.addEventListener('click', () => {
            // Visual feedback
            try {
                unitToggle.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    unitToggle.style.transform = 'scale(1)';
                }, 150);
            } catch (e) {
                // ignore visual errors
            }

            WeatherUI.toggleUnit();

            // Show feedback
            const unit = WeatherUI.currentUnit === 'C' ? 'Celsius' : 'Fahrenheit';
            showSuccessMessage(`Unit suhu diubah ke ${unit}`);
        });
    } else {
        console.warn('Unit toggle element not found: #unitToggle');
    }
    
    // Hourly view toggle
    const viewCards = document.getElementById('viewCards');
    const viewChart = document.getElementById('viewChart');
    if (viewCards && viewChart) {
        viewCards.addEventListener('click', () => {
            showHourlyView('cards');
            viewCards.classList.add('active');
            viewChart.classList.remove('active');
        });

        viewChart.addEventListener('click', () => {
            showHourlyView('chart');
            viewChart.classList.add('active');
            viewCards.classList.remove('active');
        });
    } else {
        if (!viewCards) console.warn('Element not found: #viewCards');
        if (!viewChart) console.warn('Element not found: #viewChart');
    }
    
    // Hourly slider arrows
    const hourlyPrev = document.getElementById('hourlyPrev');
    const hourlyNext = document.getElementById('hourlyNext');
    const hourlyCardsWrapper = document.getElementById('hourlyCardsWrapper');
    if (hourlyPrev && hourlyNext && hourlyCardsWrapper) {
        hourlyPrev.addEventListener('click', () => {
            hourlyCardsWrapper.scrollBy({ left: -300, behavior: 'smooth' });
        });

        hourlyNext.addEventListener('click', () => {
            hourlyCardsWrapper.scrollBy({ left: 300, behavior: 'smooth' });
        });
    } else {
        if (!hourlyPrev) console.warn('Element not found: #hourlyPrev');
        if (!hourlyNext) console.warn('Element not found: #hourlyNext');
        if (!hourlyCardsWrapper) console.warn('Element not found: #hourlyCardsWrapper');
    }
    
    // Center map button
    const centerMapBtn = document.getElementById('centerMapBtn');
    if (centerMapBtn) {
        centerMapBtn.addEventListener('click', () => {
            if (typeof WeatherMap !== 'undefined' && WeatherMap.centerToLocation) {
                WeatherMap.centerToLocation(currentLocation.lat, currentLocation.lon);
            } else {
                console.warn('WeatherMap not available to center map');
            }
        });
    } else {
        console.warn('Element not found: #centerMapBtn');
    }
    
    // Smooth scroll for navigation — only handle in-page anchors (href starting with '#')
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';

            // If it's a hash anchor, handle smooth scrolling; otherwise allow normal navigation
            if (href.charAt(0) === '#') {
                e.preventDefault();
                try {
                    const targetSection = document.querySelector(href);
                    if (targetSection) {
                        const navbar = document.getElementById('navbar');
                        const navbarHeight = navbar ? navbar.offsetHeight : 0;
                        const targetPosition = targetSection.offsetTop - navbarHeight - 20;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                } catch (err) {
                    // Invalid selector (shouldn't happen for proper #ids) — ignore safely
                    console.warn('Invalid anchor selector, skipping smooth scroll:', href, err);
                }

                // Update active class for anchors
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            } else {
                // Non-hash links (e.g. ?page=...) — don't prevent default, let browser navigate.
                // Add active class briefly; page reload will update state.
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const navbarHeight = document.getElementById('navbar').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Setup daily detail modal
    WeatherUI.setupDailyDetailModal();
}







/**
 * Setup city search functionality
 */
function setupCitySearch() {
    const searchInput = document.getElementById('citySearchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) {
        console.error('Search elements not found');
        return;
    }
    
    let searchTimeout;
    let isSearching = false;
    
    // Handle input changes
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        // Hide results if query is too short
        if (query.length < 2) {
            searchResults.classList.remove('show');
            searchResults.innerHTML = '';
            return;
        }
        
        // Show loading state
        searchResults.classList.add('show');
        searchResults.innerHTML = '<div class="search-loading">🔍 Mencari kota...</div>';
        
        // Debounce search
        searchTimeout = setTimeout(async () => {
            if (isSearching) return;
            
            isSearching = true;
            
            try {
                const cities = await WeatherAPI.searchCities(query);
                
                if (cities.length === 0) {
                    searchResults.innerHTML = '<div class="search-no-results">Tidak ada kota ditemukan</div>';
                } else {
                    searchResults.innerHTML = cities.map(city => `
                        <div class="search-result-item" data-lat="${city.lat}" data-lon="${city.lon}" data-name="${city.displayName}">
                            <div class="city-name">${city.name}</div>
                            <div class="city-details">${city.state ? city.state + ', ' : ''}${city.country}</div>
                        </div>
                    `).join('');
                    
                    // Add click handlers to results
                    searchResults.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const lat = parseFloat(item.dataset.lat);
                            const lon = parseFloat(item.dataset.lon);
                            const name = item.dataset.name;
                            
                            handleCitySelection(lat, lon, name);
                        });
                    });
                }
            } catch (error) {
                console.error('Search error:', error);
                searchResults.innerHTML = '<div class="search-error">❌ Gagal mencari kota. Coba lagi.</div>';
            } finally {
                isSearching = false;
            }
        }, 500); // 500ms debounce
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });
    
    // Show results when focusing on input (if there's content)
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2 && searchResults.innerHTML) {
            searchResults.classList.add('show');
        }
    });
}

/**
 * Handle city selection from search results
 */
async function handleCitySelection(lat, lon, cityName) {
    console.log(`City selected: ${cityName} (${lat}, ${lon})`);
    
    // Hide search results
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('citySearchInput');
    
    searchResults.classList.remove('show');
    searchInput.value = '';
    
    // Show loading
    WeatherUI.setLoading(true);
    
    try {
        // Load weather data for selected city
        await loadWeatherData(lat, lon);
        
        // Update current location
        currentLocation.lat = lat;
        currentLocation.lon = lon;
        currentLocation.name = cityName;
        
        // Show success message
        showSuccessMessage(`Cuaca untuk ${cityName} berhasil dimuat`);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('Weather data loaded for:', cityName);
    } catch (error) {
        console.error('Error loading city weather:', error);
        WeatherAPI.showError(`Gagal memuat data cuaca untuk ${cityName}`);
    } finally {
        WeatherUI.setLoading(false);
    }
}

/**
 * Handle use current location
 */
function handleUseLocation() {
    console.log('=== USE LOCATION FUNCTION CALLED ===');
    
    const useLocationBtn = document.getElementById('useLocationBtn');
    
    if (!useLocationBtn) {
        console.error('Location button not found!');
        return;
    }
    
    if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        WeatherAPI.showError('Geolocation tidak didukung oleh browser Anda');
        return;
    }
    
    // Visual feedback
    console.log('Requesting geolocation...');
    useLocationBtn.disabled = true;
    const originalText = useLocationBtn.textContent;
    useLocationBtn.textContent = '📍 Mencari lokasi...';
    
    WeatherUI.setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log(`📍 Current location detected:`);
            console.log(`  Latitude: ${lat}`);
            console.log(`  Longitude: ${lon}`);
            console.log(`  Accuracy: ${accuracy} meters`);
            
            // Check if accuracy is poor (> 1000m = 1km)
            if (accuracy > 1000) {
                console.warn(`⚠️ Low GPS accuracy: ${accuracy}m`);
                console.warn('Location might not be precise. Consider using WiFi/Mobile data.');
            }
            
            try {
                console.log('Loading weather data for current location...');
                // Pass accuracy to loadWeatherData for smart correction
                await loadWeatherData(lat, lon, accuracy);
                console.log('✅ Weather data loaded for:', currentLocation.name);
                
                // Show accuracy info in success message
                let accuracyText = '';
                let accuracyWarning = '';
                
                if (accuracy > 50000) {
                    accuracyText = ` (Akurasi: ~${(accuracy/1000).toFixed(0)}km - Sangat Buruk!)`;
                    accuracyWarning = '⚠️ GPS tidak akurat! Lokasi dikoreksi ke kota terdekat.';
                } else if (accuracy > 10000) {
                    accuracyText = ` (Akurasi: ~${(accuracy/1000).toFixed(1)}km - Kurang Akurat)`;
                    accuracyWarning = '⚠️ GPS kurang akurat. Lokasi dikoreksi.';
                } else if (accuracy > 1000) {
                    accuracyText = ` (Akurasi: ~${(accuracy/1000).toFixed(1)}km)`;
                } else {
                    accuracyText = ` (Akurasi: ${Math.round(accuracy)}m)`;
                }
                
                showSuccessMessage(`Lokasi: ${currentLocation.name}${accuracyText}`);
                
                if (accuracyWarning) {
                    setTimeout(() => {
                        showSuccessMessage(accuracyWarning);
                    }, 3500);
                }
                
                console.log('=== USE LOCATION COMPLETED SUCCESSFULLY ===');
            } catch (error) {
                console.error('❌ Error loading location data:', error);
                WeatherAPI.showError('Gagal memuat data cuaca untuk lokasi Anda');
            } finally {
                useLocationBtn.disabled = false;
                useLocationBtn.textContent = originalText;
                WeatherUI.setLoading(false);
            }
        },
        (error) => {
            console.error('❌ Geolocation error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Tidak dapat mengakses lokasi Anda.';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.';
                    console.error('User denied geolocation permission');
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif.';
                    console.error('Position unavailable');
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Waktu permintaan lokasi habis. Coba lagi.';
                    console.error('Geolocation timeout');
                    break;
                default:
                    console.error('Unknown geolocation error');
            }
            
            WeatherAPI.showError(errorMessage);
            useLocationBtn.disabled = false;
            useLocationBtn.textContent = originalText;
            WeatherUI.setLoading(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 20000,  // Increased timeout to 20 seconds for better GPS lock
            maximumAge: 0    // Don't use cached position
        }
    );
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show hourly view (cards or chart)
 */
function showHourlyView(view) {
    const cardsContainer = document.getElementById('hourlyCards');
    const chartContainer = document.getElementById('hourlyChart');
    
    if (view === 'cards') {
        // Morph animation: chart -> cards
        chartContainer.style.opacity = '0';
        chartContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            chartContainer.style.display = 'none';
            cardsContainer.style.display = 'block';
            cardsContainer.style.opacity = '0';
            cardsContainer.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                cardsContainer.style.transition = 'all 0.3s ease-out';
                cardsContainer.style.opacity = '1';
                cardsContainer.style.transform = 'scale(1)';
            }, 50);
        }, 300);
    } else {
        // Morph animation: cards -> chart
        cardsContainer.style.opacity = '0';
        cardsContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            cardsContainer.style.display = 'none';
            chartContainer.style.display = 'block';
            chartContainer.style.opacity = '0';
            chartContainer.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                chartContainer.style.transition = 'all 0.3s ease-out';
                chartContainer.style.opacity = '1';
                chartContainer.style.transform = 'scale(1)';
            }, 50);
        }, 300);
    }
}

/**
 * Handle errors globally
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});



// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Refresh data every 10 minutes
setInterval(() => {
    console.log('Refreshing weather data...');
    loadWeatherData(currentLocation.lat, currentLocation.lon);
}, 10 * 60 * 1000);
