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
            return this.getDemoCurrentWeather(lat, lon);
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
     * Get hourly and daily forecast using One Call API
     * Note: One Call API 3.0 requires subscription, fallback to forecast API
     */
    async getForecast(lat, lon) {
        // Check if in demo mode
        if (CONFIG.apiKey === 'DEMO_MODE') {
            console.log('Running in demo mode - using sample forecast data');
            return this.getDemoForecastData(lat, lon);
        }
        
        try {
            // Using 5 day / 3 hour forecast API (free tier)
            const url = `${CONFIG.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}&units=${CONFIG.units}&lang=${CONFIG.lang}`;
            console.log('Fetching REAL forecast from:', url);
            
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
                console.error('Forecast API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('✅ REAL forecast data received:', data);
            return this.formatForecastData(data);
            
        } catch (error) {
            console.error('❌ Error fetching forecast:', error);
            this.showError(`Gagal memuat data prakiraan: ${error.message}`);
            throw error;
        }
    },

    /**
     * Get location name from coordinates using reverse geocoding
     */
    async getLocationName(lat, lon) {
        try {
            const url = `${CONFIG.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return `${data.name}, ${data.sys.country}`;
        } catch (error) {
            console.error('Error getting location name:', error);
            return 'Lokasi Tidak Diketahui';
        }
    },

    /**
     * Search location by city name
     */
    async searchLocation(cityName) {
        try {
            const url = `${CONFIG.baseUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${CONFIG.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Lokasi tidak ditemukan');
            }
            
            const data = await response.json();
            return {
                lat: data.coord.lat,
                lon: data.coord.lon,
                name: `${data.name}, ${data.sys.country}`
            };
        } catch (error) {
            console.error('Error searching location:', error);
            this.showError('Lokasi tidak ditemukan. Coba nama kota lain.');
            throw error;
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
     * Format forecast data (hourly and daily)
     */
    formatForecastData(data) {
        const hourly = [];
        const daily = new Map();

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            
            // Hourly data (take first 24 hours / 8 items)
            if (hourly.length < 24) {
                hourly.push({
                    dt: item.dt,
                    time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    hour: date.getHours(),
                    temp: Math.round(item.main.temp),
                    feelsLike: Math.round(item.main.feels_like),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                    pop: Math.round(item.pop * 100), // Probability of precipitation
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed
                });
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

            return {
                dt: day.dt,
                date: day.date,
                dayName: day.date.toLocaleDateString('id-ID', { weekday: 'long' }),
                dateStr: day.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                maxTemp: maxTemp,
                minTemp: minTemp,
                description: day.descriptions[0],
                icon: mostCommonIcon,
                iconUrl: `https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png`,
                pop: avgPop,
                humidity: avgHumidity
            };
        });

        return {
            hourly: hourly,
            daily: dailyFormatted.slice(0, 10) // Max 10 days
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
    /**
     * Get demo current weather data
     */
    getDemoCurrentWeather(lat, lon) {
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
     * Get demo forecast data
     */
    getDemoForecastData(lat, lon) {
        const hourly = [];
        const daily = [];
        
        // Generate hourly data for next 24 hours
        for (let i = 0; i < 24; i++) {
            const time = new Date(Date.now() + i * 3600000);
            const isNight = time.getHours() < 6 || time.getHours() > 18;
            
            hourly.push({
                dt: Math.floor(time.getTime() / 1000),
                time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                hour: time.getHours(),
                temp: Math.round(24 + Math.random() * 8),
                feelsLike: Math.round(26 + Math.random() * 8),
                description: 'cerah berawan',
                icon: isNight ? '02n' : '02d',
                iconUrl: `https://openweathermap.org/img/wn/${isNight ? '02n' : '02d'}@2x.png`,
                pop: Math.round(Math.random() * 60),
                humidity: Math.round(65 + Math.random() * 25),
                windSpeed: Math.round((1 + Math.random() * 4) * 10) / 10
            });
        }
        
        // Generate daily data for next 7 days
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(Date.now() + i * 24 * 3600000);
            const maxTemp = Math.round(28 + Math.random() * 6);
            const minTemp = Math.round(22 + Math.random() * 4);
            
            daily.push({
                dt: Math.floor(date.getTime() / 1000),
                date: date,
                dayName: days[date.getDay()],
                dateStr: `${date.getDate()} ${months[date.getMonth()]}`,
                maxTemp: maxTemp,
                minTemp: minTemp,
                description: 'cerah berawan',
                icon: '02d',
                iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
                pop: Math.round(Math.random() * 70),
                humidity: Math.round(70 + Math.random() * 20)
            });
        }
        
        return {
            hourly: hourly,
            daily: daily
        };
    }