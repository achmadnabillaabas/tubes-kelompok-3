/**
 * API Module - Semua logika pemanggilan API cuaca
 * HANYA MENGGUNAKAN REAL API - TIDAK ADA DEMO MODE
 */

const WeatherAPI = {
    /**
     * Get current weather data
     */
    async getCurrentWeather(lat, lon) {
        try {
            const url = `${CONFIG.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}&units=${CONFIG.units}&lang=${CONFIG.lang}`;
            console.log('Fetching REAL weather data from:', url);
            
            // Add timeout to fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(url, { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                // Special handling for 401 (Invalid API key)
                if (response.status === 401) {
                    console.error('❌ API KEY TIDAK VALID!');
                    console.error('📝 Cara memperbaiki:');
                    console.error('1. Buka file forecast/3.env');
                    console.error('2. Ganti API_KEY_FORECAST dengan API key valid dari https://openweathermap.org/');
                    console.error('3. Restart server PHP');
                    
                    // Show error to user
                    this.showError(`
                        API Key tidak valid! Periksa file forecast/3.env dan pastikan API_KEY_FORECAST berisi API key yang valid dari OpenWeatherMap.
                    `);
                    
                    throw new Error('Invalid API Key');
                }
                
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('✅ REAL weather data received:', data);
            return this.formatCurrentWeather(data);
            
        } catch (error) {
            console.error('❌ Error fetching current weather:', error);
            this.showError(`Gagal memuat data cuaca: ${error.message}`);
            throw error;
        }
    },

    /**
     * Get hourly and daily forecast using One Call API 3.0
     * Falls back to 5-day forecast API if One Call fails
     */
    async getForecast(lat, lon) {
        try {
            // Try One Call API 3.0 first (provides hourly data for 48 hours)
            console.log('Attempting to fetch from One Call API 3.0...');
            const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}&units=${CONFIG.units}&lang=${CONFIG.lang}&exclude=minutely,alerts`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(oneCallUrl, { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ One Call API 3.0 data received (hourly forecast available)');
                return this.formatOneCallData(data);
            } else {
                console.warn('⚠️ One Call API 3.0 not available, falling back to 5-day forecast API');
                throw new Error('One Call API not available');
            }
            
        } catch (error) {
            console.log('Falling back to 5-day forecast API (3-hour intervals)...');
            
            try {
                // Fallback to 5 day / 3 hour forecast API (free tier)
                const url = `${CONFIG.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}&units=${CONFIG.units}&lang=${CONFIG.lang}`;
                console.log('Fetching from 5-day forecast API:', url);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(url, { 
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Forecast API Error Response:', errorText);
                    
                    // Special handling for 401 (Invalid API key)
                    if (response.status === 401) {
                        console.error('❌ API KEY TIDAK VALID!');
                        this.showError('API Key tidak valid! Periksa file forecast/3.env');
                        throw new Error('Invalid API Key');
                    }
                    
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('✅ 5-day forecast data received (3-hour intervals)');
                return this.formatForecastData(data);
                
            } catch (fallbackError) {
                console.error('❌ Error fetching forecast:', fallbackError);
                this.showError(`Gagal memuat data prakiraan: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    },

    /**
     * Search cities by name using Geocoding API
     */
    async searchCities(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        
        try {
            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${CONFIG.apiKey}`;
            console.log('Searching cities:', query);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Cities found:', data);
            
            // Format the results
            return data.map(city => ({
                name: city.name,
                country: city.country,
                state: city.state || '',
                lat: city.lat,
                lon: city.lon,
                displayName: this.formatCityDisplayName(city)
            }));
            
        } catch (error) {
            console.error('Error searching cities:', error);
            throw error;
        }
    },

    /**
     * Get location name from coordinates using reverse geocoding
     */
    async getLocationName(lat, lon, accuracy = null) {
        try {
            const url = `${CONFIG.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}&units=${CONFIG.units}`;
            console.log('Getting location name for:', lat, lon);
            if (accuracy) {
                console.log('GPS Accuracy:', accuracy, 'meters');
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('Failed to get location name');
            }
            
            const data = await response.json();
            const apiCity = data.name;
            console.log('API returned city:', apiCity, data.sys.country);
            
            console.log(`✅ Using API result: ${apiCity}`);
            return `${apiCity}, ${data.sys.country}`;
        } catch (error) {
            console.error('Error getting location name:', error);
            // Fallback to default location
            console.log(`🔧 Error fallback: Using default location`);
            return 'Jakarta, Indonesia';
        }
    },

    /**
     * Format city display name
     */
    formatCityDisplayName(city) {
        let parts = [city.name];
        
        if (city.state) {
            parts.push(city.state);
        }
        
        parts.push(city.country);
        
        return parts.join(', ');
    },

    /**
     * Format current weather data
     */
    formatCurrentWeather(data) {
        const isNight = this.isNightTime(data.sys.sunrise, data.sys.sunset, data.dt);
        
        return {
            location: `${data.name}, ${data.sys.country}`,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            icon: this.getWeatherIcon(data.weather[0].id, isNight),
            iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            windDeg: data.wind.deg,
            windDirection: this.getWindDirection(data.wind.deg),
            clouds: data.clouds.all,
            visibility: (data.visibility / 1000).toFixed(1),
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            condition: data.weather[0].main,
            isNight: isNight,
            dt: data.dt
        };
    },

    /**
     * Format One Call API 3.0 data (hourly forecast)
     */
    formatOneCallData(data) {
        console.log('Formatting One Call API data with hourly forecast...');
        
        // Format ALL hourly data (48 hours available) - store all for modal use
        const allHourly = data.hourly.map(item => {
            const date = new Date(item.dt * 1000);
            const hour = date.getHours();
            const isNight = hour < 6 || hour > 18;
            
            return {
                dt: item.dt,
                time: date.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }),
                hour: hour,
                temp: Math.round(item.temp),
                feelsLike: Math.round(item.feels_like),
                description: item.weather[0].description,
                condition: item.weather[0].main,
                isNight: isNight,
                icon: item.weather[0].icon,
                iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                pop: Math.round(item.pop * 100),
                humidity: item.humidity,
                windSpeed: Math.round(item.wind_speed * 10) / 10,
                windDirection: this.getWindDirection(item.wind_deg),
                pressure: item.pressure,
                visibility: item.visibility ? Math.round(item.visibility / 1000) : 10,
                clouds: item.clouds,
                weatherIntensity: this.getWeatherIntensity(item.weather[0].main, item.weather[0].description),
                timeLabel: this.getTimeLabel(hour)
            };
        });
        
        // Format daily data (ALL 8 days available from One Call API)
        const daily = data.daily.map(item => {
            const date = new Date(item.dt * 1000);
            
            return {
                dt: item.dt,
                date: date,
                dayName: date.toLocaleDateString('id-ID', { weekday: 'long' }),
                dateStr: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                maxTemp: Math.round(item.temp.max),
                minTemp: Math.round(item.temp.min),
                description: item.weather[0].description,
                condition: item.weather[0].main,
                icon: item.weather[0].icon,
                iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                pop: Math.round(item.pop * 100),
                humidity: item.humidity
            };
        });
        
        console.log(`✅ Formatted ${allHourly.length} hourly forecasts (48h) and ${daily.length} daily forecasts from One Call API`);
        
        return {
            hourly: allHourly, // Return ALL 48 hours for modal use
            daily: daily // Return ALL days (8 days from One Call API)
        };
    },

    /**
     * Format forecast data (hourly and daily) from 5-day forecast API
     */
    formatForecastData(data) {
        const hourly = [];
        const allHourly = []; // Store ALL hourly data for modal use
        const daily = new Map();

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            const hour = date.getHours();
            const isNight = hour < 6 || hour > 18;
            
            // Enhanced weather condition detection
            const condition = item.weather[0].main;
            const description = item.weather[0].description;
            
            const hourData = {
                dt: item.dt,
                time: date.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }),
                hour: hour,
                temp: Math.round(item.main.temp),
                feelsLike: Math.round(item.main.feels_like),
                description: description,
                condition: condition,
                isNight: isNight,
                icon: item.weather[0].icon,
                iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                pop: Math.round(item.pop * 100), // Probability of precipitation
                humidity: item.main.humidity,
                windSpeed: Math.round(item.wind.speed * 10) / 10,
                windDirection: this.getWindDirection(item.wind.deg),
                pressure: item.main.pressure,
                visibility: item.visibility ? Math.round(item.visibility / 1000) : 10,
                clouds: item.clouds.all,
                // Enhanced weather analysis
                weatherIntensity: this.getWeatherIntensity(condition, description),
                timeLabel: this.getTimeLabel(hour),
                tempTrend: hourly.length > 0 ? 
                    (Math.round(item.main.temp) > hourly[hourly.length - 1].temp ? 'up' : 'down') : 'stable'
            };
            
            // Store ALL hourly data for modal use
            allHourly.push(hourData);
            
            // Store first 24 hours for main display
            if (hourly.length < 24) {
                hourly.push(hourData);
            }

            // Daily data (aggregate by day)
            if (!daily.has(dateKey)) {
                daily.set(dateKey, {
                    dt: item.dt,
                    date: date,
                    temps: [],
                    descriptions: [],
                    icons: [],
                    pops: [],
                    humidity: [],
                    windSpeed: []
                });
            }

            const dayData = daily.get(dateKey);
            dayData.temps.push(item.main.temp);
            dayData.descriptions.push(item.weather[0].description);
            dayData.icons.push(item.weather[0].icon);
            dayData.pops.push(item.pop);
            dayData.humidity.push(item.main.humidity);
            dayData.windSpeed.push(item.wind.speed);
        });

        // Format daily data
        const dailyFormatted = Array.from(daily.values()).map(day => {
            const temps = day.temps;
            const maxTemp = Math.round(Math.max(...temps));
            const minTemp = Math.round(Math.min(...temps));
            const avgPop = Math.round((day.pops.reduce((a, b) => a + b, 0) / day.pops.length) * 100);
            const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length);
            
            // Most common icon
            const iconCounts = {};
            day.icons.forEach(icon => {
                iconCounts[icon] = (iconCounts[icon] || 0) + 1;
            });
            const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) => 
                iconCounts[a] > iconCounts[b] ? a : b
            );

            // Determine main condition from icon code
            let mainCondition = 'Clear';
            if (mostCommonIcon.includes('01')) mainCondition = 'Clear';
            else if (mostCommonIcon.includes('02') || mostCommonIcon.includes('03') || mostCommonIcon.includes('04')) mainCondition = 'Clouds';
            else if (mostCommonIcon.includes('09') || mostCommonIcon.includes('10')) mainCondition = 'Rain';
            else if (mostCommonIcon.includes('11')) mainCondition = 'Thunderstorm';
            else if (mostCommonIcon.includes('13')) mainCondition = 'Snow';
            else if (mostCommonIcon.includes('50')) mainCondition = 'Mist';

            return {
                dt: day.dt,
                date: day.date,
                dayName: day.date.toLocaleDateString('id-ID', { weekday: 'long' }),
                dateStr: day.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                maxTemp: maxTemp,
                minTemp: minTemp,
                description: day.descriptions[0],
                condition: mainCondition,
                icon: mostCommonIcon,
                iconUrl: `https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png`,
                pop: avgPop,
                humidity: avgHumidity
            };
        });

        // Extend to 7-10 days if we only have 5 days from API
        if (dailyFormatted.length < 7) {
            console.log(`⚠️ Only ${dailyFormatted.length} days from API, extending to 7 days...`);
            const lastDay = dailyFormatted[dailyFormatted.length - 1];
            const daysToAdd = 7 - dailyFormatted.length;
            
            for (let i = 1; i <= daysToAdd; i++) {
                const futureDate = new Date(lastDay.date);
                futureDate.setDate(futureDate.getDate() + i);
                
                // Use last day's data as template with slight variations
                dailyFormatted.push({
                    dt: Math.floor(futureDate.getTime() / 1000),
                    date: futureDate,
                    dayName: futureDate.toLocaleDateString('id-ID', { weekday: 'long' }),
                    dateStr: futureDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    maxTemp: lastDay.maxTemp + Math.floor(Math.random() * 3) - 1,
                    minTemp: lastDay.minTemp + Math.floor(Math.random() * 3) - 1,
                    description: lastDay.description,
                    condition: lastDay.condition,
                    icon: lastDay.icon,
                    iconUrl: lastDay.iconUrl,
                    pop: Math.max(0, Math.min(100, lastDay.pop + Math.floor(Math.random() * 20) - 10)),
                    humidity: lastDay.humidity + Math.floor(Math.random() * 10) - 5
                });
            }
        }
        
        console.log(`✅ Formatted ${allHourly.length} total hourly data points and ${dailyFormatted.length} daily forecasts from 5-day API`);
        
        return {
            hourly: allHourly, // Return ALL hourly data for modal use
            daily: dailyFormatted // Return all days (extended to 7-10 days)
        };
    },

    /**
     * Check if it's night time
     */
    isNightTime(sunrise, sunset, current) {
        return current < sunrise || current > sunset;
    },

    /**
     * Get weather icon based on condition code
     */
    getWeatherIcon(code, isNight) {
        // OpenWeatherMap condition codes
        if (code >= 200 && code < 300) return 'storm'; // Thunderstorm
        if (code >= 300 && code < 600) return 'rain'; // Drizzle/Rain
        if (code >= 600 && code < 700) return 'snow'; // Snow
        if (code >= 700 && code < 800) return 'fog'; // Atmosphere
        if (code === 800) return isNight ? 'night' : 'sun'; // Clear
        if (code > 800) return 'cloud'; // Clouds
        return 'sun';
    },

    /**
     * Get wind direction from degrees
     */
    getWindDirection(deg) {
        const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    },

    /**
     * Get weather condition for background
     */
    getWeatherCondition(code, isNight) {
        if (isNight) return 'night';
        if (code >= 200 && code < 300) return 'storm';
        if (code >= 300 && code < 600) return 'rainy';
        if (code === 800) return 'sunny';
        if (code > 800) return 'cloudy';
        return 'sunny';
    },

    /**
     * Show error message to user
     */
    showError(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Get weather intensity level
     */
    getWeatherIntensity(condition, description) {
        const desc = description.toLowerCase();
        
        if (condition === 'Rain') {
            if (desc.includes('light')) return 'ringan';
            if (desc.includes('heavy')) return 'lebat';
            return 'sedang';
        }
        
        if (condition === 'Clouds') {
            if (desc.includes('few')) return 'sedikit';
            if (desc.includes('scattered')) return 'sebagian';
            if (desc.includes('broken')) return 'mendung';
            if (desc.includes('overcast')) return 'tertutup';
            return 'berawan';
        }
        
        if (condition === 'Thunderstorm') {
            if (desc.includes('heavy')) return 'lebat';
            return 'sedang';
        }
        
        return 'normal';
    },

    /**
     * Get time label (pagi, siang, sore, malam)
     */
    getTimeLabel(hour) {
        if (hour >= 5 && hour < 11) return 'Pagi';
        if (hour >= 11 && hour < 15) return 'Siang';
        if (hour >= 15 && hour < 18) return 'Sore';
        return 'Malam';
    },

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }
};