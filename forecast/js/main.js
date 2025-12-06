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
    
    // Emergency fallback - hide loading after 5 seconds no matter what
    setTimeout(() => {
        WeatherUI.setLoading(false);
    }, 5000);
}

/**
 * Load all weather data
 */
async function loadWeatherData(lat, lon) {
    try {
        console.log(`Loading weather data for coordinates: ${lat}, ${lon}`);
        
        // Get current weather
        const currentWeather = await WeatherAPI.getCurrentWeather(lat, lon);
        console.log('Current weather loaded:', currentWeather);
        WeatherUI.updateHero(currentWeather);
        WeatherUI.updateTodayDetails(currentWeather);
        
        // Get forecast data
        const forecastData = await WeatherAPI.getForecast(lat, lon);
        console.log('Forecast data loaded:', forecastData);
        WeatherUI.currentForecastData = forecastData;
        
        // Update hourly forecast
        WeatherUI.updateHourlyCards(forecastData.hourly);
        
        // Update daily forecast
        WeatherUI.updateDailyList(forecastData.daily);
        
        // Update charts (with error handling)
        try {
            WeatherCharts.updateCharts(forecastData.hourly, forecastData.daily);
        } catch (error) {
            console.error('Error updating charts:', error);
        }
        
        // Generate insights
        WeatherUI.generateInsights(forecastData.daily);
        
        // Initialize map (with error handling)
        try {
            WeatherMap.initMap(lat, lon);
            WeatherMap.addWeatherMarker(lat, lon, currentWeather);
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
        WeatherAPI.showError('Tidak dapat memuat data cuaca. Periksa koneksi internet dan API key.');
        
        // Don't load demo data here since API will handle demo mode
        console.log('API error handled, demo mode will be used if configured');
        
        WeatherUI.setLoading(false);
    }
}

/**
 * Load demo data when API fails
 */
function loadDemoData() {
    console.log('Loading demo data as fallback...');
    
    // Demo current weather data
    const demoCurrentWeather = {
        location: 'Jakarta, Indonesia',
        temp: 28,
        feelsLike: 31,
        description: 'cerah berawan',
        icon: 'sun',
        iconUrl: 'https://openweathermap.org/img/wn/02d@4x.png',
        humidity: 75,
        pressure: 1013,
        windSpeed: 3.5,
        windDeg: 180,
        windDirection: 'S',
        clouds: 25,
        visibility: 10.0,
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 7200,
        condition: 'Clouds',
        isNight: false,
        dt: Math.floor(Date.now() / 1000)
    };
    
    // Demo hourly data
    const demoHourlyData = [];
    for (let i = 0; i < 24; i++) {
        const time = new Date(Date.now() + i * 3600000);
        demoHourlyData.push({
            dt: Math.floor(time.getTime() / 1000),
            time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            hour: time.getHours(),
            temp: 26 + Math.random() * 6,
            feelsLike: 28 + Math.random() * 6,
            description: 'cerah berawan',
            icon: '02d',
            iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
            pop: Math.floor(Math.random() * 50),
            humidity: 70 + Math.random() * 20,
            windSpeed: 2 + Math.random() * 3
        });
    }
    
    // Demo daily data
    const demoDailyData = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() + i * 24 * 3600000);
        demoDailyData.push({
            dt: Math.floor(date.getTime() / 1000),
            date: date,
            dayName: days[date.getDay()],
            dateStr: `${date.getDate()} ${months[date.getMonth()]}`,
            maxTemp: 28 + Math.random() * 4,
            minTemp: 22 + Math.random() * 4,
            description: 'cerah berawan',
            icon: '02d',
            iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
            pop: Math.floor(Math.random() * 60),
            humidity: 70 + Math.random() * 20
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
        WeatherUI.updateHourlyCards(demoForecastData.hourly);
        WeatherUI.updateDailyList(demoForecastData.daily);
        
        // Try to update charts (may fail if Chart.js not loaded)
        try {
            WeatherCharts.updateCharts(demoForecastData.hourly, demoForecastData.daily);
        } catch (error) {
            console.log('Charts not available:', error.message);
        }
        
        WeatherUI.generateInsights(demoForecastData.daily);
        
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
    // Search location
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Use current location
    const useLocationBtn = document.getElementById('useLocationBtn');
    useLocationBtn.addEventListener('click', handleUseLocation);
    
    // Unit toggle
    const unitToggle = document.getElementById('unitToggle');
    unitToggle.addEventListener('click', () => {
        WeatherUI.toggleUnit();
    });
    
    // Hourly view toggle
    const viewCards = document.getElementById('viewCards');
    const viewChart = document.getElementById('viewChart');
    
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
    
    // Hourly slider arrows
    const hourlyPrev = document.getElementById('hourlyPrev');
    const hourlyNext = document.getElementById('hourlyNext');
    const hourlyCardsWrapper = document.getElementById('hourlyCardsWrapper');
    
    hourlyPrev.addEventListener('click', () => {
        hourlyCardsWrapper.scrollBy({ left: -300, behavior: 'smooth' });
    });
    
    hourlyNext.addEventListener('click', () => {
        hourlyCardsWrapper.scrollBy({ left: 300, behavior: 'smooth' });
    });
    
    // Center map button
    const centerMapBtn = document.getElementById('centerMapBtn');
    centerMapBtn.addEventListener('click', () => {
        WeatherMap.centerToLocation(currentLocation.lat, currentLocation.lon);
    });
    
    // Smooth scroll for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Update active link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Handle search location
 */
async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const cityName = searchInput.value.trim();
    
    if (!cityName) {
        WeatherAPI.showError('Masukkan nama kota');
        return;
    }
    
    WeatherUI.setLoading(true);
    
    try {
        const location = await WeatherAPI.searchLocation(cityName);
        await loadWeatherData(location.lat, location.lon);
        searchInput.value = '';
    } catch (error) {
        console.error('Search error:', error);
    }
    
    WeatherUI.setLoading(false);
}

/**
 * Handle use current location
 */
function handleUseLocation() {
    if (!navigator.geolocation) {
        WeatherAPI.showError('Geolocation tidak didukung oleh browser Anda');
        return;
    }
    
    WeatherUI.setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await loadWeatherData(lat, lon);
            WeatherUI.setLoading(false);
        },
        (error) => {
            console.error('Geolocation error:', error);
            WeatherAPI.showError('Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan.');
            WeatherUI.setLoading(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
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
