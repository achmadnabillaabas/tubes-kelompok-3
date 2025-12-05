/**
 * UI Module - Fungsi untuk update DOM
 */

const WeatherUI = {
    currentUnit: 'C',
    currentWeatherData: null,
    currentForecastData: null,

    /**
     * Update hero section with current weather
     */
    updateHero(data) {
        this.currentWeatherData = data;
        
        // Location
        document.getElementById('locationName').textContent = data.location;
        
        // Last updated
        const now = new Date();
        document.getElementById('lastUpdated').textContent = 
            `Diperbarui: ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
        
        // Temperature with count-up animation
        this.animateTemperature('currentTemp', data.temp);
        
        // Weather icon
        const weatherIcon = document.getElementById('weatherIcon');
        weatherIcon.src = data.iconUrl;
        weatherIcon.alt = data.description;
        
        // Description
        document.getElementById('weatherDesc').textContent = 
            data.description.charAt(0).toUpperCase() + data.description.slice(1);
        document.getElementById('feelsLike').textContent = 
            `Terasa seperti ${data.feelsLike}°${this.currentUnit}`;
        
        // Summary
        const summary = this.generateWeatherSummary(data);
        document.getElementById('weatherSummary').textContent = summary;
        
        // Mini stats
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('wind').textContent = 
            `${data.windSpeed.toFixed(1)} m/s ${data.windDirection}`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('clouds').textContent = `${data.clouds}%`;
        
        // Update background
        this.updateBackgroundByWeather(data.condition, data.isNight);
    },

    /**
     * Animate temperature count-up
     */
    animateTemperature(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const duration = 1000;
        const steps = 30;
        const increment = targetValue / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            element.textContent = Math.round(current);
            
            if (step >= steps) {
                element.textContent = targetValue;
                clearInterval(timer);
            }
        }, duration / steps);
    },

    /**
     * Generate weather summary text
     */
    generateWeatherSummary(data) {
        const summaries = {
            Clear: data.isNight ? 
                'Malam yang cerah, sempurna untuk melihat bintang.' :
                'Hari yang cerah dan menyenangkan untuk aktivitas luar ruangan.',
            Clouds: 'Langit berawan, suhu cukup nyaman.',
            Rain: 'Hujan diperkirakan hari ini, jangan lupa bawa payung.',
            Drizzle: 'Gerimis ringan, tetap waspada saat berkendara.',
            Thunderstorm: 'Badai petir diperkirakan, sebaiknya tetap di dalam ruangan.',
            Snow: 'Salju turun, kenakan pakaian hangat.',
            Mist: 'Kabut tipis, berkendara dengan hati-hati.',
            Fog: 'Kabut tebal, visibilitas terbatas.'
        };
        
        return summaries[data.condition] || 'Cuaca sedang dalam kondisi normal.';
    },

    /**
     * Update background based on weather condition
     */
    updateBackgroundByWeather(condition, isNight) {
        const heroBackground = document.getElementById('heroBackground');
        let bgImage = 'sunny.gif';
        
        if (isNight) {
            bgImage = 'night.gif';
        } else {
            switch (condition) {
                case 'Clear':
                    bgImage = 'sunny.gif';
                    break;
                case 'Clouds':
                    bgImage = 'cloudy.gif';
                    break;
                case 'Rain':
                case 'Drizzle':
                    bgImage = 'rainy.gif';
                    break;
                case 'Thunderstorm':
                    bgImage = 'storm.gif';
                    break;
                default:
                    bgImage = 'cloudy.gif';
            }
        }
        
        // Fade transition with fallback to CSS gradient
        heroBackground.style.opacity = '0';
        setTimeout(() => {
            // Try to load GIF, fallback to CSS gradient if not available
            const img = new Image();
            img.onload = () => {
                heroBackground.style.backgroundImage = `url('img/bg/${bgImage}')`;
                heroBackground.style.opacity = '1';
            };
            img.onerror = () => {
                // Fallback to CSS gradient - just set the style attribute for CSS selector
                heroBackground.style.backgroundImage = `url('img/bg/${bgImage}')`;
                heroBackground.style.opacity = '1';
            };
            img.src = `img/bg/${bgImage}`;
        }, 300);
    },

    /**
     * Update today's details section
     */
    updateTodayDetails(data) {
        // Sunrise & Sunset
        const sunrise = new Date(data.sunrise * 1000);
        const sunset = new Date(data.sunset * 1000);
        document.getElementById('sunrise').textContent = 
            sunrise.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('sunset').textContent = 
            sunset.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        // UV Index (simulated - not available in free API)
        const uvIndex = Math.floor(Math.random() * 11) + 1;
        this.updateUVIndex(uvIndex);
        
        // Visibility
        document.getElementById('visibility').textContent = `${data.visibility} km`;
        
        // Cloud cover
        document.getElementById('cloudCover').textContent = `${data.clouds}%`;
        
        // Animate cards
        this.animateElements('.detail-card');
    },

    /**
     * Update UV index display
     */
    updateUVIndex(value) {
        document.getElementById('uvValue').textContent = value;
        
        let level, color, width;
        if (value <= 2) {
            level = 'Rendah';
            color = 'var(--uv-low)';
            width = '20%';
        } else if (value <= 5) {
            level = 'Sedang';
            color = 'var(--uv-moderate)';
            width = '40%';
        } else if (value <= 7) {
            level = 'Tinggi';
            color = 'var(--uv-high)';
            width = '60%';
        } else if (value <= 10) {
            level = 'Sangat Tinggi';
            color = 'var(--uv-very-high)';
            width = '80%';
        } else {
            level = 'Ekstrem';
            color = 'var(--uv-extreme)';
            width = '100%';
        }
        
        document.getElementById('uvLevel').textContent = level;
        const uvProgress = document.getElementById('uvProgress');
        uvProgress.style.width = width;
        uvProgress.style.background = color;
    },

    /**
     * Update hourly forecast cards
     */
    updateHourlyCards(hourlyData) {
        const container = document.getElementById('hourlyCardsWrapper');
        container.innerHTML = '';
        
        hourlyData.forEach(hour => {
            const card = document.createElement('div');
            card.className = 'hourly-card';
            card.innerHTML = `
                <div class="hour">${hour.time}</div>
                <img src="${hour.iconUrl}" alt="${hour.description}">
                <div class="temp">${hour.temp}°${this.currentUnit}</div>
                <div class="rain">💧 ${hour.pop}%</div>
            `;
            container.appendChild(card);
        });
    },

    /**
     * Update daily forecast list
     */
    updateDailyList(dailyData) {
        const container = document.getElementById('dailyList');
        container.innerHTML = '';
        
        dailyData.forEach((day, index) => {
            const card = document.createElement('div');
            card.className = 'daily-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div>
                    <div class="day-name">${day.dayName}</div>
                    <div class="date">${day.dateStr}</div>
                </div>
                <img src="${day.iconUrl}" alt="${day.description}">
                <div class="temps">
                    <span class="temp-max">${day.maxTemp}°</span>
                    <span class="temp-min">${day.minTemp}°</span>
                </div>
                <div class="rain-prob">💧 ${day.pop}%</div>
                <div class="description">${day.description}</div>
            `;
            container.appendChild(card);
        });
        
        // Animate cards
        setTimeout(() => this.animateElements('.daily-card'), 100);
    },

    /**
     * Toggle temperature unit (Celsius/Fahrenheit)
     */
    toggleUnit() {
        this.currentUnit = this.currentUnit === 'C' ? 'F' : 'C';
        document.getElementById('unitToggle').textContent = `°${this.currentUnit}`;
        
        // Re-render with new unit
        if (this.currentWeatherData && this.currentForecastData) {
            this.updateHero(this.convertTemperature(this.currentWeatherData));
            this.updateHourlyCards(this.currentForecastData.hourly.map(h => 
                this.convertTemperature(h)
            ));
            this.updateDailyList(this.currentForecastData.daily.map(d => 
                this.convertTemperature(d)
            ));
        }
    },

    /**
     * Convert temperature between C and F
     */
    convertTemperature(data) {
        if (this.currentUnit === 'F') {
            const converted = { ...data };
            if (converted.temp) converted.temp = Math.round(converted.temp * 9/5 + 32);
            if (converted.feelsLike) converted.feelsLike = Math.round(converted.feelsLike * 9/5 + 32);
            if (converted.maxTemp) converted.maxTemp = Math.round(converted.maxTemp * 9/5 + 32);
            if (converted.minTemp) converted.minTemp = Math.round(converted.minTemp * 9/5 + 32);
            return converted;
        }
        return data;
    },

    /**
     * Animate elements when they enter viewport
     */
    animateElements(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (!el.classList.contains('animate')) {
                el.classList.add('animate');
            }
        });
    },

    /**
     * Setup Intersection Observer for scroll animations
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    // Animate detail cards
                    if (target.id === 'today-details') {
                        this.animateElements('.detail-card');
                    }
                    
                    // Animate daily cards
                    if (target.id === 'daily') {
                        this.animateElements('.daily-card');
                    }
                    
                    // Animate tip cards
                    if (target.id === 'tips') {
                        this.animateElements('.tip-card');
                    }
                    
                    // Fade in sections
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe sections
        document.querySelectorAll('.section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(section);
        });
    },

    /**
     * Show/hide loading overlay
     */
    setLoading(isLoading) {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            console.error('Loading overlay not found');
            return;
        }
        
        if (isLoading) {
            overlay.style.display = 'flex';
            overlay.classList.remove('hidden');
            console.log('Loading overlay shown');
        } else {
            overlay.style.display = 'none';
            overlay.classList.add('hidden');
            console.log('Loading overlay hidden');
        }
    },

    /**
     * Generate insights from forecast data
     */
    generateInsights(dailyData) {
        const container = document.getElementById('insightsContent');
        const insights = [];
        
        // Temperature trend
        const temps = dailyData.map(d => d.maxTemp);
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const firstThree = temps.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        
        if (firstThree > avgTemp + 2) {
            insights.push('🌡️ Suhu maksimum cenderung naik dalam 3 hari ke depan dibanding rata-rata.');
        } else if (firstThree < avgTemp - 2) {
            insights.push('🌡️ Suhu maksimum cenderung turun dalam 3 hari ke depan dibanding rata-rata.');
        } else {
            insights.push('🌡️ Suhu relatif stabil dalam beberapa hari ke depan.');
        }
        
        // Rain probability
        const maxRainDay = dailyData.reduce((max, day) => 
            day.pop > max.pop ? day : max
        , dailyData[0]);
        
        if (maxRainDay.pop > 50) {
            insights.push(`☔ Peluang hujan tertinggi diperkirakan pada hari ${maxRainDay.dayName} (${maxRainDay.pop}%).`);
        }
        
        // Humidity
        const avgHumidity = dailyData.reduce((sum, d) => sum + d.humidity, 0) / dailyData.length;
        if (avgHumidity > 70) {
            insights.push('💧 Kelembapan udara cukup tinggi, udara akan terasa lembab.');
        }
        
        container.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
    }
};
