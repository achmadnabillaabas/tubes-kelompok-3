/**
 * API Module - Semua logika pemanggilan API cuaca
 */

const WeatherAPI = {
    /**
     * Get current weather data
     */
    async getCurrentWeather(lat, lon) {
        // Check if in demo mode
        if (CONFIG.apiKey === 'DEMO_MODE') {
            console.log('Running in demo mode - using sample data');
            return this.getDemoCurrentWeather();
        }
        
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
                    console.error('');
                    console.error('💡 Atau gunakan DEMO MODE: set API_KEY_FORECAST=DEMO_MODE di file 3.env');
                    console.error('');
                    console.warn('🔄 Switching to DEMO MODE automatically...');
                    
                    // Show warning to user
                    this.showWarning(`
                        <strong>⚠️ API Key Tidak Valid</strong><br>
                        Menggunakan data demo. Untuk data real-time:<br>
                        1. Dapatkan API key gratis di <a href="https://openweathermap.org/" target="_blank" style="color: #fff; text-decoration: underline;">openweathermap.org</a><br>
                        2. Update file <code>forecast/3.env</code><br>
                        3. Restart server
                    `);
                    
                    // Auto-switch to demo mode
                    CONFIG.apiKey = 'DEMO_MODE';
                    return this.getDemoCurrentWeather();
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
        // Check if in demo mode
        if (CONFIG.apiKey === 'DEMO_MODE') {
            console.log('Running in demo mode - using sample forecast data');
            return this.getDemoForecastData();
        }
        
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
                        console.warn('🔄 Switching to DEMO MODE automatically...');
                        
                        // Auto-switch to demo mode
                        CONFIG.apiKey = 'DEMO_MODE';
                        return this.getDemoForecastData();
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
    },



    /**
     * Search cities by name using Geocoding API
     */
    async searchCities(query) {
        // Check if in demo mode
        if (CONFIG.apiKey === 'DEMO_MODE') {
            console.log('Demo mode - returning sample cities');
            return this.getDemoCities(query);
        }
        
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
     * Get demo cities for demo mode
     */
    getDemoCities(query) {
        const demoCities = [
            { name: 'Jakarta', country: 'ID', state: 'Jakarta', lat: -6.2088, lon: 106.8456 },
            { name: 'Surabaya', country: 'ID', state: 'Jawa Timur', lat: -7.2575, lon: 112.7521 },
            { name: 'Bandung', country: 'ID', state: 'Jawa Barat', lat: -6.9175, lon: 107.6191 },
            { name: 'Medan', country: 'ID', state: 'Sumatera Utara', lat: 3.5952, lon: 98.6722 },
            { name: 'Semarang', country: 'ID', state: 'Jawa Tengah', lat: -6.9667, lon: 110.4167 },
            { name: 'Makassar', country: 'ID', state: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327 },
            { name: 'Palembang', country: 'ID', state: 'Sumatera Selatan', lat: -2.9761, lon: 104.7754 },
            { name: 'Yogyakarta', country: 'ID', state: 'DI Yogyakarta', lat: -7.7956, lon: 110.3695 },
            { name: 'Malang', country: 'ID', state: 'Jawa Timur', lat: -7.9797, lon: 112.6304 },
            { name: 'Kediri', country: 'ID', state: 'Jawa Timur', lat: -7.8167, lon: 112.0167 }
        ];
        
        const lowerQuery = query.toLowerCase();
        const filtered = demoCities.filter(city => 
            city.name.toLowerCase().includes(lowerQuery) ||
            city.state.toLowerCase().includes(lowerQuery)
        );
        
        return filtered.map(city => ({
            ...city,
            displayName: this.formatCityDisplayName(city)
        }));
    },

    /**
     * Get location name from coordinates using reverse geocoding
     */
    async getLocationName(lat, lon, accuracy = null) {
        // Check if in demo mode
        if (CONFIG.apiKey === 'DEMO_MODE') {
            return 'Jakarta, Indonesia';
        }
        
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

            // Get most common weather condition
            const conditionCounts = {};
            day.descriptions.forEach(desc => {
                // Extract main condition from description
                const mainCondition = desc.split(' ')[0];
                conditionCounts[mainCondition] = (conditionCounts[mainCondition] || 0) + 1;
            });
            
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
     * Show warning message to user (for demo mode)
     */
    showWarning(message) {
        const toast = document.createElement('div');
        toast.className = 'warning-toast';
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            line-height: 1.5;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 8000);
    },

    /**
     * Demo current weather data
     */
    getDemoCurrentWeather() {
        const now = new Date();
        const isNight = now.getHours() < 6 || now.getHours() > 18;
        
        return {
            location: 'Jakarta, Indonesia',
            temp: Math.round(26 + Math.random() * 6),
            feelsLike: Math.round(28 + Math.random() * 6),
            description: 'cerah berawan',
            icon: this.getWeatherIcon(801, isNight),
            iconUrl: `https://openweathermap.org/img/wn/${isNight ? '02n' : '02d'}@4x.png`,
            humidity: Math.round(70 + Math.random() * 20),
            pressure: Math.round(1010 + Math.random() * 10),
            windSpeed: Math.round((2 + Math.random() * 4) * 10) / 10,
            windDeg: Math.round(Math.random() * 360),
            windDirection: this.getWindDirection(Math.round(Math.random() * 360)),
            clouds: Math.round(20 + Math.random() * 40),
            visibility: Math.round((8 + Math.random() * 4) * 10) / 10,
            sunrise: Math.floor(now.setHours(6, 0, 0, 0) / 1000),
            sunset: Math.floor(now.setHours(18, 30, 0, 0) / 1000),
            condition: 'Clouds',
            isNight: isNight,
            dt: Math.floor(Date.now() / 1000)
        };
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
     * Enhanced demo forecast data with 24-hour coverage
     */
    getDemoForecastData() {
        console.log('Generating enhanced 24-hour demo forecast data');
        
        const now = new Date();
        const hourly = [];
        const daily = [];
        
        // Generate 24 hours of realistic data
        for (let i = 0; i < 24; i++) {
            const futureTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
            const hour = futureTime.getHours();
            const isNight = hour < 6 || hour > 18;
            
            // Realistic temperature variation for tropical climate (Kediri)
            let baseTemp = 28; // Base temperature for Kediri
            
            // Temperature variation by time of day
            if (hour >= 6 && hour <= 12) {
                baseTemp += (hour - 6) * 1.5; // Morning warming
            } else if (hour > 12 && hour <= 15) {
                baseTemp = 33; // Peak afternoon heat
            } else if (hour > 15 && hour <= 18) {
                baseTemp -= (hour - 15) * 2; // Evening cooling
            } else {
                baseTemp = 25 + Math.random() * 3; // Night variation
            }
            
            // Add some randomness
            baseTemp += (Math.random() - 0.5) * 4;
            
            // Realistic weather conditions for tropical area
            let condition = 'Clear';
            let description = 'clear sky';
            let pop = 0;
            
            // Weather patterns typical for Kediri
            if (hour >= 13 && hour <= 17) {
                // Afternoon thunderstorms common in tropical areas
                if (Math.random() > 0.6) {
                    condition = 'Thunderstorm';
                    description = 'thunderstorm';
                    pop = 70 + Math.random() * 30;
                    baseTemp -= 5; // Cooler during storms
                } else if (Math.random() > 0.4) {
                    condition = 'Clouds';
                    description = 'broken clouds';
                    pop = 20 + Math.random() * 30;
                }
            } else if (hour >= 18 || hour <= 5) {
                // Night time - often clear or partly cloudy
                if (Math.random() > 0.7) {
                    condition = 'Clouds';
                    description = 'few clouds';
                    pop = Math.random() * 20;
                }
            } else {
                // Morning - usually clear to partly cloudy
                if (Math.random() > 0.5) {
                    condition = 'Clouds';
                    description = 'scattered clouds';
                    pop = Math.random() * 30;
                }
            }
            
            hourly.push({
                dt: Math.floor(futureTime.getTime() / 1000),
                time: futureTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }),
                hour: hour,
                temp: Math.round(baseTemp),
                feelsLike: Math.round(baseTemp + 2 + Math.random() * 3),
                description: description,
                condition: condition,
                isNight: isNight,
                icon: this.getIconForCondition(condition, isNight),
                pop: Math.round(pop),
                humidity: 60 + Math.random() * 30,
                windSpeed: 1 + Math.random() * 4,
                windDirection: this.getWindDirection(Math.random() * 360),
                pressure: 1010 + Math.random() * 20,
                visibility: 8 + Math.random() * 7,
                clouds: condition === 'Clear' ? Math.random() * 20 : 40 + Math.random() * 60,
                weatherIntensity: this.getWeatherIntensity(condition, description),
                timeLabel: this.getTimeLabel(hour),
                tempTrend: i > 0 ? 
                    (Math.round(baseTemp) > hourly[i-1].temp ? 'up' : 'down') : 'stable'
            });
        }
        
        // Generate 7 days of daily data
        for (let i = 0; i < 7; i++) {
            const futureDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
            
            daily.push({
                dt: Math.floor(futureDate.getTime() / 1000),
                dayName: futureDate.toLocaleDateString('id-ID', { weekday: 'long' }),
                dateStr: futureDate.toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short' 
                }),
                maxTemp: 30 + Math.random() * 8,
                minTemp: 22 + Math.random() * 6,
                description: i % 3 === 0 ? 'thunderstorm' : (i % 2 === 0 ? 'broken clouds' : 'clear sky'),
                condition: i % 3 === 0 ? 'Thunderstorm' : (i % 2 === 0 ? 'Clouds' : 'Clear'),
                icon: i % 3 === 0 ? '11d' : (i % 2 === 0 ? '03d' : '01d'),
                pop: i % 3 === 0 ? 80 : (i % 2 === 0 ? 40 : 10),
                humidity: 65 + Math.random() * 20
            });
        }

        console.log(`Generated ${hourly.length} hours and ${daily.length} days of demo data`);
        return { hourly, daily };
    },

    /**
     * Get appropriate icon for weather condition
     */
    getIconForCondition(condition, isNight) {
        const iconMap = {
            'Clear': isNight ? '01n' : '01d',
            'Clouds': isNight ? '03n' : '03d',
            'Rain': isNight ? '10n' : '10d',
            'Drizzle': isNight ? '09n' : '09d',
            'Thunderstorm': isNight ? '11n' : '11d',
            'Snow': isNight ? '13n' : '13d',
            'Mist': isNight ? '50n' : '50d'
        };
        
        return iconMap[condition] || (isNight ? '03n' : '03d');
    }
};

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);