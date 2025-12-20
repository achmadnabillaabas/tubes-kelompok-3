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
            
            // Add data attributes for easier debugging and event handling
            card.setAttribute('data-day-index', index);
            card.setAttribute('data-day-name', day.dayName);
            card.setAttribute('data-date', day.dateStr);
            
            console.log(`📊 Created daily card ${index}:`, {
                dayName: day.dayName,
                dateStr: day.dateStr,
                maxTemp: day.maxTemp,
                minTemp: day.minTemp,
                pop: day.pop
            });
            
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
            card.addEventListener('click', (e) => {
                console.log(`🔍 Daily card clicked! Day ${index}: ${day.dayName}`);
                console.log('Card element:', card);
                console.log('Day data:', day);
                console.log('Event:', e);
                
                // Prevent event bubbling
                e.stopPropagation();
                e.preventDefault();
                
                // Add visual feedback
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
                
                try {
                    console.log('🚀 Attempting to show daily detail...');
                    this.showDailyDetail(day, index);
                    console.log('✅ showDailyDetail called successfully');
                } catch (error) {
                    console.error('❌ Error showing daily detail:', error);
                    console.error('Error stack:', error.stack);
                }
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
        console.log(`🔍 === SHOW DAILY DETAIL START ===`);
        console.log(`🔍 showDailyDetail called for day ${dayIndex}:`, dayData);
        console.log('🔍 Current forecast data available:', !!this.currentForecastData);
        
        const modal = document.getElementById('dailyDetailModal');
        console.log('🔍 Modal element:', modal);
        
        if (!modal) {
            console.error('❌ Daily detail modal not found!');
            alert('Modal tidak ditemukan! Periksa HTML.');
            return;
        }
        
        console.log('✅ Modal element found:', modal);
        console.log('🔍 Modal current classes:', modal.className);
        console.log('🔍 Modal current display:', getComputedStyle(modal).display);

        const modalTitle = document.getElementById('modalTitle');
        const modalLocation = document.getElementById('modalLocation');
        const modalDate = document.getElementById('modalDate');
        const modalMaxTemp = document.getElementById('modalMaxTemp');
        const modalMinTemp = document.getElementById('modalMinTemp');
        const modalIcon = document.getElementById('modalIcon');
        const modalCondition = document.getElementById('modalCondition');
        const modalRainProb = document.getElementById('modalRainProb');
        const modalWind = document.getElementById('modalWind');
        const modalHumidity = document.getElementById('modalHumidity');
        const modalLastUpdate = document.getElementById('modalLastUpdate');
        const hourlyGrid = document.getElementById('hourlyDetailGrid');

        // Check if all required elements exist
        const requiredElements = {
            modalTitle, modalLocation, modalDate, modalMaxTemp, modalMinTemp,
            modalIcon, modalCondition, modalRainProb, modalWind, modalHumidity,
            modalLastUpdate, hourlyGrid
        };
        
        const missingElements = Object.entries(requiredElements)
            .filter(([name, element]) => !element)
            .map(([name]) => name);
            
        if (missingElements.length > 0) {
            console.error('❌ Missing modal elements:', missingElements);
            alert(`Modal elements tidak lengkap: ${missingElements.join(', ')}`);
            return;
        }

        console.log('✅ All modal elements found, populating data...');

        // Get current location info
        const currentLocationName = document.getElementById('locationName')?.textContent || 'Lokasi Tidak Diketahui';
        
        // Format date properly
        const dayDate = new Date(dayData.date);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = dayDate.toLocaleDateString('id-ID', options);

        // Set modal header info
        modalTitle.textContent = `Detail Prediksi ${dayData.dayName}`;
        modalLocation.textContent = `📍 ${currentLocationName}`;
        modalDate.textContent = formattedDate;
        
        // Set summary data
        modalMaxTemp.textContent = `${dayData.maxTemp}°`;
        modalMinTemp.textContent = `${dayData.minTemp}°`;
        modalIcon.src = dayData.iconUrl;
        modalIcon.alt = dayData.description;
        modalCondition.textContent = dayData.description;
        modalRainProb.textContent = `${dayData.pop}%`;
        
        // Set additional weather details
        modalWind.textContent = dayData.windSpeed ? `${dayData.windSpeed} m/s` : '--';
        modalHumidity.textContent = dayData.humidity ? `${dayData.humidity}%` : '--%';
        
        // Set last update time
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        modalLastUpdate.textContent = `Diperbarui: ${timeString}`;

        // Get REAL hourly data from API for this specific day
        console.log(`📊 Loading REAL hourly data for day ${dayIndex}: ${dayData.dayName}`);
        const hourlyData = this.getRealHourlyDataForDay(dayData, dayIndex);
        
        // Clear and populate hourly grid
        hourlyGrid.innerHTML = '';
        
        if (hourlyData.length === 0) {
            hourlyGrid.innerHTML = '<div class="no-data-message">Data per jam tidak tersedia untuk hari ini</div>';
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
                    <div class="hour-wind">💨 ${hour.windSpeed || 0} m/s</div>
                    <div class="hour-condition">${hour.description}</div>
                `;
                
                hourlyGrid.appendChild(card);
            });
            
            console.log(`✅ Displayed ${hourlyData.length} hours of REAL data for ${dayData.dayName}`);
        }

        // Show modal with smooth animation
        console.log('🎬 === SHOWING MODAL ===');
        console.log('🎬 Modal before show - classes:', modal.className);
        console.log('🎬 Modal before show - display:', getComputedStyle(modal).display);
        console.log('🎬 Body overflow before:', document.body.style.overflow);
        
        // Force show modal
        modal.classList.add('show');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.zIndex = '99999';
        document.body.style.overflow = 'hidden';
        
        console.log('🎬 Modal after show - classes:', modal.className);
        console.log('🎬 Modal after show - display:', getComputedStyle(modal).display);
        console.log('🎬 Modal after show - opacity:', getComputedStyle(modal).opacity);
        console.log('🎬 Modal after show - z-index:', getComputedStyle(modal).zIndex);
        console.log('🎬 Body overflow after:', document.body.style.overflow);
        
        // Add smooth entrance animation
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transform = 'scale(1) translateY(0)';
                console.log('✅ Modal animation applied');
            } else {
                console.error('❌ Modal content not found for animation');
            }
        }, 10);
        
        // Test if modal is visible
        setTimeout(() => {
            const rect = modal.getBoundingClientRect();
            console.log('🔍 Modal position after 100ms:', rect);
            console.log('🔍 Modal visible?', rect.width > 0 && rect.height > 0);
        }, 100);
        
        console.log('✅ Modal displayed successfully for:', dayData.dayName);
        console.log('🔍 Final modal classes:', modal.className);
        console.log('🔍 Final body overflow:', document.body.style.overflow);
        console.log(`🔍 === SHOW DAILY DETAIL END ===`);
    },

    /**
     * Get REAL hourly data for specific day - menggunakan data yang sama dengan prediksi 24 jam utama
     * Disesuaikan dengan lokasi dan hari yang real
     */
    getRealHourlyDataForDay(dayData, dayIndex) {
        console.log(`📊 Getting hourly data for day ${dayIndex}: ${dayData.dayName}`);
        console.log(`📊 Target date: ${dayData.date}`);
        
        // Check if we have forecast data
        if (!this.currentForecastData || !this.currentForecastData.hourly) {
            console.warn('⚠️ No forecast data available');
            return this.generateFallback24Hours(dayData);
        }

        const allHourlyData = this.currentForecastData.hourly;
        console.log(`📊 Total hourly data available: ${allHourlyData.length} hours`);
        
        // Get current location info for consistency
        const currentLocationName = document.getElementById('locationName')?.textContent || 'Unknown Location';
        console.log(`📍 Current location: ${currentLocationName}`);
        
        // For today (dayIndex 0), use the same logic as main hourly forecast
        if (dayIndex === 0) {
            console.log('📊 Processing today - using same logic as main hourly forecast');
            return this.generateTodayHourlyData(allHourlyData, dayData);
        }
        
        // For future days, filter hourly data by specific date
        const targetDate = new Date(dayData.date);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        console.log(`📊 Filtering data for date range: ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);
        
        const dayHourlyData = allHourlyData.filter(hour => {
            const hourDate = new Date(hour.dt * 1000);
            return hourDate >= dayStart && hourDate <= dayEnd;
        });
        
        console.log(`📊 Found ${dayHourlyData.length} hours of API data for ${dayData.dayName}`);
        console.log(`📊 Sample filtered data:`, dayHourlyData.slice(0, 3));
        
        // Generate complete 24-hour data using the same method as main forecast
        return this.generateComplete24HoursFromFiltered(dayData, dayHourlyData, dayIndex);
    },

    /**
     * Generate today's hourly data - menggunakan logika yang SAMA PERSIS dengan prediksi 24 jam utama
     */
    generateTodayHourlyData(allHourlyData, dayData) {
        console.log('📊 Generating today hourly data using EXACT same logic as main forecast');
        
        // Convert API hourly data to the same format used by main forecast
        const formattedHourlyData = allHourlyData.map(hour => {
            const hourDate = new Date(hour.dt * 1000);
            return {
                hour: hourDate.getHours(),
                temp: hour.temp || hour.main?.temp || dayData.maxTemp,
                condition: hour.weather?.[0]?.main || hour.condition || dayData.condition,
                description: hour.weather?.[0]?.description || hour.description || dayData.description,
                pop: hour.pop ? Math.round(hour.pop * 100) : 0,
                humidity: hour.main?.humidity || hour.humidity || 50,
                windSpeed: hour.wind?.speed || hour.windSpeed || 0
            };
        });
        
        console.log(`📊 Formatted ${formattedHourlyData.length} hours for main forecast logic`);
        
        // Use the EXACT same function as main hourly forecast
        const result = this.generate24HoursFromAPI(formattedHourlyData);
        
        // Convert back to the format expected by popup (00:00-23:00 instead of next 24 hours)
        const popup24Hours = [];
        
        for (let hour = 0; hour < 24; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            
            // Find matching data from main forecast result
            let matchingData = result.find(item => {
                const itemHour = item.hour;
                return itemHour === hour;
            });
            
            if (matchingData) {
                popup24Hours.push({
                    time: timeString,
                    hour: hour,
                    temp: Math.round(matchingData.temp),
                    condition: matchingData.condition,
                    description: matchingData.description,
                    isNight: hour < 6 || hour > 18,
                    pop: matchingData.pop,
                    humidity: matchingData.humidity || 50,
                    windSpeed: Math.round(matchingData.windSpeed || 0)
                });
            } else {
                // Use interpolation if no exact match
                popup24Hours.push(this.generateInterpolatedHour(hour, dayData, new Map()));
            }
        }
        
        console.log(`✅ Generated ${popup24Hours.length} hours using main forecast logic`);
        console.log(`📊 Sample popup hours:`, popup24Hours.slice(0, 3));
        
        return popup24Hours;
    },

    /**
     * Generate complete 24-hour data from filtered API data
     */
    generateComplete24HoursFromFiltered(dayData, filteredHourlyData, dayIndex) {
        const result = [];
        
        console.log(`📊 Generating 24-hour data for ${dayData.dayName} from ${filteredHourlyData.length} filtered hours`);
        
        // Create map of filtered API data by hour
        const apiMap = new Map();
        filteredHourlyData.forEach(hour => {
            const hourDate = new Date(hour.dt * 1000);
            const hourNum = hourDate.getHours();
            apiMap.set(hourNum, {
                hour: hourNum,
                temp: hour.temp || hour.main?.temp || dayData.maxTemp,
                condition: hour.weather?.[0]?.main || hour.condition || dayData.condition,
                description: hour.weather?.[0]?.description || hour.description || dayData.description,
                pop: hour.pop ? Math.round(hour.pop * 100) : Math.round(dayData.pop || 0),
                humidity: hour.main?.humidity || hour.humidity || dayData.humidity || 50,
                windSpeed: hour.wind?.speed || hour.windSpeed || 0,
                isNight: hourNum < 6 || hourNum > 18
            });
        });
        
        console.log(`📊 API data mapped for hours: ${Array.from(apiMap.keys()).sort((a,b) => a-b).join(', ')}`);
        
        // Generate complete 24 hours (00:00 to 23:00)
        for (let hour = 0; hour < 24; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            
            if (apiMap.has(hour)) {
                // Use real API data
                const apiData = apiMap.get(hour);
                console.log(`✅ Using real API data for ${timeString}`);
                
                result.push({
                    time: timeString,
                    hour: hour,
                    temp: Math.round(apiData.temp),
                    condition: apiData.condition,
                    description: apiData.description,
                    isNight: apiData.isNight,
                    pop: apiData.pop,
                    humidity: apiData.humidity,
                    windSpeed: Math.round(apiData.windSpeed)
                });
            } else {
                // Generate interpolated data
                result.push(this.generateInterpolatedHour(hour, dayData, apiMap));
            }
        }
        
        console.log(`✅ Generated complete 24-hour data: ${result.length} hours`);
        console.log(`📊 Sample hours:`, result.slice(0, 3), '...', result.slice(-3));
        
        return result;
    },

    /**
     * Generate interpolated hour data when API data is not available
     */
    generateInterpolatedHour(hour, dayData, apiMap) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const isNight = hour < 6 || hour > 18;
        
        // Find nearest available hours for interpolation
        let nearestBefore = null;
        let nearestAfter = null;
        
        for (let [apiHour, apiData] of apiMap) {
            if (apiHour < hour && (!nearestBefore || apiHour > nearestBefore.hour)) {
                nearestBefore = apiData;
            }
            if (apiHour > hour && (!nearestAfter || apiHour < nearestAfter.hour)) {
                nearestAfter = apiData;
            }
        }
        
        // Interpolate temperature
        let interpolatedTemp;
        if (nearestBefore && nearestAfter) {
            // Linear interpolation between two points
            const ratio = (hour - nearestBefore.hour) / (nearestAfter.hour - nearestBefore.hour);
            interpolatedTemp = Math.round(nearestBefore.temp + (nearestAfter.temp - nearestBefore.temp) * ratio);
        } else {
            // Use daily temperature pattern (realistic curve)
            const tempRange = dayData.maxTemp - dayData.minTemp;
            // Peak temperature around 14:00, minimum around 06:00
            const tempOffset = Math.sin((hour - 6) * Math.PI / 12) * (tempRange / 2);
            interpolatedTemp = Math.round(dayData.minTemp + (tempRange / 2) + tempOffset);
        }
        
        // Use nearest data for other properties or fallback to daily data
        const referenceData = nearestBefore || nearestAfter || {};
        
        console.log(`🔄 Interpolated data for ${timeString}: ${interpolatedTemp}°C`);
        
        return {
            time: timeString,
            hour: hour,
            temp: interpolatedTemp,
            condition: referenceData.condition || dayData.condition,
            description: referenceData.description || dayData.description,
            isNight: isNight,
            pop: referenceData.pop || Math.round(dayData.pop || 0),
            humidity: referenceData.humidity || dayData.humidity || 50,
            windSpeed: Math.round(referenceData.windSpeed || 0)
        };
    },

    /**
     * Generate fallback 24-hour data when no API data is available
     */
    generateFallback24Hours(dayData) {
        console.log('🔄 Generating fallback 24-hour data');
        const result = [];
        
        for (let hour = 0; hour < 24; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const isNight = hour < 6 || hour > 18;
            
            // Generate realistic temperature curve
            const tempRange = dayData.maxTemp - dayData.minTemp;
            const tempOffset = Math.sin((hour - 6) * Math.PI / 12) * (tempRange / 2);
            const temp = Math.round(dayData.minTemp + (tempRange / 2) + tempOffset);
            
            result.push({
                time: timeString,
                hour: hour,
                temp: temp,
                condition: dayData.condition,
                description: dayData.description,
                isNight: isNight,
                pop: Math.round(dayData.pop || 0),
                humidity: dayData.humidity || 50,
                windSpeed: 0
            });
        }
        
        return result;
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
        if (modal && modal.classList.contains('show')) {
            // Add smooth exit animation
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.transform = 'scale(0.95) translateY(-20px)';
            modalContent.style.opacity = '0';
            
            // Hide modal after animation
            setTimeout(() => {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
                
                // Reset transform for next time
                modalContent.style.transform = 'scale(0.95) translateY(20px)';
                modalContent.style.opacity = '1';
            }, 200);
            
            console.log('✅ Modal closed with animation');
        }
    },

    /**
     * Setup daily detail modal event listeners
     */
    setupDailyDetailModal() {
        const modal = document.getElementById('dailyDetailModal');
        const closeBtn = document.getElementById('closeModal');

        if (!modal || !closeBtn) {
            console.error('❌ Modal elements not found during setup');
            return;
        }

        console.log('✅ Setting up daily detail modal event listeners');

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

        // Event delegation for daily cards (primary method)
        const dailyListContainer = document.getElementById('dailyList');
        if (dailyListContainer) {
            dailyListContainer.addEventListener('click', (e) => {
                const dailyCard = e.target.closest('.daily-card');
                if (dailyCard) {
                    console.log('🔍 Daily card clicked via delegation!', dailyCard);
                    
                    const dayIndex = parseInt(dailyCard.getAttribute('data-day-index'));
                    const dayName = dailyCard.getAttribute('data-day-name');
                    
                    console.log(`📊 Day index: ${dayIndex}, Day name: ${dayName}`);
                    
                    // Get the day data from current forecast data
                    if (this.currentForecastData && this.currentForecastData.daily && this.currentForecastData.daily[dayIndex]) {
                        const dayData = this.currentForecastData.daily[dayIndex];
                        console.log('✅ Using forecast data for delegation:', dayData);
                        this.showDailyDetail(dayData, dayIndex);
                    } else {
                        console.warn('⚠️ No forecast data available for delegation');
                        console.log('Current forecast data:', this.currentForecastData);
                    }
                }
            });
            console.log('✅ Event delegation set up on #dailyList');
        } else {
            console.error('❌ #dailyList container not found for event delegation');
        }

        console.log('✅ Daily detail modal setup complete');
        
        // Add debugging function to window for testing
        window.testModal = () => {
            console.log('🧪 Testing modal visibility...');
            const modal = document.getElementById('dailyDetailModal');
            if (modal) {
                console.log('Modal found:', modal);
                console.log('Modal classes:', modal.className);
                console.log('Modal computed style display:', getComputedStyle(modal).display);
                
                // Force show modal for testing
                modal.classList.add('show');
                modal.classList.add('modal-debug');
                console.log('Modal classes after adding show:', modal.className);
                
                setTimeout(() => {
                    modal.classList.remove('show');
                    modal.classList.remove('modal-debug');
                    console.log('Modal hidden after test');
                }, 3000);
            } else {
                console.error('Modal not found!');
            }
        };
        
        console.log('🧪 Test function added: window.testModal()');
        
        // Add daily card click test function
        window.testDailyCardClick = () => {
            console.log('🧪 Testing daily card click...');
            const dailyCards = document.querySelectorAll('.daily-card');
            console.log(`Found ${dailyCards.length} daily cards`);
            
            if (dailyCards.length > 0) {
                const firstCard = dailyCards[0];
                console.log('First card:', firstCard);
                console.log('First card data attributes:', {
                    dayIndex: firstCard.getAttribute('data-day-index'),
                    dayName: firstCard.getAttribute('data-day-name'),
                    date: firstCard.getAttribute('data-date')
                });
                
                // Simulate click
                firstCard.click();
                console.log('✅ Simulated click on first daily card');
            } else {
                console.error('❌ No daily cards found');
            }
        };
        
        console.log('🧪 Test function added: window.testDailyCardClick()');
        
        // Add function to compare main forecast vs popup data
        window.compareHourlyData = () => {
            console.log('🧪 === COMPARING MAIN FORECAST VS POPUP DATA ===');
            
            if (!WeatherUI.currentForecastData || !WeatherUI.currentForecastData.hourly) {
                console.error('❌ No forecast data available');
                return;
            }
            
            // Get main forecast data (same as displayed in main view)
            const mainHourlyData = WeatherUI.currentForecastData.hourly.map(hour => {
                const hourDate = new Date(hour.dt * 1000);
                return {
                    hour: hourDate.getHours(),
                    temp: hour.temp || hour.main?.temp,
                    condition: hour.weather?.[0]?.main || hour.condition,
                    description: hour.weather?.[0]?.description || hour.description,
                    pop: hour.pop ? Math.round(hour.pop * 100) : 0
                };
            });
            
            const mainFormatted = WeatherUI.generate24HoursFromAPI(mainHourlyData);
            console.log('Main forecast (first 5 hours):', mainFormatted.slice(0, 5));
            
            // Get popup data for today
            if (WeatherUI.currentForecastData.daily && WeatherUI.currentForecastData.daily[0]) {
                const todayData = WeatherUI.currentForecastData.daily[0];
                const popupData = WeatherUI.getRealHourlyDataForDay(todayData, 0);
                console.log('Popup data (first 5 hours):', popupData.slice(0, 5));
                
                // Compare first few hours
                console.log('=== COMPARISON ===');
                for (let i = 0; i < Math.min(5, mainFormatted.length, popupData.length); i++) {
                    const main = mainFormatted[i];
                    const popup = popupData[i];
                    console.log(`Hour ${i}:`);
                    console.log(`  Main: ${main.time} - ${main.temp}°C - ${main.condition}`);
                    console.log(`  Popup: ${popup.time} - ${popup.temp}°C - ${popup.condition}`);
                    console.log(`  Match: ${main.temp === popup.temp && main.condition === popup.condition ? '✅' : '❌'}`);
                }
            }
        };
        
        console.log('🧪 Comparison function added: window.compareHourlyData()');
        
        // Add manual modal test function
        window.forceShowModal = () => {
            console.log('🧪 === FORCE SHOW MODAL TEST ===');
            
            const modal = document.getElementById('dailyDetailModal');
            if (!modal) {
                console.error('❌ Modal not found!');
                return;
            }
            
            console.log('✅ Modal found, forcing display...');
            
            // Force show with all possible methods
            modal.style.display = 'flex !important';
            modal.style.opacity = '1 !important';
            modal.style.zIndex = '99999 !important';
            modal.style.position = 'fixed !important';
            modal.style.top = '0 !important';
            modal.style.left = '0 !important';
            modal.style.width = '100% !important';
            modal.style.height = '100% !important';
            modal.style.background = 'rgba(0, 0, 0, 0.8) !important';
            
            modal.classList.add('show');
            modal.classList.add('force-visible');
            
            document.body.style.overflow = 'hidden';
            
            console.log('Modal forced visible. Classes:', modal.className);
            console.log('Modal computed display:', getComputedStyle(modal).display);
            
            // Add close handler
            setTimeout(() => {
                modal.addEventListener('click', () => {
                    modal.style.display = 'none';
                    modal.classList.remove('show', 'force-visible');
                    document.body.style.overflow = 'auto';
                    console.log('Modal closed');
                });
            }, 100);
        };
        
        // Add function to test daily card click
        window.testDailyCardClickForce = () => {
            console.log('🧪 Testing daily card click with force...');
            
            const dailyCards = document.querySelectorAll('.daily-card');
            console.log(`Found ${dailyCards.length} daily cards`);
            
            if (dailyCards.length > 0) {
                const firstCard = dailyCards[0];
                console.log('Clicking first card:', firstCard);
                
                // Simulate click with debugging
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                
                firstCard.dispatchEvent(event);
                console.log('✅ Click event dispatched');
            } else {
                console.error('❌ No daily cards found');
            }
        };
        
        console.log('🧪 Manual test functions added: window.forceShowModal(), window.testDailyCardClickForce()');
    }
};
