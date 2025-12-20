/**
 * Main JS - Entry point & orchestrator
 * HANYA MENGGUNAKAN REAL API - TIDAK ADA DEMO MODE
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
    
    // Setup daily detail modal
    WeatherUI.setupDailyDetailModal();
    
    // Simple background initialization
    console.log('🎨 Simple background system ready');
    
    // Load REAL weather data from API
    try {
        console.log('Loading REAL weather data from API...');
        await loadWeatherData(currentLocation.lat, currentLocation.lon);
        console.log('Real weather data loaded successfully!');
    } catch (error) {
        console.error('Failed to load real weather data:', error);
        
        // Show error to user
        WeatherAPI.showError('Gagal memuat data cuaca. Periksa koneksi internet dan API key.');
        WeatherUI.setLoading(false);
    }
    
    WeatherUI.setLoading(false);
    
    // Emergency fallback - hide loading after 3 seconds no matter what
    setTimeout(() => {
        console.log('Emergency timeout: Forcing loading to stop');
        WeatherUI.setLoading(false);
        
        // If still no data, show error
        if (!WeatherUI.currentWeatherData) {
            console.log('No data loaded after timeout');
            WeatherAPI.showError('Gagal memuat data cuaca. Periksa koneksi internet dan API key.');
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
        
        // Update background based on current weather - SIMPLE VERSION
        try {
            updateSimpleBackground(currentWeather);
        } catch (error) {
            console.error('Error updating weather background:', error);
        }
        
        // Get forecast data with timeout
        const forecastData = await Promise.race([
            WeatherAPI.getForecast(lat, lon),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        console.log('Forecast data loaded:', forecastData);
        
        WeatherUI.currentForecastData = forecastData;
        WeatherUI.updateHourlyCards(forecastData.hourly);
        WeatherUI.updateDailyList(forecastData.daily);
        
        // Try to update charts (may fail if Chart.js not loaded)
        try {
            WeatherCharts.updateCharts(forecastData.hourly, forecastData.daily);
            
            // Also update hourly chart if chart view is active
            updateHourlyChart();
        } catch (error) {
            console.log('Charts not available:', error.message);
        }
        
        // Try to update map (may fail if Leaflet not loaded)
        try {
            // Update map with current location
            if (typeof WeatherMap !== 'undefined') {
                WeatherMap.updateLocation(lat, lon, currentWeather.location);
                console.log('✅ Map updated with location');
            } else {
                console.log('Map module not available');
            }
        } catch (error) {
            console.log('Map not available:', error.message);
        }
        
        console.log('All weather data loaded successfully');
        
    } catch (error) {
        console.error('Error loading weather data:', error);
        throw error;
    }
}

/**
 * Handle geolocation errors
 */
function handleLocationError(error) {
    console.error('Geolocation error:', error);
    
    try {
        // Show user-friendly error message
        WeatherAPI.showError('Tidak dapat memuat data cuaca. Periksa koneksi internet dan API key.');
        
        // Ensure loading is hidden
        WeatherUI.setLoading(false);
    } catch (error) {
        console.error('Error in error handler:', error);
        WeatherUI.setLoading(false);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Use location button
    const useLocationBtn = document.getElementById('useLocationBtn');
    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', async () => {
            console.log('Use location button clicked');
            
            if (!navigator.geolocation) {
                WeatherAPI.showError('Geolocation tidak didukung oleh browser ini');
                return;
            }
            
            WeatherUI.setLoading(true);
            
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            };
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        const accuracy = position.coords.accuracy;
                        
                        console.log(`GPS Location: ${lat}, ${lon} (accuracy: ${accuracy}m)`);
                        
                        // Update global location
                        currentLocation.lat = lat;
                        currentLocation.lon = lon;
                        
                        await loadWeatherData(lat, lon, accuracy);
                        
                        // Update map with new location
                        if (typeof updateMapLocation === 'function') {
                            const weatherData = WeatherUI.currentWeatherData;
                            updateMapLocation(lat, lon, weatherData?.location || 'Lokasi GPS', weatherData);
                        }
                        
                        WeatherUI.setLoading(false);
                        
                    } catch (error) {
                        console.error('Error loading location weather:', error);
                        handleLocationError(error);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    let message = 'Gagal mendapatkan lokasi';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Akses lokasi ditolak. Silakan izinkan akses lokasi.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Informasi lokasi tidak tersedia.';
                            break;
                        case error.TIMEOUT:
                            message = 'Timeout mendapatkan lokasi.';
                            break;
                    }
                    
                    WeatherAPI.showError(message);
                    WeatherUI.setLoading(false);
                },
                options
            );
        });
    }
    
    // City search
    const citySearchInput = document.getElementById('citySearchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (citySearchInput && searchResults) {
        let searchTimeout;
        
        citySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                try {
                    const cities = await WeatherAPI.searchCities(query);
                    displaySearchResults(cities, searchResults);
                } catch (error) {
                    console.error('Search error:', error);
                    searchResults.style.display = 'none';
                }
            }, 300);
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!citySearchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
    
    // Unit toggle
    const unitToggle = document.getElementById('unitToggle');
    if (unitToggle) {
        unitToggle.addEventListener('click', () => {
            WeatherUI.toggleUnit();
        });
    }
    
    // Hourly view switching (Cards/Chart)
    setupHourlyViewSwitching();
}

/**
 * Display search results
 */
function displaySearchResults(cities, container) {
    if (!cities || cities.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    
    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = city.displayName;
        
        item.addEventListener('click', async () => {
            console.log('City selected:', city);
            
            // Update search input
            document.getElementById('citySearchInput').value = city.name;
            container.style.display = 'none';
            
            // Update global location
            currentLocation.lat = city.lat;
            currentLocation.lon = city.lon;
            currentLocation.name = city.displayName;
            
            // Load weather for selected city
            WeatherUI.setLoading(true);
            try {
                await loadWeatherData(city.lat, city.lon);
                
                // Update map with selected city
                if (typeof updateMapLocation === 'function') {
                    const weatherData = WeatherUI.currentWeatherData;
                    updateMapLocation(city.lat, city.lon, city.displayName, weatherData);
                }
                
                WeatherUI.setLoading(false);
            } catch (error) {
                console.error('Error loading city weather:', error);
                handleLocationError(error);
            }
        });
        
        container.appendChild(item);
    });
    
    container.style.display = 'block';
}

/**
 * Simple background update function
 */
function updateSimpleBackground(weatherData) {
    console.log('🎨 Updating simple background for condition:', weatherData.condition);
    
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
        console.warn('Hero section not found');
        return;
    }
    
    // Remove existing weather classes
    const weatherClasses = [
        'weather-clear', 'weather-sunny', 'weather-hot',
        'weather-clouds', 'weather-cloudy', 'weather-cool',
        'weather-rain', 'weather-rainy', 'weather-drizzle',
        'weather-storm', 'weather-thunderstorm',
        'weather-snow', 'weather-mist', 'weather-fog',
        'weather-night'
    ];
    
    heroSection.classList.remove(...weatherClasses);
    
    // Add appropriate weather class based on condition
    const condition = weatherData.condition.toLowerCase();
    const isNight = weatherData.isNight;
    
    if (isNight) {
        heroSection.classList.add('weather-night');
    } else if (condition.includes('clear') || condition.includes('sun')) {
        heroSection.classList.add('weather-sunny');
    } else if (condition.includes('cloud')) {
        heroSection.classList.add('weather-cloudy');
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        heroSection.classList.add('weather-rainy');
    } else if (condition.includes('storm') || condition.includes('thunder')) {
        heroSection.classList.add('weather-storm');
    } else if (condition.includes('snow')) {
        heroSection.classList.add('weather-snow');
    } else if (condition.includes('mist') || condition.includes('fog')) {
        heroSection.classList.add('weather-fog');
    } else {
        // Default to sunny for unknown conditions
        heroSection.classList.add('weather-sunny');
    }
    
    console.log('✅ Background updated successfully');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);/**

 * Setup hourly view switching between Cards and Chart
 */
function setupHourlyViewSwitching() {
    const viewCardsBtn = document.getElementById('viewCards');
    const viewChartBtn = document.getElementById('viewChart');
    const hourlyCardsContainer = document.getElementById('hourlyCards');
    const hourlyChartContainer = document.getElementById('hourlyChart');
    
    if (!viewCardsBtn || !viewChartBtn || !hourlyCardsContainer || !hourlyChartContainer) {
        console.warn('Hourly view switching elements not found');
        return;
    }
    
    // Cards view button
    viewCardsBtn.addEventListener('click', () => {
        console.log('🃏 Switching to Cards view');
        
        // Update button states
        viewCardsBtn.classList.add('active');
        viewChartBtn.classList.remove('active');
        
        // Show/hide containers
        hourlyCardsContainer.style.display = 'block';
        hourlyChartContainer.style.display = 'none';
    });
    
    // Chart view button
    viewChartBtn.addEventListener('click', () => {
        console.log('📊 Switching to Chart view');
        
        // Update button states
        viewChartBtn.classList.add('active');
        viewCardsBtn.classList.remove('active');
        
        // Show/hide containers
        hourlyCardsContainer.style.display = 'none';
        hourlyChartContainer.style.display = 'block';
        
        // Initialize or update chart when switching to chart view
        if (WeatherUI.currentForecastData && WeatherUI.currentForecastData.hourly) {
            console.log('📈 Initializing hourly chart with data');
            
            // Wait a bit for container to be visible
            setTimeout(() => {
                try {
                    // Get first 24 hours for chart
                    const hourlyData24 = WeatherUI.currentForecastData.hourly.slice(0, 24);
                    console.log(`📊 Chart data: ${hourlyData24.length} hours`);
                    
                    // Ensure Chart.js is available
                    if (typeof Chart !== 'undefined' && typeof WeatherCharts !== 'undefined') {
                        WeatherCharts.initHourlyChart(hourlyData24);
                        console.log('✅ Hourly chart initialized successfully');
                    } else {
                        console.error('❌ Chart.js or WeatherCharts not available');
                    }
                } catch (error) {
                    console.error('❌ Error initializing hourly chart:', error);
                }
            }, 200);
        } else {
            console.warn('⚠️ No hourly data available for chart');
        }
    });
    
    console.log('✅ Hourly view switching setup complete');
}

/**
 * Update hourly chart when data changes
 */
function updateHourlyChart() {
    if (WeatherUI.currentForecastData && WeatherUI.currentForecastData.hourly) {
        const hourlyData24 = WeatherUI.currentForecastData.hourly.slice(0, 24);
        
        // Only update if chart view is active
        const viewChartBtn = document.getElementById('viewChart');
        if (viewChartBtn && viewChartBtn.classList.contains('active')) {
            console.log('📊 Updating hourly chart');
            if (typeof WeatherCharts !== 'undefined') {
                WeatherCharts.initHourlyChart(hourlyData24);
            }
        }
    }
}

// Debug function to test hourly chart
window.testHourlyChart = () => {
    console.log('🧪 Testing hourly chart...');
    
    const viewChartBtn = document.getElementById('viewChart');
    const hourlyChartContainer = document.getElementById('hourlyChart');
    const canvas = document.getElementById('hourlyChartCanvas');
    
    console.log('Elements found:');
    console.log('- viewChartBtn:', !!viewChartBtn);
    console.log('- hourlyChartContainer:', !!hourlyChartContainer);
    console.log('- canvas:', !!canvas);
    console.log('- WeatherUI.currentForecastData:', !!WeatherUI.currentForecastData);
    console.log('- Chart.js available:', typeof Chart !== 'undefined');
    console.log('- WeatherCharts available:', typeof WeatherCharts !== 'undefined');
    
    if (viewChartBtn) {
        console.log('🔄 Switching to chart view...');
        viewChartBtn.click();
    }
};