/**
 * Simple Map Module - Peta sederhana untuk menampilkan lokasi
 */

const WeatherMap = {
    map: null,
    marker: null,
    currentLat: CONFIG.defaultLat,
    currentLon: CONFIG.defaultLon,

    /**
     * Initialize simple map
     */
    initMap(lat, lon) {
        console.log('🗺️ Initializing simple map...');
        
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.warn('Leaflet not available, skipping map');
            return;
        }
        
        try {
            this.currentLat = lat;
            this.currentLon = lon;

            // Create map if not exists
            if (!this.map) {
                this.map = L.map('weatherMap').setView([lat, lon], 10);

                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 18
                }).addTo(this.map);

                console.log('✅ Map tiles loaded');
            }

            // Add or update marker
            this.updateMarker(lat, lon);
            
            console.log('✅ Map initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing map:', error);
        }
    },

    /**
     * Update marker position
     */
    updateMarker(lat, lon, locationName = 'Lokasi Anda') {
        // Remove existing marker
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        // Add new marker
        this.marker = L.marker([lat, lon]).addTo(this.map);
        this.marker.bindPopup(`📍 ${locationName}`).openPopup();
        
        // Center map to new location
        this.map.setView([lat, lon], 10);
        
        console.log(`✅ Marker updated to: ${locationName} (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    },

    /**
     * Update map with new location
     */
    updateLocation(lat, lon, locationName = 'Lokasi Baru') {
        console.log(`🗺️ Updating map location: ${locationName}`);
        
        if (!this.map) {
            this.initMap(lat, lon);
        } else {
            this.updateMarker(lat, lon, locationName);
        }
        
        this.currentLat = lat;
        this.currentLon = lon;
    },

    /**
     * Center map to current location
     */
    centerToLocation(lat, lon) {
        if (this.map) {
            this.map.setView([lat, lon], 10);
            console.log('✅ Map centered to location');
        }
    }
};

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof L !== 'undefined') {
            console.log('🗺️ Starting map initialization...');
            
            // Use current location if available
            if (window.currentLocation) {
                WeatherMap.initMap(window.currentLocation.lat, window.currentLocation.lon);
            } else {
                WeatherMap.initMap(CONFIG.defaultLat, CONFIG.defaultLon);
            }
            
            // Setup center map button
            const centerMapBtn = document.getElementById('centerMapBtn');
            if (centerMapBtn) {
                centerMapBtn.addEventListener('click', () => {
                    console.log('🎯 Center map button clicked');
                    
                    if (window.currentLocation) {
                        WeatherMap.centerToLocation(window.currentLocation.lat, window.currentLocation.lon);
                    } else {
                        WeatherMap.centerToLocation(CONFIG.defaultLat, CONFIG.defaultLon);
                    }
                });
                console.log('✅ Center map button ready');
            }
        } else {
            console.warn('⚠️ Leaflet not available');
        }
    }, 1500); // Wait a bit longer for everything to load
});

// Global function to update map when location changes
window.updateMapLocation = (lat, lon, locationName) => {
    console.log(`🗺️ Global map update: ${locationName} (${lat}, ${lon})`);
    
    if (WeatherMap) {
        WeatherMap.updateLocation(lat, lon, locationName);
    } else {
        console.warn('⚠️ WeatherMap not available');
    }
};

// Also update when weather data is loaded
window.addEventListener('weatherDataLoaded', (event) => {
    const { lat, lon, locationName } = event.detail;
    console.log('🗺️ Weather data loaded event received');
    
    if (WeatherMap) {
        WeatherMap.updateLocation(lat, lon, locationName);
    }
});

// Debug function to test map
window.testMap = () => {
    console.log('🧪 Testing map functionality...');
    console.log('Leaflet available:', typeof L !== 'undefined');
    console.log('WeatherMap object:', WeatherMap);
    console.log('Map element:', document.getElementById('weatherMap'));
    
    if (WeatherMap && !WeatherMap.map) {
        console.log('🔧 Initializing map manually...');
        WeatherMap.initMap(CONFIG.defaultLat, CONFIG.defaultLon);
    }
    
    if (WeatherMap && WeatherMap.map) {
        console.log('✅ Map is working!');
        WeatherMap.updateLocation(-6.2088, 106.8456, 'Jakarta, Indonesia');
    } else {
        console.log('❌ Map not working');
    }
};