/**
 * Weather Background Tests - Testing functionality for weather background system
 */

// Test weather background functionality
function testWeatherBackground() {
    console.log('🧪 Testing Weather Background System...');
    
    // Test different weather conditions
    const testConditions = [
        { condition: 'Clear', isNight: false, description: 'clear sky' },
        { condition: 'Clear', isNight: true, description: 'clear sky' },
        { condition: 'Clouds', isNight: false, description: 'few clouds' },
        { condition: 'Rain', isNight: false, description: 'light rain' },
        { condition: 'Thunderstorm', isNight: false, description: 'thunderstorm' },
        { condition: 'Snow', isNight: false, description: 'light snow' },
        { condition: 'Mist', isNight: false, description: 'mist' }
    ];
    
    testConditions.forEach((test, index) => {
        setTimeout(() => {
            console.log(`Testing condition ${index + 1}: ${test.condition} (${test.isNight ? 'Night' : 'Day'})`);
            
            // Simulate weather data
            const mockWeatherData = {
                condition: test.condition,
                isNight: test.isNight,
                description: test.description,
                temp: 25,
                location: 'Test Location'
            };
            
            // Test background update
            if (typeof updateSimpleBackground === 'function') {
                updateSimpleBackground(mockWeatherData);
                console.log(`✅ Background updated for ${test.condition}`);
            } else {
                console.warn('⚠️ updateSimpleBackground function not found');
            }
            
        }, index * 2000); // 2 second delay between tests
    });
}

// Test background image loading
function testBackgroundImages() {
    console.log('🖼️ Testing Background Images...');
    
    const testImages = [
        'img/assets/clear-day.jpg',
        'img/assets/clear-night.jpg',
        'img/assets/clouds.jpg',
        'img/assets/rain.jpg',
        'img/assets/storm.jpg'
    ];
    
    testImages.forEach((imagePath, index) => {
        const img = new Image();
        img.onload = () => {
            console.log(`✅ Image loaded: ${imagePath}`);
        };
        img.onerror = () => {
            console.error(`❌ Failed to load: ${imagePath}`);
        };
        img.src = imagePath;
    });
}

// Test crossfade functionality
function testCrossfade() {
    console.log('🔄 Testing Crossfade Functionality...');
    
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
        console.error('❌ Hero section not found');
        return;
    }
    
    // Test crossfade between different backgrounds
    const testBackgrounds = [
        'linear-gradient(135deg, #87CEEB 0%, #98D8E8 100%)', // Clear day
        'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)', // Clear night
        'linear-gradient(135deg, #BDC3C7 0%, #95A5A6 100%)', // Cloudy
        'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)'  // Rainy
    ];
    
    testBackgrounds.forEach((bg, index) => {
        setTimeout(() => {
            heroSection.style.background = bg;
            console.log(`🎨 Applied background ${index + 1}: ${bg.substring(0, 30)}...`);
        }, index * 1500);
    });
}

// Performance test
function testPerformance() {
    console.log('⚡ Testing Performance...');
    
    const startTime = performance.now();
    
    // Simulate multiple rapid background changes
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const mockData = {
                condition: i % 2 === 0 ? 'Clear' : 'Clouds',
                isNight: i % 3 === 0,
                description: 'test condition'
            };
            
            if (typeof updateSimpleBackground === 'function') {
                updateSimpleBackground(mockData);
            }
            
            if (i === 9) {
                const endTime = performance.now();
                console.log(`⚡ Performance test completed in ${(endTime - startTime).toFixed(2)}ms`);
            }
        }, i * 100);
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Weather Background Tests...');
    
    testBackgroundImages();
    
    setTimeout(() => {
        testWeatherBackground();
    }, 1000);
    
    setTimeout(() => {
        testCrossfade();
    }, 15000);
    
    setTimeout(() => {
        testPerformance();
    }, 25000);
    
    console.log('✅ All tests scheduled. Check console for results.');
}

// Auto-run tests if in development mode
if (typeof CONFIG !== 'undefined' && CONFIG.apiKey === 'DEMO_MODE') {
    console.log('🧪 Development mode detected. Weather background tests available.');
    console.log('Run runAllTests() to start testing.');
}

// Export functions for manual testing
window.weatherBackgroundTests = {
    runAllTests,
    testWeatherBackground,
    testBackgroundImages,
    testCrossfade,
    testPerformance
};