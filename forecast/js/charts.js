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
     * Initialize hourly chart
     */
    initHourlyChart(hourlyData) {
        const ctx = document.getElementById('hourlyChartCanvas');
        if (!ctx) return;

        // Destroy existing chart
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }

        const labels = hourlyData.map(h => h.time);
        const temps = hourlyData.map(h => h.temp);
        const pops = hourlyData.map(h => h.pop);

        this.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Suhu (°C)',
                        data: temps,
                        borderColor: '#3667A6',
                        backgroundColor: 'rgba(54, 103, 166, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Probabilitas Hujan (%)',
                        data: pops,
                        borderColor: '#82A6CB',
                        backgroundColor: 'rgba(130, 166, 203, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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
                        borderColor: '#3667A6',
                        borderWidth: 1
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
                            color: '#3667A6',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(54, 103, 166, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Hujan (%)',
                            color: '#82A6CB',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        min: 0,
                        max: 100
                    },
                    x: {
                        grid: {
                            color: 'rgba(189, 216, 241, 0.3)'
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
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        fill: false,
                        tension: 0.4,
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
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: false,
                        tension: 0.4,
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
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Kelembapan (%)',
                        data: humidity,
                        backgroundColor: 'rgba(130, 166, 203, 0.7)',
                        borderColor: '#82A6CB',
                        borderWidth: 2,
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(54, 103, 166, 0.8)'
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
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart',
                    delay: (context) => {
                        let delay = 0;
                        if (context.type === 'data' && context.mode === 'default') {
                            delay = context.dataIndex * 100;
                        }
                        return delay;
                    }
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
            this.initHourlyChart(hourlyData);
            this.initTempTrendChart(dailyData);
            this.initHumidityTrendChart(dailyData);
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }
};
