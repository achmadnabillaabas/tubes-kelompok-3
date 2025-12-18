/**
 * Map Module - Inisialisasi peta Leaflet
 */

// Check if Leaflet is loaded
if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded yet');
}

const WeatherMap = {
    map: null,
    marker: null,
    currentLat: CONFIG.defaultLat,
    currentLon: CONFIG.defaultLon,

    /**
     * Initialize Leaflet map
     */
    initMap(lat, lon) {
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

                // Add marker
                this.marker = L.marker([lat, lon]).addTo(this.map);
                this.marker.bindPopup('Lokasi Anda').openPopup();
            } else {
                // Update existing map
                this.map.setView([lat, lon], 10);
                this.marker.setLatLng([lat, lon]);
                this.marker.bindPopup('Lokasi Anda').openPopup();
            }

            // Map initialized successfully
            console.log('Map initialized for location display');
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    },



    /**
     * Center map to current location
     */
    centerToLocation(lat, lon) {
        if (this.map) {
            this.currentLat = lat;
            this.currentLon = lon;
            this.map.setView([lat, lon], 10);
            this.marker.setLatLng([lat, lon]);
            this.marker.bindPopup('Lokasi Anda').openPopup();
        }
    },

    /**
     * Add custom marker with weather info
     */
    addWeatherMarker(lat, lon, weatherData) {
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        // Create custom icon
        const customIcon = L.divIcon({
            className: 'custom-weather-marker',
            html: `
                <div style="
                    background: white;
                    padding: 8px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    text-align: center;
                    font-family: 'Poppins', sans-serif;
                ">
                    <img src="${weatherData.iconUrl}" style="width: 40px; height: 40px;">
                    <div style="font-weight: bold; color: #214177;">${weatherData.temp}°C</div>
                </div>
            `,
            iconSize: [80, 80],
            iconAnchor: [40, 40]
        });

        this.marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
        
        const popupContent = `
            <div style="font-family: 'Poppins', sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #214177;">${weatherData.location}</h3>
                <p style="margin: 4px 0;"><strong>Suhu:</strong> ${weatherData.temp}°C</p>
                <p style="margin: 4px 0;"><strong>Kondisi:</strong> ${weatherData.description}</p>
                <p style="margin: 4px 0;"><strong>Kelembapan:</strong> ${weatherData.humidity}%</p>
                <p style="margin: 4px 0;"><strong>Angin:</strong> ${weatherData.windSpeed} m/s</p>
            </div>
        `;
        
        this.marker.bindPopup(popupContent).openPopup();
    }
};

// Add custom CSS for map markers
const mapStyle = document.createElement('style');
mapStyle.textContent = `
    .custom-weather-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .leaflet-popup-content {
        margin: 12px;
        font-size: 14px;
    }
`;
document.head.appendChild(mapStyle);
