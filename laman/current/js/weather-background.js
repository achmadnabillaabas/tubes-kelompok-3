// weather-background.js - Dynamic Background Based on Weather Conditions

/**
 * Determine background image based on weather condition
 * @param {Object} weatherData - Current weather data from API
 * @returns {string} - Background image filename
 */
function getWeatherBackground(weatherData) {
  // Helper function to get asset path
  const getAssetPath = (filename) => {
    return window.getAssetPath ? window.getAssetPath('assets/' + filename) : 'assets/' + filename;
  };

  if (!weatherData || !weatherData.current) {
    return getAssetPath('bg.jpg'); // Default background
  }

  const condition = weatherData.current.condition.text.toLowerCase();
  const cloudCover = weatherData.current.cloud || 0;
  const isDay = weatherData.current.is_day === 1;
  
  // Clear/Sunny conditions - use bg2.jpg
  const clearConditions = [
    'sunny', 'clear', 'partly cloudy'
  ];
  
  // Cloudy/Overcast conditions - use bg.jpg
  const cloudyConditions = [
    'cloudy', 'overcast', 'mist', 'fog', 
    'freezing fog', 'patchy rain', 'light rain',
    'moderate rain', 'heavy rain', 'rain',
    'drizzle', 'thunder', 'snow', 'sleet',
    'blizzard', 'hail'
  ];
  
  // Check if condition matches clear weather
  const isClear = clearConditions.some(clear => condition.includes(clear));
  
  // Check if condition matches cloudy/rainy weather
  const isCloudy = cloudyConditions.some(cloudy => condition.includes(cloudy));
  
  // Decision logic
  if (isClear && cloudCover < 40) {
    return getAssetPath('bg2.jpg'); // Clear/Sunny background
  } else if (isCloudy || cloudCover >= 40) {
    return getAssetPath('bg.jpg'); // Cloudy/Overcast background
  } else {
    // Default based on cloud cover
    return cloudCover < 40 ? getAssetPath('bg2.jpg') : getAssetPath('bg.jpg');
  }
}

/**
 * Apply background to weather app
 * @param {string} backgroundImage - Background image filename
 */
function applyWeatherBackground(backgroundImage) {
  const weatherApp = document.querySelector('.weather-app');
  const errorContainer = document.querySelector('.error-container');
  
  // backgroundImage should already be a full path from getWeatherBackground
  const backgroundUrl = backgroundImage.startsWith('url(') ? backgroundImage : `url("${backgroundImage}")`;
  
  if (weatherApp) {
    weatherApp.style.backgroundImage = backgroundUrl;
    
    // Add smooth transition
    weatherApp.style.transition = 'background-image 1s ease-in-out';
    
    console.log(`✅ Background changed to: ${backgroundImage}`);
  }
  
  if (errorContainer) {
    errorContainer.style.backgroundImage = backgroundUrl;
    errorContainer.style.transition = 'background-image 1s ease-in-out';
  }
}

/**
 * Update background based on current weather
 * @param {Object} weatherData - Weather data from API
 */
function updateWeatherBackground(weatherData) {
  if (!weatherData) {
    console.warn('⚠️ No weather data available for background update');
    return;
  }
  
  const backgroundImage = getWeatherBackground(weatherData);
  applyWeatherBackground(backgroundImage);
  
  // Log weather condition for debugging
  if (weatherData.current) {
    console.log('🌤️ Weather Condition:', weatherData.current.condition.text);
    console.log('☁️ Cloud Cover:', weatherData.current.cloud + '%');
    console.log('🖼️ Selected Background:', backgroundImage);
  }
}

/**
 * Get weather condition category for display
 * @param {Object} weatherData - Weather data from API
 * @returns {Object} - Category info
 */
function getWeatherCategory(weatherData) {
  // Helper function to get asset path
  const getAssetPath = (filename) => {
    return window.getAssetPath ? window.getAssetPath('assets/' + filename) : 'assets/' + filename;
  };

  if (!weatherData || !weatherData.current) {
    return { category: 'unknown', icon: '❓', description: 'Unknown' };
  }
  
  const condition = weatherData.current.condition.text.toLowerCase();
  const cloudCover = weatherData.current.cloud || 0;
  
  // Categorize weather
  if (condition.includes('sunny') || condition.includes('clear')) {
    return { 
      category: 'clear', 
      icon: '☀️', 
      description: 'Clear Sky',
      background: getAssetPath('bg2.jpg')
    };
  } else if (condition.includes('partly cloudy')) {
    return { 
      category: 'partly-cloudy', 
      icon: '⛅', 
      description: 'Partly Cloudy',
      background: cloudCover < 40 ? getAssetPath('bg2.jpg') : getAssetPath('bg.jpg')
    };
  } else if (condition.includes('cloudy') || condition.includes('overcast')) {
    return { 
      category: 'cloudy', 
      icon: '☁️', 
      description: 'Cloudy',
      background: getAssetPath('bg.jpg')
    };
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    return { 
      category: 'rainy', 
      icon: '🌧️', 
      description: 'Rainy',
      background: getAssetPath('bg.jpg')
    };
  } else if (condition.includes('thunder') || condition.includes('storm')) {
    return { 
      category: 'stormy', 
      icon: '⛈️', 
      description: 'Stormy',
      background: getAssetPath('bg.jpg')
    };
  } else if (condition.includes('snow') || condition.includes('blizzard')) {
    return { 
      category: 'snowy', 
      icon: '❄️', 
      description: 'Snowy',
      background: getAssetPath('bg.jpg')
    };
  } else if (condition.includes('mist') || condition.includes('fog')) {
    return { 
      category: 'foggy', 
      icon: '🌫️', 
      description: 'Foggy',
      background: getAssetPath('bg.jpg')
    };
  } else {
    return { 
      category: 'other', 
      icon: '🌤️', 
      description: condition,
      background: cloudCover < 40 ? getAssetPath('bg2.jpg') : getAssetPath('bg.jpg')
    };
  }
}

/**
 * Display weather category badge (optional feature)
 * @param {Object} weatherData - Weather data from API
 */
function displayWeatherBadge(weatherData) {
  const category = getWeatherCategory(weatherData);
  
  // Check if badge container exists
  let badgeContainer = document.querySelector('.weather-badge');
  
  if (!badgeContainer) {
    // Create badge container
    badgeContainer = document.createElement('div');
    badgeContainer.className = 'weather-badge';
    
    const locationHeader = document.querySelector('.location-header');
    if (locationHeader) {
      locationHeader.appendChild(badgeContainer);
    }
  }
  
  if (badgeContainer) {
    badgeContainer.innerHTML = `
      <span class="badge-icon">${category.icon}</span>
      <span class="badge-text">${category.description}</span>
    `;
    badgeContainer.title = `Background: ${category.background}`;
  }
}

// Initialize background on page load
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for weather data to load
  setTimeout(function() {
    if (window.weatherData) {
      updateWeatherBackground(window.weatherData);
      
      // Optional: Display weather badge
      // displayWeatherBadge(window.weatherData);
    }
  }, 500);
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getWeatherBackground,
    updateWeatherBackground,
    getWeatherCategory
  };
}
