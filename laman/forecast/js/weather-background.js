/**
 * Weather Background Engine Module
 * Dynamically changes background images based on weather conditions
 */

const WeatherBackground = {
    // Configuration
    config: {
        backgroundImages: {
            hot: '../current/assets/bg2.jpg',    // Hot/sunny weather
            cool: '../current/assets/bg.jpg'     // Cool/cloudy/rainy weather
        },
        temperatureThreshold: 25, // Celsius threshold for hot vs cool
        transitionDuration: 800,  // CSS transition duration in ms
        targetElement: '.hero-section',
        // Performance optimization settings
        throttleDelay: 1000,      // Minimum time between background changes (ms)
        debounceDelay: 300,       // Debounce delay for rapid updates (ms)
        cacheTimeout: 300000      // Image cache timeout (5 minutes)
    },

    // State management
    state: {
        currentBackground: null,
        imagesPreloaded: false,
        isInitialized: false,
        failedImages: [],
        errorCount: 0,
        lastError: null,
        // Performance optimization state
        lastUpdateTime: 0,
        pendingUpdate: null,
        debounceTimer: null,
        imageCache: new Map(),
        cacheTimestamps: new Map()
    },

    /**
     * Initialize the background system
     */
    async initializeBackgroundSystem() {
        console.log('🎨 Initializing Weather Background System...');
        
        try {
            // Reset error state
            this.state.errorCount = 0;
            this.state.lastError = null;
            
            // Check if target element exists
            const targetElement = document.querySelector(this.config.targetElement);
            if (!targetElement) {
                throw new Error(`Target element not found: ${this.config.targetElement}`);
            }
            
            // Preload background images for better performance
            await this.preloadImages();
            
            // Set up CSS transitions
            this.setupCSSTransitions();
            
            this.state.isInitialized = true;
            console.log('✅ Weather Background System initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize background system:', error);
            this.handleError('Background system initialization failed', error);
            
            // Even if initialization fails, mark as initialized so the system can attempt to work
            // with fallback mechanisms
            this.state.isInitialized = true;
        }
    },

    /**
     * Main function to update background based on weather data
     * @param {Object} weatherData - Current weather data from API
     */
    updateWeatherBackground(weatherData) {
        if (!this.state.isInitialized) {
            console.warn('⚠️ Background system not initialized, skipping update');
            return;
        }

        // Validate weather data
        if (!this.validateWeatherData(weatherData)) {
            console.warn('⚠️ Invalid weather data received, using fallback');
            this.applyFallbackBackground();
            return;
        }

        try {
            console.log('🎨 Updating background for weather:', weatherData.condition, weatherData.temp + '°C');
            
            // Analyze weather condition and get background type
            const backgroundType = this.analyzeWeatherCondition(weatherData);
            
            // Apply background image if it's different from current
            if (this.state.currentBackground !== backgroundType) {
                this.applyBackgroundImage(backgroundType);
                this.state.currentBackground = backgroundType;
                console.log(`✅ Background updated to: ${backgroundType}`);
            } else {
                console.log('🔄 Background already matches weather condition');
            }
            
        } catch (error) {
            console.error('❌ Error updating weather background:', error);
            this.handleError('Failed to update background', error);
        }
    },

    /**
     * Analyze weather condition and return background type
     * @param {Object} weatherData - Weather data object
     * @returns {string} - 'hot' or 'cool'
     */
    analyzeWeatherCondition(weatherData) {
        try {
            const { condition, temp, isNight } = weatherData;
            
            // Validate required data
            if (typeof condition !== 'string' && typeof temp !== 'number') {
                console.warn('⚠️ Missing both condition and temperature data, defaulting to cool');
                return 'cool';
            }
            
            // Night time always uses cool background
            if (isNight) {
                console.log('🌙 Night time detected, using cool background');
                return 'cool';
            }
            
            // Check weather condition first
            if (typeof condition === 'string') {
                switch (condition.toLowerCase()) {
                    case 'clear':
                        // Clear sky - check temperature if available
                        if (typeof temp === 'number' && temp > this.config.temperatureThreshold) {
                            console.log('☀️ Clear and hot weather detected');
                            return 'hot';
                        } else {
                            console.log('🌤️ Clear but cool weather detected');
                            return 'cool';
                        }
                        
                    case 'clouds':
                    case 'rain':
                    case 'drizzle':
                    case 'thunderstorm':
                    case 'snow':
                    case 'mist':
                    case 'fog':
                        console.log(`☁️ ${condition} weather detected, using cool background`);
                        return 'cool';
                        
                    default:
                        // Unknown condition - use temperature as fallback if available
                        if (typeof temp === 'number') {
                            console.log('❓ Unknown weather condition, using temperature threshold');
                            return temp > this.config.temperatureThreshold ? 'hot' : 'cool';
                        } else {
                            console.log('❓ Unknown weather condition and no temperature, defaulting to cool');
                            return 'cool';
                        }
                }
            } else if (typeof temp === 'number') {
                // Only temperature available
                console.log('🌡️ Only temperature available, using threshold');
                return temp > this.config.temperatureThreshold ? 'hot' : 'cool';
            } else {
                // No valid data
                console.warn('⚠️ No valid weather data available, defaulting to cool');
                return 'cool';
            }
            
        } catch (error) {
            console.error('❌ Error analyzing weather condition:', error);
            return 'cool'; // Safe fallback
        }
    },

    /**
     * Apply background image with smooth transition
     * @param {string} backgroundType - 'hot' or 'cool'
     */
    applyBackgroundImage(backgroundType) {
        const targetElement = document.querySelector(this.config.targetElement);
        
        if (!targetElement) {
            console.error('❌ Target element not found:', this.config.targetElement);
            this.handleError('Target element not found');
            return;
        }

        const imagePath = this.config.backgroundImages[backgroundType];
        
        if (!imagePath) {
            console.error('❌ Invalid background type:', backgroundType);
            this.handleError('Invalid background type');
            return;
        }

        // Check if this image failed to preload
        if (this.state.failedImages && this.state.failedImages.includes(imagePath)) {
            console.warn('⚠️ Image failed to preload, applying fallback:', imagePath);
            this.applyFallbackBackground();
            return;
        }

        try {
            // Test if image is accessible before applying
            this.testImageLoad(imagePath)
                .then(() => {
                    // Apply background image with CSS
                    targetElement.style.backgroundImage = `url('${imagePath}')`;
                    console.log(`🎨 Applied background: ${imagePath}`);
                })
                .catch((error) => {
                    console.warn('⚠️ Image load test failed, applying fallback:', error);
                    this.applyFallbackBackground();
                });
            
        } catch (error) {
            console.error('❌ Error applying background image:', error);
            this.handleError('Failed to apply background image', error);
        }
    },

    /**
     * Preload background images for better performance
     */
    async preloadImages() {
        console.log('📥 Preloading background images...');
        
        const imagePromises = Object.values(this.config.backgroundImages).map(imagePath => {
            return new Promise((resolve) => {
                const img = new Image();
                
                img.onload = () => {
                    console.log(`✅ Preloaded: ${imagePath}`);
                    resolve({ success: true, path: imagePath });
                };
                
                img.onerror = () => {
                    console.warn(`⚠️ Failed to preload: ${imagePath}`);
                    resolve({ success: false, path: imagePath });
                };
                
                // Set timeout for image loading
                setTimeout(() => {
                    console.warn(`⏰ Timeout loading image: ${imagePath}`);
                    resolve({ success: false, path: imagePath });
                }, 5000); // 5 second timeout
                
                img.src = imagePath;
            });
        });

        try {
            const results = await Promise.all(imagePromises);
            const failedImages = results.filter(result => !result.success);
            
            if (failedImages.length > 0) {
                console.warn(`⚠️ ${failedImages.length} images failed to preload:`, failedImages.map(r => r.path));
                // Store failed images for fallback handling
                this.state.failedImages = failedImages.map(r => r.path);
            }
            
            this.state.imagesPreloaded = true;
            console.log('✅ Image preloading completed');
            
        } catch (error) {
            console.error('❌ Critical error during image preloading:', error);
            this.state.imagesPreloaded = true; // Continue even if preloading fails
            this.state.failedImages = Object.values(this.config.backgroundImages);
        }
    },

    /**
     * Set up CSS transitions for smooth background changes
     */
    setupCSSTransitions() {
        try {
            const targetElement = document.querySelector(this.config.targetElement);
            
            if (!targetElement) {
                throw new Error(`Target element not found for CSS setup: ${this.config.targetElement}`);
            }

            // Apply CSS properties for background and transitions
            const cssProperties = {
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat',
                'background-attachment': 'fixed',
                'transition': `background-image ${this.config.transitionDuration / 1000}s ease-in-out`
            };

            Object.entries(cssProperties).forEach(([property, value]) => {
                targetElement.style.setProperty(property, value);
            });

            console.log('✅ CSS transitions configured');
            
        } catch (error) {
            console.error('❌ Error setting up CSS transitions:', error);
            this.handleError('Failed to setup CSS transitions', error);
        }
    },

    /**
     * Handle errors gracefully with fallback
     * @param {string} message - Error message
     * @param {Error} error - Optional error object
     */
    handleError(message, error = null) {
        this.state.errorCount++;
        this.state.lastError = { message, error, timestamp: new Date().toISOString() };
        
        console.error('🚨 Weather Background Error:', message);
        if (error) {
            console.error('🚨 Error details:', error);
        }
        
        // Apply fallback background
        this.applyFallbackBackground();
        
        // If too many errors, disable the system temporarily
        if (this.state.errorCount > 5) {
            console.warn('⚠️ Too many errors, temporarily disabling background system');
            this.state.isInitialized = false;
            
            // Re-enable after 30 seconds
            setTimeout(() => {
                console.log('🔄 Re-enabling background system after error cooldown');
                this.state.isInitialized = true;
                this.state.errorCount = 0;
            }, 30000);
        }
    },

    /**
     * Apply fallback white background
     */
    applyFallbackBackground() {
        try {
            const targetElement = document.querySelector(this.config.targetElement);
            if (targetElement) {
                targetElement.style.backgroundImage = 'none';
                targetElement.style.backgroundColor = '#ffffff';
                this.state.currentBackground = 'fallback';
                console.log('🔧 Applied fallback white background');
            }
        } catch (error) {
            console.error('❌ Critical error: Cannot apply fallback background:', error);
        }
    },

    /**
     * Validate weather data structure
     * @param {Object} weatherData - Weather data to validate
     * @returns {boolean} - True if data is valid
     */
    validateWeatherData(weatherData) {
        if (!weatherData || typeof weatherData !== 'object') {
            console.warn('⚠️ Weather data is null, undefined, or not an object');
            return false;
        }

        // Check if we have at least condition or temperature
        const hasCondition = typeof weatherData.condition === 'string' && weatherData.condition.trim() !== '';
        const hasTemperature = typeof weatherData.temp === 'number' && !isNaN(weatherData.temp);

        if (!hasCondition && !hasTemperature) {
            console.warn('⚠️ Weather data missing both condition and temperature');
            return false;
        }

        return true;
    },

    /**
     * Test if an image can be loaded
     * @param {string} imagePath - Path to image
     * @returns {Promise} - Resolves if image loads, rejects if it fails
     */
    testImageLoad(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'));
            }, 3000); // 3 second timeout
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Image failed to load'));
            };
            
            img.src = imagePath;
        });
    },

    /**
     * Reset background to default state
     */
    resetBackground() {
        try {
            const targetElement = document.querySelector(this.config.targetElement);
            if (targetElement) {
                targetElement.style.backgroundImage = 'none';
                targetElement.style.backgroundColor = '';
                this.state.currentBackground = null;
                console.log('🔄 Background reset to default');
            }
        } catch (error) {
            console.error('❌ Error resetting background:', error);
        }
    },

    /**
     * Check system health and return status
     * @returns {Object} - Health status object
     */
    getHealthStatus() {
        const targetElement = document.querySelector(this.config.targetElement);
        
        return {
            isInitialized: this.state.isInitialized,
            imagesPreloaded: this.state.imagesPreloaded,
            targetElementExists: !!targetElement,
            errorCount: this.state.errorCount,
            lastError: this.state.lastError,
            failedImages: this.state.failedImages || [],
            currentBackground: this.state.currentBackground,
            isHealthy: this.state.isInitialized && this.state.errorCount < 5 && !!targetElement
        };
    },

    /**
     * Get current background state (for debugging)
     */
    getState() {
        return {
            ...this.state,
            config: this.config,
            health: this.getHealthStatus()
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherBackground;
}