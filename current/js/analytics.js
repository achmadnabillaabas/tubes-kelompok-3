// analytics.js - Hourly Analytics Dynamic Functions

/**
 * Main function to update all hourly analytics
 * @param {Array} hourlyData - Array of hourly weather data
 */
function updateHourlyAnalytics(hourlyData) {
  if (!hourlyData || hourlyData.length === 0) {
    console.warn('No hourly data available for analytics');
    return;
  }

  console.log('Updating hourly analytics with', hourlyData.length, 'hours of data');

  // Extract data arrays
  const temps = hourlyData.map(h => h.temp);
  const humidities = hourlyData.map(h => h.humidity);
  const rains = hourlyData.map(h => h.chance_of_rain || 0);
  const winds = hourlyData.map(h => h.wind_kph || 0);
  const times = hourlyData.map(h => h.time);

  // Update each analytics card
  updateAnalyticsCard('tempAnalytics', 'tempChart', temps, times, '°C', '#ff6b6b', 'Temperature');
  updateAnalyticsCard('humidityAnalytics', 'humidityChart', humidities, times, '%', '#4a9eff', 'Humidity');
  updateAnalyticsCard('rainAnalytics', 'rainChart', rains, times, '%', '#74b9ff', 'Rain Chance');
  
  // For cloud data, we need to extract it differently
  const clouds = hourlyData.map(h => {
    // Some APIs might not have cloud data in hourly
    return h.cloud || 0;
  });
  updateAnalyticsCard('cloudAnalytics', 'cloudChart', clouds, times, '%', '#b0c4de', 'Cloud Cover');

  // Generate and display weather insights
  const insights = generateWeatherInsights(hourlyData);
  displayWeatherInsights(insights);
}

/**
 * Update individual analytics card with stats and chart
 */
function updateAnalyticsCard(statsId, chartId, values, times, unit, color, label) {
  // Calculate comprehensive statistics
  const stats = calculateStatistics(values, times);
  
  // Update stats HTML
  const statsContainer = document.getElementById(statsId);
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-item" title="Highest ${label.toLowerCase()} at ${stats.maxTime}">
        <span class="stat-label">Max</span>
        <span class="stat-value">${stats.max}${unit}</span>
        <span class="stat-time">${stats.maxTime}</span>
      </div>
      <div class="stat-item" title="Lowest ${label.toLowerCase()} at ${stats.minTime}">
        <span class="stat-label">Min</span>
        <span class="stat-value">${stats.min}${unit}</span>
        <span class="stat-time">${stats.minTime}</span>
      </div>
      <div class="stat-item" title="Average ${label.toLowerCase()} - ${stats.trendText}">
        <span class="stat-label">Avg</span>
        <span class="stat-value">${stats.avg}${unit}</span>
        <span class="stat-time">${stats.trendIcon} ${stats.trendText}</span>
      </div>
      <div class="stat-item" title="Variability: ${stats.variability}">
        <span class="stat-label">Range</span>
        <span class="stat-value">${stats.range}${unit}</span>
        <span class="stat-time">${stats.variability}</span>
      </div>
    `;
  }

  // Draw chart
  drawAnalyticsChart(chartId, values, times, color, stats);
}

/**
 * Calculate comprehensive statistics from data
 */
function calculateStatistics(values, times) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const range = max - min;

  // Find times for max and min
  const maxIndex = values.indexOf(max);
  const minIndex = values.indexOf(min);
  const maxTime = times[maxIndex];
  const minTime = times[minIndex];

  // Calculate trend
  const firstQuarter = values.slice(0, Math.floor(values.length / 4));
  const lastQuarter = values.slice(-Math.floor(values.length / 4));
  const firstAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
  const trendDiff = lastAvg - firstAvg;
  
  let trendIcon, trendText;
  if (trendDiff > range * 0.1) {
    trendIcon = '↑';
    trendText = 'Rising';
  } else if (trendDiff < -range * 0.1) {
    trendIcon = '↓';
    trendText = 'Falling';
  } else {
    trendIcon = '→';
    trendText = 'Stable';
  }

  // Calculate variability (standard deviation)
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const variability = stdDev > range * 0.3 ? 'High' : 
                      stdDev > range * 0.15 ? 'Moderate' : 
                      'Low';

  return {
    max: Math.round(max),
    min: Math.round(min),
    avg: Math.round(avg),
    range: Math.round(range),
    maxTime,
    minTime,
    trendIcon,
    trendText,
    variability,
    stdDev: Math.round(stdDev * 10) / 10
  };
}

/**
 * Draw analytics chart with gradient area and line
 */
function drawAnalyticsChart(chartId, values, times, color, stats) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  // Set canvas size
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.offsetWidth || 300;
    canvas.height = 80;
  }

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 15;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (values.length === 0) return;

  // Calculate positions
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = chartWidth / (values.length - 1 || 1);

  // Create gradient for area fill
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, color + '60');
  gradient.addColorStop(1, color + '10');

  // Draw area
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  
  values.forEach((value, index) => {
    const x = padding + index * stepX;
    const normalizedValue = (value - min) / range;
    const y = height - padding - (normalizedValue * chartHeight);
    ctx.lineTo(x, y);
  });
  
  ctx.lineTo(padding + (values.length - 1) * stepX, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw line
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = padding + index * stepX;
    const normalizedValue = (value - min) / range;
    const y = height - padding - (normalizedValue * chartHeight);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw points
  values.forEach((value, index) => {
    const x = padding + index * stepX;
    const normalizedValue = (value - min) / range;
    const y = height - padding - (normalizedValue * chartHeight);

    // Regular points
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Highlight max point
  const maxIndex = values.indexOf(max);
  const maxX = padding + maxIndex * stepX;
  const maxY = height - padding - ((max - min) / range) * chartHeight;
  
  ctx.beginPath();
  ctx.arc(maxX, maxY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b6b';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Highlight min point
  const minIndex = values.indexOf(min);
  const minX = padding + minIndex * stepX;
  const minY = height - padding - ((min - min) / range) * chartHeight;
  
  ctx.beginPath();
  ctx.arc(minX, minY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#4a9eff';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Generate weather insights based on analytics
 */
function generateWeatherInsights(hourlyData) {
  const insights = [];
  
  const temps = hourlyData.map(h => h.temp);
  const humidities = hourlyData.map(h => h.humidity);
  const rains = hourlyData.map(h => h.chance_of_rain || 0);
  const winds = hourlyData.map(h => h.wind_kph || 0);
  
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const tempRange = maxTemp - minTemp;
  
  const maxRain = Math.max(...rains);
  const avgRain = rains.reduce((a, b) => a + b, 0) / rains.length;
  const rainyHours = rains.filter(r => r > 50).length;
  
  const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
  const maxWind = Math.max(...winds);
  
  // Temperature insights
  if (tempRange > 10) {
    insights.push({
      type: 'warning',
      icon: '🌡️',
      message: `Large temperature variation (${Math.round(tempRange)}°C). Dress in layers.`
    });
  }
  
  if (maxTemp > 35) {
    insights.push({
      type: 'alert',
      icon: '🔥',
      message: `Very hot weather (${Math.round(maxTemp)}°C). Stay hydrated and avoid direct sunlight.`
    });
  } else if (maxTemp > 30) {
    insights.push({
      type: 'warning',
      icon: '☀️',
      message: `Hot weather (${Math.round(maxTemp)}°C). Use sunscreen and drink plenty of water.`
    });
  }
  
  if (minTemp < 20) {
    insights.push({
      type: 'info',
      icon: '🧥',
      message: `Cool temperatures at night (${Math.round(minTemp)}°C). Bring a jacket or sweater.`
    });
  }
  
  // Rain insights
  if (maxRain > 70) {
    insights.push({
      type: 'warning',
      icon: '☔',
      message: `High chance of rain (${Math.round(maxRain)}%). Don't forget your umbrella!`
    });
  }
  
  if (rainyHours > 6) {
    insights.push({
      type: 'alert',
      icon: '🌧️',
      message: `Extended rain period (${rainyHours} hours). Plan indoor activities.`
    });
  } else if (avgRain > 30) {
    insights.push({
      type: 'info',
      icon: '🌦️',
      message: `Possible rain throughout the day. Prepare rain gear.`
    });
  }
  
  // Humidity insights
  if (avgHumidity > 80) {
    insights.push({
      type: 'info',
      icon: '💧',
      message: `High humidity (${Math.round(avgHumidity)}%). It may feel warmer than actual temperature.`
    });
  }
  
  // Wind insights
  if (maxWind > 40) {
    insights.push({
      type: 'warning',
      icon: '💨',
      message: `Strong winds (${Math.round(maxWind)} km/h). Secure loose objects.`
    });
  } else if (maxWind > 25) {
    insights.push({
      type: 'info',
      icon: '🍃',
      message: `Moderate winds (${Math.round(maxWind)} km/h). Be careful when driving.`
    });
  }
  
  // Perfect weather
  if (avgTemp >= 22 && avgTemp <= 28 && avgHumidity < 70 && maxRain < 20 && maxWind < 20) {
    insights.push({
      type: 'success',
      icon: '✨',
      message: 'Perfect weather for outdoor activities! Enjoy your day.'
    });
  }
  
  // Comfort index
  const comfortIndex = calculateComfortIndex(avgTemp, avgHumidity);
  if (comfortIndex < 40) {
    insights.push({
      type: 'info',
      icon: '😊',
      message: 'Comfort Level: Very Comfortable'
    });
  } else if (comfortIndex < 60) {
    insights.push({
      type: 'info',
      icon: '🙂',
      message: 'Comfort Level: Comfortable'
    });
  } else if (comfortIndex < 80) {
    insights.push({
      type: 'warning',
      icon: '😓',
      message: 'Comfort Level: Slightly Uncomfortable'
    });
  } else {
    insights.push({
      type: 'alert',
      icon: '🥵',
      message: 'Comfort Level: Uncomfortable - Limit outdoor activities'
    });
  }
  
  return insights;
}

/**
 * Calculate comfort index based on temperature and humidity
 */
function calculateComfortIndex(temp, humidity) {
  // Simplified heat index calculation
  return temp + (0.5 * humidity);
}

/**
 * Display weather insights in the UI
 */
function displayWeatherInsights(insights) {
  let insightsContainer = document.querySelector('.weather-insights');
  
  if (!insightsContainer) {
    const analyticsSection = document.querySelector('.hourly-analytics');
    if (analyticsSection) {
      insightsContainer = document.createElement('div');
      insightsContainer.className = 'weather-insights';
      analyticsSection.appendChild(insightsContainer);
    }
  }
  
  if (!insightsContainer || insights.length === 0) return;
  
  insightsContainer.innerHTML = `
    <h4 class="insights-title">💡 Weather Insights & Recommendations</h4>
    <div class="insights-grid">
      ${insights.map((insight, index) => `
        <div class="insight-card insight-${insight.type}" style="animation-delay: ${0.1 * (index + 1)}s">
          <span class="insight-icon">${insight.icon}</span>
          <span class="insight-message">${insight.message}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateHourlyAnalytics,
    generateWeatherInsights,
    calculateStatistics
  };
}
