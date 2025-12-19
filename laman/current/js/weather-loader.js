// weather-loader.js - AJAX Weather Data Loader (No Page Reload)

/**
 * Fetch weather data via AJAX without page reload
 * @param {string} query - City name or lat,lon coordinates
 * @returns {Promise} - Weather data or error
 */
async function fetchWeatherData(query) {
  try {
    showLoadingState();
    
    const apiPath = `api/api-weather.php?${query.includes(',') ? `lat=${query.split(',')[0]}&lon=${query.split(',')[1]}` : `city=${encodeURIComponent(query)}`}`;
    const url = window.getAssetPath ? window.getAssetPath(apiPath) : apiPath;
    
    console.log('Fetching weather from:', url);
    
    const response = await fetch(url);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`Error HTTP! status: ${response.status}`);
    }
    
    // Get response text first to check if it's valid JSON
    const text = await response.text();
    console.log('Teks respons:', text.substring(0, 200)); // Log first 200 chars
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('Gagal parsing JSON:', e);
      console.error('Respons adalah:', text);
      throw new Error('Respons tidak valid dari server. Silakan cek console untuk detail.');
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Gagal memuat data cuaca');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error mengambil data cuaca:', error);
    showErrorNotification(error.message);
    throw error;
  } finally {
    hideLoadingState();
  }
}

/**
 * Update entire page with new weather data (without reload)
 * @param {Object} weatherData - Weather data from API
 */
function updatePageWithWeatherData(weatherData) {
  // Store globally
  window.weatherData = weatherData;
  
  // Update location
  updateLocation(weatherData);
  
  // Update current weather
  updateCurrentWeather(weatherData);
  
  // Update weather details
  updateWeatherDetails(weatherData);
  
  // Update today's details
  updateTodayDetails(weatherData);
  
  // Update daily forecast
  updateDailyForecast(weatherData);
  
  // Update statistics
  updateStatisticsSection(weatherData);
  
  // Update hourly forecast
  updateHourlyForecast(weatherData);
  
  // Update background
  if (typeof updateWeatherBackground === 'function') {
    updateWeatherBackground(weatherData);
  }
  
  // Update analytics
  if (typeof updateHourlyAnalytics === 'function') {
    const hourlyData = getHourlyDataForDay(weatherData, 0);
    updateHourlyAnalytics(hourlyData);
  }
  
  console.log('✅ Halaman diperbarui dengan data cuaca baru');
}

/**
 * Update location display
 */
function updateLocation(data) {
  const locationName = document.querySelector('.location-name');
  if (locationName && data.location) {
    locationName.textContent = `${data.location.name}, ${data.location.country}`;
  }
}

/**
 * Update current weather display
 */
function updateCurrentWeather(data) {
  if (!data.current) return;
  
  const currentTemp = document.querySelector('.current-temp');
  const currentCondition = document.querySelector('.current-condition');
  const updateTime = document.querySelector('.update-time');
  
  if (currentTemp) {
    const tempValue = currentTemp.querySelector('.temp-value') || currentTemp;
    tempValue.textContent = Math.round(data.current.temp_c);
  }
  
  if (currentCondition) {
    currentCondition.textContent = data.current.condition.text;
  }
  
  if (updateTime) {
    const time = new Date(data.current.last_updated).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    updateTime.textContent = `Diperbarui pada ${time}`;
  }
}

/**
 * Update weather details row
 */
function updateWeatherDetails(data) {
  if (!data.current) return;
  
  const details = [
    { selector: '.detail-box:nth-child(1) .detail-value', value: Math.round(data.current.feelslike_c) + '°' },
    { selector: '.detail-box:nth-child(2) .detail-value', value: Math.round(data.current.wind_kph) + ' km/h' },
    { selector: '.detail-box:nth-child(3) .detail-value', value: Math.round(data.current.vis_km) + ' km' },
    { selector: '.detail-box:nth-child(4) .detail-value', value: data.current.pressure_mb.toFixed(2) + ' mb' },
    { selector: '.detail-box:nth-child(5) .detail-value', value: Math.round(data.current.humidity) + '%' },
    { selector: '.detail-box:nth-child(6) .detail-value', value: Math.round(data.current.dewpoint_c) + '°' }
  ];
  
  details.forEach(detail => {
    const element = document.querySelector(detail.selector);
    if (element) element.textContent = detail.value;
  });
}

/**
 * Update today's details section
 */
function updateTodayDetails(data) {
  if (!data.forecast || !data.forecast.forecastday || !data.forecast.forecastday[0]) return;
  
  const today = data.forecast.forecastday[0];
  
  // Update sunrise/sunset
  const sunriseValue = document.querySelector('.sunrise-sunset-item:nth-child(1) .ss-value');
  const sunsetValue = document.querySelector('.sunrise-sunset-item:nth-child(2) .ss-value');
  
  if (sunriseValue && today.astro) sunriseValue.textContent = today.astro.sunrise;
  if (sunsetValue && today.astro) sunsetValue.textContent = today.astro.sunset;
  
  // Update UV index
  const uvValue = document.querySelector('.uv-value');
  const uvLevel = document.querySelector('.uv-level');
  const uvProgressBar = document.querySelector('.uv-progress-bar');
  
  if (uvValue && data.current) {
    const uv = Math.round(data.current.uv);
    uvValue.textContent = uv;
    
    if (uvLevel) {
      uvLevel.textContent = uv >= 11 ? 'Ekstrem' : uv >= 8 ? 'Sangat Tinggi' : uv >= 6 ? 'Tinggi' : uv >= 3 ? 'Sedang' : 'Rendah';
    }
    
    if (uvProgressBar) {
      uvProgressBar.style.width = Math.min(100, (uv / 11) * 100) + '%';
    }
  }
  
  // Update visibility
  const visibilityValue = document.querySelector('.visibility-value');
  if (visibilityValue && data.current) {
    visibilityValue.textContent = Math.round(data.current.vis_km) + ' km';
  }
  
  // Update cloud cover
  const cloudValue = document.querySelector('.cloud-value');
  if (cloudValue && data.current) {
    cloudValue.textContent = data.current.cloud + '%';
  }
}

/**
 * Update daily forecast section
 */
function updateDailyForecast(data) {
  if (!data.forecast || !data.forecast.forecastday) return;
  
  const forecastList = document.querySelector('.forecast-list-horizontal');
  if (!forecastList) return;
  
  forecastList.innerHTML = '';
  
  data.forecast.forecastday.forEach((day, index) => {
    const dayName = new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' });
    const dayDate = new Date(day.date).getDate();
    const isToday = index === 0;
    
    const dayItem = document.createElement('div');
    dayItem.className = `forecast-day-item ${isToday ? 'active' : ''}`;
    dayItem.setAttribute('data-day', index);
    dayItem.setAttribute('data-date', day.date);
    
    dayItem.innerHTML = `
      <div class="day-header">
        <span class="day-name">${dayName}</span>
        <span class="day-date">${dayDate}</span>
      </div>
      <div class="day-icon-wrapper">
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" class="day-icon-img" onerror="this.style.display='none'">
      </div>
      <div class="day-temps">
        <span class="high-temp">${Math.round(day.day.maxtemp_c)}°</span>
        <span class="temp-dash"> - </span>
        <span class="low-temp">${Math.round(day.day.mintemp_c)}°</span>
      </div>
      <div class="day-condition-text">${day.day.condition.text}</div>
      <div class="day-rain-chance">${day.day.daily_chance_of_rain}%</div>
    `;
    
    forecastList.appendChild(dayItem);
  });
  
  // Re-attach event listeners
  attachForecastDayListeners();
}

/**
 * Update statistics section
 */
function updateStatisticsSection(data) {
  if (!data.forecast || !data.forecast.forecastday) return;
  
  const allMaxTemps = data.forecast.forecastday.map(d => d.day.maxtemp_c);
  const allMinTemps = data.forecast.forecastday.map(d => d.day.mintemp_c);
  
  const avgMaxTemp = Math.round(allMaxTemps.reduce((a, b) => a + b, 0) / allMaxTemps.length);
  const avgMinTemp = Math.round(allMinTemps.reduce((a, b) => a + b, 0) / allMinTemps.length);
  const maxTemp = Math.max(...allMaxTemps);
  const minTemp = Math.min(...allMinTemps);
  
  const statCards = document.querySelectorAll('.stat-card .stat-value');
  if (statCards.length >= 4) {
    statCards[0].textContent = avgMaxTemp + '°';
    statCards[1].textContent = avgMinTemp + '°';
    statCards[2].textContent = maxTemp + '°';
    statCards[3].textContent = minTemp + '°';
  }
}

/**
 * Update hourly forecast
 */
function updateHourlyForecast(data) {
  const hourlyData = getHourlyDataForDay(data, 0);
  
  if (hourlyData && hourlyData.length > 0) {
    drawHourlyChart(hourlyData);
    updateHourlyIcons(hourlyData);
  }
}

/**
 * Get hourly data for specific day
 */
function getHourlyDataForDay(data, dayIndex) {
  if (!data.forecast || !data.forecast.forecastday || !data.forecast.forecastday[dayIndex]) {
    return [];
  }
  
  const day = data.forecast.forecastday[dayIndex];
  const hourlyData = [];
  
  if (day.hour) {
    day.hour.forEach(hour => {
      hourlyData.push({
        time: new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        temp: Math.round(hour.temp_c),
        icon: hour.condition.icon,
        condition: hour.condition.text,
        feelslike: Math.round(hour.feelslike_c),
        humidity: hour.humidity,
        wind_kph: Math.round(hour.wind_kph),
        pressure_mb: hour.pressure_mb,
        chance_of_rain: hour.chance_of_rain,
        cloud: hour.cloud || 0
      });
    });
  }
  
  return hourlyData;
}

/**
 * Re-attach event listeners for forecast days
 */
function attachForecastDayListeners() {
  const forecastItems = document.querySelectorAll('.forecast-day-item');
  forecastItems.forEach((item, index) => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      forecastItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      selectedDayIndex = index;
      updateHourlyChart(selectedDayIndex);
      updateStatistics(selectedDayIndex);
    });
  });
}

/**
 * Show loading state
 */
function showLoadingState() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
    loadingScreen.style.display = 'flex';
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 300);
  }
}

/**
 * Show error notification (non-blocking)
 */
function showErrorNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.error-notification');
  if (existing) existing.remove();
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">⚠️</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

/**
 * Handle search form submission
 */
function handleSearchSubmit(event) {
  event.preventDefault();
  
  const searchInput = document.querySelector('.search-input');
  const city = searchInput ? searchInput.value.trim() : '';
  
  if (!city) {
    showErrorNotification('Silakan masukkan nama kota');
    return;
  }
  
  loadWeatherForCity(city);
}

/**
 * Load weather for specific city
 */
async function loadWeatherForCity(city) {
  try {
    const weatherData = await fetchWeatherData(city);
    updatePageWithWeatherData(weatherData);
    
    // Update URL without reload
    const newUrl = `${window.location.pathname}?city=${encodeURIComponent(city)}`;
    window.history.pushState({ city }, '', newUrl);
    
  } catch (error) {
    console.error('Gagal memuat cuaca:', error);
  }
}

/**
 * Load weather for coordinates
 */
async function loadWeatherForCoordinates(lat, lon) {
  try {
    const weatherData = await fetchWeatherData(`${lat},${lon}`);
    updatePageWithWeatherData(weatherData);
    
    // Update URL without reload
    const newUrl = `${window.location.pathname}?lat=${lat}&lon=${lon}`;
    window.history.pushState({ lat, lon }, '', newUrl);
    
  } catch (error) {
    console.error('Gagal memuat cuaca:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Attach search form handler
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearchSubmit);
  }
  
  // Override location button
  const useLocationBtn = document.getElementById('useLocationBtn');
  if (useLocationBtn) {
    useLocationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (navigator.geolocation) {
        this.disabled = true;
        this.innerHTML = '<span>Mencari...</span>';
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loadWeatherForCoordinates(position.coords.latitude, position.coords.longitude);
            this.disabled = false;
            this.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>Lokasi Saya</span>
            `;
          },
          (error) => {
            this.disabled = false;
            this.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>Lokasi Saya</span>
            `;
            showErrorNotification('Tidak dapat mengakses lokasi Anda. Silakan aktifkan izin lokasi.');
          }
        );
      } else {
        showErrorNotification('Browser Anda tidak mendukung geolokasi.');
      }
    });
  }
});
