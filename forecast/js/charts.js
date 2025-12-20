/**
 * Charts Module - Inisialisasi dan update Chart.js
 */

// Check if Chart.js is loaded
if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded yet');
}

const WeatherCharts = {
    hourlyChart: null,
    tempTrendChart: null,
    humidityTrendChart: null,

    /**
     * Check if dark mode is active
     */
    isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ||
               document.body.getAttribute('data-theme') === 'dark' ||
               document.querySelector('[data-theme="dark"]') !== null;
    },

    /**
     * Get theme-appropriate colors
     */
    getThemeColors() {
        const isDark = this.isDarkMode();
        
        if (isDark) {
            return {
                // Dark mode colors
                primary: '#60a5fa',      // Lighter blue
                secondary: '#22d3ee',    // Lighter cyan  
                success: '#34d399',      // Lighter green
                text: '#f1f5f9',         // Light text
                textSecondary: '#cbd5e1', // Secondary light text
                grid: 'rgba(148, 163, 184, 0.2)', // Light grid
                tooltip: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    text: '#f1f5f9',
                    border: '#475569'
                },
                legend: '#e2e8f0',
                pointBorder: '#1e293b'
            };
        } else {
            return {
                // Light mode colors
                primary: '#3b82f6',      // Blue
                secondary: '#06b6d4',    // Cyan
                success: '#10b981',      // Green
                text: '#374151',         // Dark text
                textSecondary: '#6b7280', // Secondary dark text
                grid: 'rgba(156, 163, 175, 0.2)', // Dark grid
                tooltip: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    text: '#374151',
                    border: '#e5e7eb'
                },
                legend: '#374151',
                pointBorder: '#ffffff'
            };
        }
    },

    /**
     * Initialize hourly chart for 24-hour forecast
     */
    initHourlyChart(hourlyData) {
        const ctx = document.getElementById('hourlyChartCanvas');
        if (!ctx) {
            console.warn('Hourly chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }

        // Get theme colors
        const colors = this.getThemeColors();

        // Prepare data for 24 hours
        const labels = hourlyData.map(h => h.time);
        const temps = hourlyData.map(h => h.temp);
        const pops = hourlyData.map(h => h.pop);
        const humidity = hourlyData.map(h => h.humidity);

        console.log(`📊 Creating hourly chart with ${hourlyData.length} data points (${this.isDarkMode() ? 'dark' : 'light'} mode)`);

        this.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Suhu (°C)',
                        data: temps,
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: colors.pointBorder,
                        pointBorderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Probabilitas Hujan (%)',
                        data: pops,
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.secondary,
                        pointBorderColor: colors.pointBorder,
                        pointBorderWidth: 2,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Kelembapan (%)',
                        data: humidity,
                        borderColor: colors.success,
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.success,
                        pointBorderColor: colors.pointBorder,
                        pointBorderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: colors.legend
                        }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltip.background,
                        titleColor: colors.tooltip.text,
                        bodyColor: colors.tooltip.text,
                        borderColor: colors.tooltip.border,
                        borderWidth: 1,
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return `Jam ${context[0].label}`;
                            },
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                if (label.includes('Suhu')) {
                                    return `${label}: ${value}°C`;
                                } else {
                                    return `${label}: ${value}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Suhu (°C)',
                            color: colors.primary,
                            font: {
                                weight: 'bold',
                                size: 12
                            }
                        },
                        grid: {
                            color: colors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Persentase (%)',
                            color: colors.secondary,
                            font: {
                                weight: 'bold',
                                size: 12
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: colors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textSecondary,
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            callback: function(value, index) {
                                // Show every 2nd hour to avoid crowding
                                return index % 2 === 0 ? this.getLabelForValue(value) : '';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('✅ Hourly chart created successfully');
    },

    /**
     * Initialize temperature trend chart
     */
    initTempTrendChart(dailyData) {
        const ctx = document.getElementById('tempTrendChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.tempTrendChart) {
            this.tempTrendChart.destroy();
        }

        const labels = dailyData.map(d => d.dateStr);
        const maxTemps = dailyData.map(d => d.maxTemp);
        const minTemps = dailyData.map(d => d.minTemp);

        this.tempTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Suhu Maksimum',
                        data: maxTemps,
                        borderColor: '#F44336',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#F44336',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Suhu Minimum',
                        data: minTemps,
                        borderColor: '#2196F3',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#2196F3',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(33, 65, 119, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}°C`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Suhu (°C)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(189, 216, 241, 0.3)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(189, 216, 241, 0.2)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    },

    /**
     * Initialize humidity trend chart
     */
    initHumidityTrendChart(dailyData) {
        const ctx = document.getElementById('humidityTrendChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.humidityTrendChart) {
            this.humidityTrendChart.destroy();
        }

        const labels = dailyData.map(d => d.dateStr);
        const humidity = dailyData.map(d => d.humidity);

        this.humidityTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Kelembapan (%)',
                        data: humidity,
                        borderColor: '#82A6CB',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#82A6CB',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(33, 65, 119, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `Kelembapan: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Kelembapan (%)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(189, 216, 241, 0.3)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(189, 216, 241, 0.2)'
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    },

    /**
     * Update all charts with new data
     */
    updateCharts(hourlyData, dailyData) {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, skipping charts');
            return;
        }
        
        try {
            // Update hourly chart (for 24-hour forecast)
            if (hourlyData && hourlyData.length > 0) {
                const hourlyData24 = hourlyData.slice(0, 24);
                this.initHourlyChart(hourlyData24);
                console.log('✅ Hourly chart updated');
            }
            
            // Update trend charts (for analytics section)
            if (dailyData && dailyData.length > 0) {
                this.initTempTrendChart(dailyData);
                this.initHumidityTrendChart(dailyData);
                console.log('✅ Trend charts updated');
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    },

    /**
     * Force refresh hourly chart
     */
    refreshHourlyChart() {
        if (WeatherUI.currentForecastData && WeatherUI.currentForecastData.hourly) {
            const hourlyData24 = WeatherUI.currentForecastData.hourly.slice(0, 24);
            this.initHourlyChart(hourlyData24);
            console.log('🔄 Hourly chart refreshed');
        }
    },

    /**
     * Refresh all charts when theme changes
     */
    refreshChartsForTheme() {
        console.log('🎨 Refreshing charts for theme change');
        
        try {
            // Refresh hourly chart
            this.refreshHourlyChart();
            
            // Refresh trend charts if they exist
            if (WeatherUI.currentForecastData && WeatherUI.currentForecastData.daily) {
                this.initTempTrendChart(WeatherUI.currentForecastData.daily);
                this.initHumidityTrendChart(WeatherUI.currentForecastData.daily);
            }
            
            console.log('✅ All charts refreshed for theme');
        } catch (error) {
            console.error('❌ Error refreshing charts for theme:', error);
        }
    }
};
// Theme change detection and chart refresh
document.addEventListener('DOMContentLoaded', () => {
    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                console.log('🎨 Theme change detected, refreshing charts...');
                
                // Small delay to ensure theme styles are applied
                setTimeout(() => {
                    WeatherCharts.refreshChartsForTheme();
                }, 100);
            }
        });
    });

    // Start observing theme changes on document element
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    console.log('✅ Chart theme observer initialized');
});

// Also listen for manual theme toggle events
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'themeToggle') {
        // Delay chart refresh to allow theme transition
        setTimeout(() => {
            console.log('🎨 Manual theme toggle detected, refreshing charts...');
            WeatherCharts.refreshChartsForTheme();
        }, 200);
    }
});

// Debug function to test theme switching
window.testChartTheme = () => {
    console.log('🧪 Testing chart theme switching...');
    console.log('Current theme:', WeatherCharts.isDarkMode() ? 'dark' : 'light');
    
    // Toggle theme
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.click();
        
        setTimeout(() => {
            console.log('New theme:', WeatherCharts.isDarkMode() ? 'dark' : 'light');
            console.log('Chart should have refreshed with new colors');
        }, 300);
    } else {
        console.warn('Theme toggle button not found');
    }
};