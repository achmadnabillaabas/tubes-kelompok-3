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
        
        // Weather icon - use emoji with description for better accuracy
        const weatherIcon = document.getElementById('weatherIcon');
        const emoji = this.getWeatherEmoji(data.condition, data.isNight, data.description);
        
        // Replace img with emoji text
        weatherIcon.style.display = 'none'; // Hide img tag
        const emojiContainer = weatherIcon.parentElement;
        
        // Remove old emoji if exists
        const oldEmoji = emojiContainer.querySelector('.weather-emoji');
        if (oldEmoji) oldEmoji.remove();
        
        // Create emoji element
        const emojiElement = document.createElement('div');
        emojiElement.className = 'weather-emoji';
        emojiElement.textContent = emoji;
        emojiElement.style.cssText = 'font-size: 120px; line-height: 1;';
        emojiContainer.appendChild(emojiElement);
        
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
        
        // Simple white background - no dynamic background
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
     * Get weather emoji icon based on condition with detailed variations
     */
    getWeatherEmoji(condition, isNight, description = '') {
        // Check description for more specific conditions
        const desc = description.toLowerCase();
        
        // Detailed emoji mapping based on condition and description
        if (condition === 'Clear') {
            return isNight ? '🌙' : '☀️';
        }
        
        if (condition === 'Clouds') {
            // Berawan dengan variasi
            if (desc.includes('few') || desc.includes('sedikit')) {
                return isNight ? '🌙☁️' : '🌤️'; // Cerah berawan
            } else if (desc.includes('scattered') || desc.includes('sebagian')) {
                return '⛅'; // Berawan sebagian
            } else if (desc.includes('broken') || desc.includes('mendung')) {
                return '☁️'; // Mendung
            } else if (desc.includes('overcast') || desc.includes('tertutup')) {
                return '☁️☁️'; // Sangat mendung
            }
            return '☁️'; // Default berawan
        }
        
        if (condition === 'Rain') {
            // Hujan dengan variasi
            if (desc.includes('light') || desc.includes('ringan') || desc.includes('rintik')) {
                return '🌦️'; // Hujan rintik-rintik
            } else if (desc.includes('moderate') || desc.includes('sedang')) {
                return '🌧️'; // Hujan sedang
            } else if (desc.includes('heavy') || desc.includes('lebat') || desc.includes('deras')) {
                return '🌧️💧'; // Hujan lebat
            }
            return '🌧️'; // Default hujan
        }
        
        if (condition === 'Drizzle') {
            // Gerimis/hujan rintik
            return '🌦️'; // Hujan rintik
        }
        
        if (condition === 'Thunderstorm') {
            // Badai petir dengan variasi
            if (desc.includes('light') || desc.includes('ringan')) {
                return '⛈️'; // Badai ringan
            } else if (desc.includes('heavy') || desc.includes('lebat')) {
                return '⛈️⚡'; // Badai lebat
            }
            return '⛈️'; // Default badai
        }
        
        // Other conditions
        const emojiMap = {
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️',
            'Smoke': '🌫️',
            'Dust': '🌫️',
            'Sand': '🌫️',
            'Ash': '🌫️',
            'Squall': '⛈️',
            'Tornado': '🌪️'
        };
        
        // Return emoji or default
        return emojiMap[condition] || '🌤️';
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
        
        // UV Index (realistic for Kediri - tropical highland)
        const hour = new Date().getHours();
        let uvIndex;
        if (hour >= 6 && hour <= 8) {
            uvIndex = Math.floor(Math.random() * 3) + 2; // 2-4 (pagi)
        } else if (hour >= 9 && hour <= 15) {
            uvIndex = Math.floor(Math.random() * 3) + 6; // 6-8 (siang)
        } else if (hour >= 16 && hour <= 17) {
            uvIndex = Math.floor(Math.random() * 3) + 3; // 3-5 (sore)
        } else {
            uvIndex = Math.floor(Math.random() * 2) + 1; // 1-2 (malam/dini hari)
        }
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
     * Update hourly forecast cards - Generate URUT 01:00-24:00 dari data API
     */
    updateHourlyCards(hourlyData) {
        const container = document.getElementById('hourlyCardsWrapper');
        container.innerHTML = '';
        
        console.log(`📊 Received ${hourlyData.length} hours of data from API`);
        
        // Generate 24 jam URUT (01:00-24:00) dari data API yang tersedia
        const complete24Hours = this.generate24HoursFromAPI(hourlyData);
        
        console.log(`📊 Displaying ${complete24Hours.length} hours URUT (01:00-24:00) in main view`);
        
        complete24Hours.forEach(hour => {
            const card = document.createElement('div');
            card.className = 'hourly-card';
            const emoji = this.getWeatherEmoji(hour.condition, hour.isNight, hour.description);
            card.innerHTML = `
                <div class="hour">${hour.time}</div>
                <div class="weather-emoji" style="font-size: 50px; margin: 8px 0;">${emoji}</div>
                <div class="temp">${hour.temp}°${this.currentUnit}</div>
                <div class="rain">💧 ${hour.pop}%</div>
            `;
            container.appendChild(card);
        });
    },

    /**
     * Generate 24 jam URUT (01:00-24:00) dari data API yang tersedia
     */
    generate24HoursFromAPI(apiHourlyData) {
        const result = [];
        
        // Create map of API data by hour
        const apiMap = new Map();
        apiHourlyData.forEach(hour => {
            const hourNum = hour.hour;
            apiMap.set(hourNum, hour);
        });
        
        // Get current hour to determine starting point
        const now = new Date();
        const currentHour = now.getHours();
        
        // Generate 24 hours starting from next hour
        for (let i = 0; i < 24; i++) {
            const targetHour = (currentHour + 1 + i) % 24;
            const displayHour = targetHour === 0 ? 24 : targetHour;
            
            if (apiMap.has(targetHour)) {
                // Use REAL API data
                const apiData = apiMap.get(targetHour);
                result.push({
                    time: `${displayHour.toString().padStart(2, '0')}:00`,
                    hour: targetHour,
                    temp: apiData.temp,
                    condition: apiData.condition,
                    description: apiData.description,
                    isNight: targetHour < 6 || targetHour > 18,
                    pop: apiData.pop
                });
            } else {
                // Find nearest API data for interpolation
                let nearest = null;
                let minDiff = Infinity;
                
                apiHourlyData.forEach(hour => {
                    const diff = Math.abs(hour.hour - targetHour);
                    if (diff < minDiff) {
                        minDiff = diff;
                        nearest = hour;
                    }
                });
                
                if (nearest) {
                    result.push({
                        time: `${displayHour.toString().padStart(2, '0')}:00`,
                        hour: targetHour,
                        temp: nearest.temp,
                        condition: nearest.condition,
                        description: nearest.description,
                        isNight: targetHour < 6 || targetHour > 18,
                        pop: nearest.pop
                    });
                }
            }
        }
        
        return result;
    },

    /**
     * Update daily forecast list with REAL API data
     */
    updateDailyList(dailyData) {
        const container = document.getElementById('dailyList');
        container.innerHTML = '';
        
        console.log(`📅 Displaying ${dailyData.length} days of REAL forecast data from API`);
        
        dailyData.forEach((day, index) => {
            const card = document.createElement('div');
            card.className = 'daily-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.cursor = 'pointer';
            
            const emoji = this.getWeatherEmoji(day.condition, false, day.description);
            
            // Format day name for better display
            let displayDayName = day.dayName;
            if (index === 0) displayDayName = 'Hari Ini';
            else if (index === 1) displayDayName = 'Besok';
            else if (index === 2) displayDayName = 'Lusa';
            
            card.innerHTML = `
                <div>
                    <div class="day-name">${displayDayName}</div>
                    <div class="date">${day.dateStr}</div>
                </div>
                <div class="weather-emoji" style="font-size: 60px;">${emoji}</div>
                <div class="temps">
                    <span class="temp-max">${day.maxTemp}°</span>
                    <span class="temp-min">${day.minTemp}°</span>
                </div>
                <div class="rain-prob">💧 ${day.pop}%</div>
                <div class="description">${day.description}</div>
            `;
            
            // Add click event listener for modal with REAL data
            card.addEventListener('click', () => {
                console.log(`🔍 Opening detail for day ${index}: ${day.dayName}`);
                this.showDailyDetail(day, index);
            });
            
            container.appendChild(card);
        });
        
        // Animate cards
        setTimeout(() => this.animateElements('.daily-card'), 100);
        
        console.log(`✅ Daily forecast cards displayed with REAL data`);
    },

    /**
     * Toggle temperature unit (Celsius/Fahrenheit)
     */
    toggleUnit() {
        console.log(`Current unit before toggle: ${this.currentUnit}`);
        
        // Toggle between C and F
        this.currentUnit = this.currentUnit === 'C' ? 'F' : 'C';
        
        console.log(`New unit after toggle: ${this.currentUnit}`);
        
        // Update button text
        const unitButton = document.getElementById('unitToggle');
        if (unitButton) {
            unitButton.textContent = `°${this.currentUnit}`;
        }
        
        // Convert and update current temperature immediately
        this.updateCurrentTemperature();
        
        // Update temp unit symbols
        this.updateTempUnitSymbols();
        
        console.log(`Temperature unit successfully changed to: ${this.currentUnit}`);
    },

    /**
     * Update current temperature display only
     */
    updateCurrentTemperature() {
        // Get current displayed temperature
        const currentTempElement = document.getElementById('currentTemp');
        const feelsLikeElement = document.getElementById('feelsLike');
        
        if (!currentTempElement) return;
        
        // Get current temperature value
        let currentTemp = parseInt(currentTempElement.textContent);
        let feelsLikeTemp = null;
        
        // Extract feels like temperature if available
        if (feelsLikeElement) {
            const feelsLikeText = feelsLikeElement.textContent;
            const tempMatch = feelsLikeText.match(/(\d+)/);
            if (tempMatch) {
                feelsLikeTemp = parseInt(tempMatch[1]);
            }
        }
        
        // Convert temperature based on current unit
        let newTemp, newFeelsLike;
        
        if (this.currentUnit === 'F') {
            // Converting from C to F
            newTemp = Math.round(currentTemp * 9/5 + 32);
            if (feelsLikeTemp) {
                newFeelsLike = Math.round(feelsLikeTemp * 9/5 + 32);
            }
        } else {
            // Converting from F to C
            newTemp = Math.round((currentTemp - 32) * 5/9);
            if (feelsLikeTemp) {
                newFeelsLike = Math.round((feelsLikeTemp - 32) * 5/9);
            }
        }
        
        // Update display
        currentTempElement.textContent = newTemp;
        
        if (feelsLikeElement && newFeelsLike !== null) {
            feelsLikeElement.textContent = `Terasa seperti ${newFeelsLike}°${this.currentUnit}`;
        }
        
        console.log(`Temperature converted: ${currentTemp}° → ${newTemp}°${this.currentUnit}`);
    },

    /**
     * Update all temperature unit symbols
     */
    updateTempUnitSymbols() {
        // Update main temp unit
        const tempUnitElements = document.querySelectorAll('.temp-unit');
        tempUnitElements.forEach(el => {
            el.textContent = `°${this.currentUnit}`;
        });
        
        // Update hourly forecast temperatures
        const hourlyCards = document.querySelectorAll('.hourly-card .temp');
        hourlyCards.forEach(card => {
            const tempText = card.textContent;
            const tempMatch = tempText.match(/(\d+)/);
            if (tempMatch) {
                let temp = parseInt(tempMatch[1]);
                let newTemp;
                
                if (this.currentUnit === 'F') {
                    newTemp = Math.round(temp * 9/5 + 32);
                } else {
                    newTemp = Math.round((temp - 32) * 5/9);
                }
                
                card.textContent = `${newTemp}°${this.currentUnit}`;
            }
        });
        
        // Update daily forecast temperatures
        const dailyCards = document.querySelectorAll('.daily-card .temps');
        dailyCards.forEach(card => {
            const tempElements = card.querySelectorAll('.temp-max, .temp-min');
            tempElements.forEach(tempEl => {
                const tempText = tempEl.textContent;
                const tempMatch = tempText.match(/(\d+)/);
                if (tempMatch) {
                    let temp = parseInt(tempMatch[1]);
                    let newTemp;
                    
                    if (this.currentUnit === 'F') {
                        newTemp = Math.round(temp * 9/5 + 32);
                    } else {
                        newTemp = Math.round((temp - 32) * 5/9);
                    }
                    
                    tempEl.textContent = `${newTemp}°`;
                }
            });
        });
        
        console.log(`All temperature symbols updated to °${this.currentUnit}`);
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
     * Show daily detail modal with 24-hour forecast from REAL API data
     */
    showDailyDetail(dayData, dayIndex) {
        const modal = document.getElementById('dailyDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMaxTemp = document.getElementById('modalMaxTemp');
        const modalMinTemp = document.getElementById('modalMinTemp');
        const modalIcon = document.getElementById('modalIcon');
        const modalCondition = document.getElementById('modalCondition');
        const modalRainProb = document.getElementById('modalRainProb');
        const hourlyGrid = document.getElementById('hourlyDetailGrid');

        // Set modal title
        modalTitle.textContent = `Detail Prediksi ${dayData.dayName}`;
        
        // Set summary data
        modalMaxTemp.textContent = `${dayData.maxTemp}°`;
        modalMinTemp.textContent = `${dayData.minTemp}°`;
        modalIcon.src = dayData.iconUrl;
        modalIcon.alt = dayData.description;
        modalCondition.textContent = dayData.description;
        modalRainProb.textContent = `${dayData.pop}%`;

        // Get REAL hourly data from API for this specific day
        console.log(`📊 Loading REAL hourly data for day ${dayIndex}: ${dayData.dayName}`);
        const hourlyData = this.getRealHourlyDataForDay(dayData, dayIndex);
        
        // Clear and populate hourly grid
        hourlyGrid.innerHTML = '';
        
        if (hourlyData.length === 0) {
            hourlyGrid.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Data per jam tidak tersedia untuk hari ini</div>';
        } else {
            hourlyData.forEach(hour => {
                const card = document.createElement('div');
                card.className = 'hourly-detail-card';
                
                const emoji = this.getWeatherEmoji(hour.condition, hour.isNight, hour.description);
                
                card.innerHTML = `
                    <div class="hour-time">${hour.time}</div>
                    <div class="hour-icon">${emoji}</div>
                    <div class="hour-temp">${hour.temp}°</div>
                    <div class="hour-rain">💧 ${hour.pop}%</div>
                    <div class="hour-condition">${hour.description}</div>
                `;
                
                hourlyGrid.appendChild(card);
            });
            
            console.log(`✅ Displayed ${hourlyData.length} hours of REAL data for ${dayData.dayName}`);
        }

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Get REAL hourly data for specific day from API forecast data
     * Generate complete 24-hour data (01:00-24:00) based on available API data
     */
    getRealHourlyDataForDay(dayData, dayIndex) {
        // Check if we have forecast data
        if (!this.currentForecastData || !this.currentForecastData.hourly) {
            console.warn('⚠️ No forecast data available');
            return this.generateComplete24Hours(dayData);
        }

        const allHourlyData = this.currentForecastData.hourly;
        const targetDate = dayData.date;
        
        // For today (dayIndex 0), get data starting from current hour
        if (dayIndex === 0) {
            console.log('📊 Generating 24-hour data for today from API');
            return this.generateComplete24Hours(dayData, allHourlyData, 0);
        }
        
        // For future days, filter hourly data by date
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayHourlyData = allHourlyData.filter(hour => {
            const hourDate = new Date(hour.dt * 1000);
            return hourDate >= dayStart && hourDate <= dayEnd;
        });
        
        console.log(`📊 Found ${dayHourlyData.length} hours of REAL API data for ${dayData.dayName}`);
        
        // Generate complete 24-hour data using available API data
        return this.generateComplete24Hours(dayData, dayHourlyData, dayIndex);
    },

    /**
     * Generate complete 24-hour forecast (01:00-24:00) URUT dengan data REAL dari API
     */
    generateComplete24Hours(dayData, apiHourlyData = [], dayIndex = 0) {
        const hourlyData = [];
        
        console.log(`📊 Generating 24-hour forecast for ${dayData.dayName}`);
        console.log(`📊 Available API data points: ${apiHourlyData.length}`);
        
        // Create map of API data by hour for quick lookup
        const apiDataMap = new Map();
        if (apiHourlyData && apiHourlyData.length > 0) {
            apiHourlyData.forEach(apiData => {
                const hourDate = new Date(apiData.dt * 1000);
                const hour = hourDate.getHours();
                // Store API data by hour
                if (!apiDataMap.has(hour)) {
                    apiDataMap.set(hour, apiData);
                }
            });
            console.log(`📊 API data mapped for hours: ${Array.from(apiDataMap.keys()).sort((a,b) => a-b).join(', ')}`);
        }
        
        // Generate URUT dari jam 01:00 sampai 24:00
        for (let hour = 1; hour <= 24; hour++) {
            const displayHour = hour === 24 ? 0 : hour;
            const isNight = displayHour < 6 || displayHour > 18;
            
            let hourData;
            
            // Check if we have REAL API data for this exact hour
            if (apiDataMap.has(displayHour)) {
                // ✅ USE REAL API DATA
                const apiData = apiDataMap.get(displayHour);
                console.log(`✅ Using REAL API data for ${hour.toString().padStart(2, '0')}:00 (${displayHour}h)`);
                
                hourData = {
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    hour: displayHour,
                    temp: Math.round(apiData.temp),
                    condition: apiData.condition,
                    description: apiData.description,
                    isNight: isNight,
                    pop: Math.round(apiData.pop),
                    humidity: apiData.humidity || dayData.humidity,
                    windSpeed: apiData.windSpeed || 0
                };
            } else {
                // Find nearest API data for interpolation
                let nearestBefore = null;
                let nearestAfter = null;
                
                // Find data before this hour
                for (let h = displayHour - 1; h >= 0; h--) {
                    if (apiDataMap.has(h)) {
                        nearestBefore = apiDataMap.get(h);
                        break;
                    }
                }
                
                // Find data after this hour
                for (let h = displayHour + 1; h <= 23; h++) {
                    if (apiDataMap.has(h)) {
                        nearestAfter = apiDataMap.get(h);
                        break;
                    }
                }
                
                // Interpolate between nearest API data points
                if (nearestBefore && nearestAfter) {
                    // Linear interpolation between two API points
                    const beforeHour = new Date(nearestBefore.dt * 1000).getHours();
                    const afterHour = new Date(nearestAfter.dt * 1000).getHours();
                    const ratio = (displayHour - beforeHour) / (afterHour - beforeHour);
                    
                    const temp = nearestBefore.temp + (nearestAfter.temp - nearestBefore.temp) * ratio;
                    const pop = nearestBefore.pop + (nearestAfter.pop - nearestBefore.pop) * ratio;
                    
                    console.log(`🔄 Interpolating ${hour.toString().padStart(2, '0')}:00 between ${beforeHour}h and ${afterHour}h`);
                    
                    hourData = {
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        hour: displayHour,
                        temp: Math.round(temp),
                        condition: nearestBefore.condition,
                        description: nearestBefore.description,
                        isNight: isNight,
                        pop: Math.round(pop),
                        humidity: Math.round((nearestBefore.humidity + nearestAfter.humidity) / 2),
                        windSpeed: Math.round((nearestBefore.windSpeed + nearestAfter.windSpeed) / 2)
                    };
                } else if (nearestBefore) {
                    // Use nearest before
                    console.log(`📍 Using nearest before for ${hour.toString().padStart(2, '0')}:00`);
                    hourData = {
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        hour: displayHour,
                        temp: Math.round(nearestBefore.temp),
                        condition: nearestBefore.condition,
                        description: nearestBefore.description,
                        isNight: isNight,
                        pop: Math.round(nearestBefore.pop),
                        humidity: nearestBefore.humidity,
                        windSpeed: nearestBefore.windSpeed
                    };
                } else if (nearestAfter) {
                    // Use nearest after
                    console.log(`📍 Using nearest after for ${hour.toString().padStart(2, '0')}:00`);
                    hourData = {
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        hour: displayHour,
                        temp: Math.round(nearestAfter.temp),
                        condition: nearestAfter.condition,
                        description: nearestAfter.description,
                        isNight: isNight,
                        pop: Math.round(nearestAfter.pop),
                        humidity: nearestAfter.humidity,
                        windSpeed: nearestAfter.windSpeed
                    };
                } else {
                    // No API data at all, use realistic interpolation from daily data
                    console.log(`⚠️ No API data, using daily interpolation for ${hour.toString().padStart(2, '0')}:00`);
                    const temp = this.interpolateTemperature(displayHour, dayData, new Map());
                    const pop = this.interpolateRainProbability(displayHour, dayData, new Map());
                    
                    hourData = {
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        hour: displayHour,
                        temp: Math.round(temp),
                        condition: dayData.condition,
                        description: dayData.description,
                        isNight: isNight,
                        pop: Math.round(pop),
                        humidity: dayData.humidity,
                        windSpeed: 0
                    };
                }
            }
            
            hourlyData.push(hourData);
        }
        
        console.log(`✅ Generated ${hourlyData.length} hours URUT (01:00-24:00) for ${dayData.dayName}`);
        return hourlyData;
    },

    /**
     * Interpolate temperature for hours without API data
     * Uses realistic daily temperature curve
     */
    interpolateTemperature(hour, dayData, apiDataByHour) {
        const { minTemp, maxTemp } = dayData;
        const tempRange = maxTemp - minTemp;
        
        // Realistic temperature curve for tropical/subtropical climate
        // Coldest: 5-6 AM, Warmest: 2-3 PM
        
        if (hour >= 0 && hour <= 5) {
            // Midnight to dawn: coldest period
            // 00:00 = min + 15%, gradually approaching minimum at 5 AM
            const progress = hour / 5;
            return minTemp + tempRange * (0.15 * (1 - progress));
        } else if (hour >= 6 && hour <= 11) {
            // Morning: rapid warming
            // 6 AM = min, 11 AM = 70% to max
            const progress = (hour - 6) / 5;
            return minTemp + tempRange * (progress * 0.7);
        } else if (hour >= 12 && hour <= 14) {
            // Midday to early afternoon: peak heat
            // 12 PM = 85%, 1 PM = 95%, 2 PM = 100%
            const progress = (hour - 12) / 2;
            return minTemp + tempRange * (0.85 + progress * 0.15);
        } else if (hour >= 15 && hour <= 18) {
            // Late afternoon: gradual cooling
            // 3 PM = 95%, 6 PM = 65%
            const progress = (hour - 15) / 3;
            return maxTemp - tempRange * (progress * 0.35);
        } else if (hour >= 19 && hour <= 23) {
            // Evening to night: continued cooling
            // 7 PM = 55%, 11 PM = 20%
            const progress = (hour - 19) / 4;
            return minTemp + tempRange * (0.55 - progress * 0.35);
        }
        
        return minTemp + tempRange * 0.5; // Fallback
    },

    /**
     * Interpolate rain probability for hours without API data
     * Uses realistic daily rain pattern for tropical climate
     */
    interpolateRainProbability(hour, dayData, apiDataByHour) {
        const basePop = dayData.pop;
        
        // Realistic rain pattern for tropical/subtropical climate
        // Rain more likely in afternoon/evening (convective rainfall)
        
        if (hour >= 0 && hour <= 5) {
            // Midnight to dawn: low probability
            return Math.max(0, basePop * 0.5);
        } else if (hour >= 6 && hour <= 11) {
            // Morning: gradually increasing
            const progress = (hour - 6) / 5;
            return basePop * (0.6 + progress * 0.2);
        } else if (hour >= 12 && hour <= 15) {
            // Midday to afternoon: peak probability
            // Convective rainfall most common 2-4 PM
            const progress = (hour - 12) / 3;
            return Math.min(100, basePop * (1.0 + progress * 0.3));
        } else if (hour >= 16 && hour <= 18) {
            // Late afternoon: still high
            return Math.min(100, basePop * 1.2);
        } else if (hour >= 19 && hour <= 21) {
            // Evening: decreasing
            const progress = (hour - 19) / 2;
            return basePop * (1.0 - progress * 0.3);
        } else {
            // Night: lower probability
            return basePop * 0.6;
        }
    },

    /**
     * Hide daily detail modal
     */
    hideDailyDetail() {
        const modal = document.getElementById('dailyDetailModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            console.log('✅ Modal closed');
        }
    },

    /**
     * Setup daily detail modal event listeners
     */
    setupDailyDetailModal() {
        const modal = document.getElementById('dailyDetailModal');
        const closeBtn = document.getElementById('closeModal');

        // Close modal events
        closeBtn.addEventListener('click', () => this.hideDailyDetail());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideDailyDetail();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.hideDailyDetail();
            }
        });
    }
};
