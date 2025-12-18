// script.js

let selectedDayIndex = 0; // Default to today (index 0)

// Hide loading screen when page is ready
window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    setTimeout(function () {
      loadingScreen.classList.add("hidden");
      setTimeout(function () {
        loadingScreen.style.display = "none";
      }, 500);
    }, 300);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Hide loading screen if data is already loaded
  if (window.weatherData) {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      setTimeout(function () {
        loadingScreen.classList.add("hidden");
        setTimeout(function () {
          loadingScreen.style.display = "none";
        }, 500);
      }, 100);
    }
  }

  // Auto-detect location (only on first load without params)
  if (
    navigator.geolocation &&
    !window.location.search.includes("city=") &&
    !window.location.search.includes("lat=")
  ) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Use AJAX instead of page reload
        if (typeof loadWeatherForCoordinates === 'function') {
          loadWeatherForCoordinates(lat, lon);
        } else {
          // Fallback to page reload if function not available
          window.location.href = `index.php?lat=${lat}&lon=${lon}`;
        }
      },
      function (error) {
        console.log("Error geolokasi:", error);
        // Use default location (already set in PHP)
        // Hide loading screen
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) {
          setTimeout(function () {
            loadingScreen.classList.add("hidden");
          }, 500);
        }
      }
    );
  } else {
    // Hide loading screen if no geolocation needed
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      setTimeout(function () {
        loadingScreen.classList.add("hidden");
      }, 500);
    }
  }

  // Note: Use Location Button handler is now in weather-loader.js
  // This prevents duplicate event listeners

  // Initialize with default day (today)
  if (
    window.weatherData &&
    window.weatherData.forecast &&
    window.weatherData.forecast.length > 0
  ) {
    updateHourlyChart(selectedDayIndex);
    updateStatistics(selectedDayIndex);
    
    // Update background based on weather condition
    if (typeof updateWeatherBackground === "function") {
      updateWeatherBackground(window.weatherData);
    }
  } else {
    // Fallback: use initial hourly data if forecast not available
    if (window.weatherData && window.weatherData.hourly) {
      drawHourlyChart(window.weatherData.hourly);
      if (typeof updateHourlyAnalytics === "function") {
        updateHourlyAnalytics(window.weatherData.hourly);
      }
      
      // Update background based on weather condition
      if (typeof updateWeatherBackground === "function") {
        updateWeatherBackground(window.weatherData);
      }
    }
  }

  // Forecast day item interactions
  const forecastItems = document.querySelectorAll(".forecast-day-item");
  forecastItems.forEach((item, index) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Remove active class from all items
      forecastItems.forEach((i) => i.classList.remove("active"));
      // Add active class to clicked item
      this.classList.add("active");

      // Update selected day
      selectedDayIndex = index;

      // Update hourly chart and statistics
      updateHourlyChart(selectedDayIndex);
      updateStatistics(selectedDayIndex);

      // Show modal with day details
      showDayDetailModal(selectedDayIndex);
    });
  });

  // Modal functionality - Day Detail Modal
  const dayDetailModal = document.getElementById("dayDetailModal");
  if (dayDetailModal) {
    const closeBtn = dayDetailModal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dayDetailModal.classList.remove("show");
      });
    }
    dayDetailModal.addEventListener("click", function (event) {
      if (event.target === dayDetailModal) {
        dayDetailModal.classList.remove("show");
      }
    });
  }

  // Close modal with ESC key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const dayModal = document.getElementById("dayDetailModal");
      const todayModal = document.getElementById("todayDetailsModal");
      const summaryModal = document.getElementById("hourlySummaryModal");
      const detailsModal = document.getElementById("hourlyDetailsModal");

      if (dayModal && dayModal.classList.contains("show")) {
        dayModal.classList.remove("show");
      }
      if (todayModal && todayModal.classList.contains("show")) {
        todayModal.classList.remove("show");
      }
      if (summaryModal && summaryModal.classList.contains("show")) {
        summaryModal.classList.remove("show");
      }
      if (detailsModal && detailsModal.classList.contains("show")) {
        detailsModal.classList.remove("show");
      }
    }
  });

  // Summary and Details buttons
  const summaryBtn = document.getElementById("summaryBtn");
  const detailsBtn = document.getElementById("detailsBtn");

  if (summaryBtn) {
    summaryBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add("active");
      if (detailsBtn) detailsBtn.classList.remove("active");
      if (typeof showHourlySummary === "function") {
        showHourlySummary();
      }
    });
  }

  if (detailsBtn) {
    detailsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add("active");
      if (summaryBtn) summaryBtn.classList.remove("active");
      if (typeof showHourlyDetails === "function") {
        showHourlyDetails();
      }
    });
  }

  // Hourly Modal close handlers
  const hourlySummaryModal = document.getElementById("hourlySummaryModal");
  const hourlyDetailsModal = document.getElementById("hourlyDetailsModal");

  if (hourlySummaryModal) {
    const closeBtn = hourlySummaryModal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        hourlySummaryModal.classList.remove("show");
      });
    }
    hourlySummaryModal.addEventListener("click", function (event) {
      if (event.target === hourlySummaryModal) {
        hourlySummaryModal.classList.remove("show");
      }
    });
  }

  if (hourlyDetailsModal) {
    const closeBtn = hourlyDetailsModal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        hourlyDetailsModal.classList.remove("show");
      });
    }
    hourlyDetailsModal.addEventListener("click", function (event) {
      if (event.target === hourlyDetailsModal) {
        hourlyDetailsModal.classList.remove("show");
      }
    });
  }

  // Detail boxes hover effects
  const detailBoxes = document.querySelectorAll(".detail-box");
  detailBoxes.forEach((box) => {
    box.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px) scale(1.05)";
    });
    box.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Today's Details cards click events
  const todayDetailCards = document.querySelectorAll(".today-detail-card");
  todayDetailCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const detailType = this.getAttribute("data-detail-type");
      if (detailType && typeof showTodayDetailModal === "function") {
        showTodayDetailModal(detailType);
      }
    });
  });

  // Today's Details Modal close handler
  const todayDetailsModal = document.getElementById("todayDetailsModal");
  if (todayDetailsModal) {
    const closeBtn = todayDetailsModal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        todayDetailsModal.classList.remove("show");
      });
    }
    todayDetailsModal.addEventListener("click", function (event) {
      if (event.target === todayDetailsModal) {
        todayDetailsModal.classList.remove("show");
      }
    });
  }

  // Statistics cards interactions
  const statCards = document.querySelectorAll(".stat-card");
  statCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Add pulse animation
      this.style.animation = "pulse 0.5s ease";
      setTimeout(() => {
        this.style.animation = "";
      }, 500);
    });
  });

  // Handle window resize for chart
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      if (window.weatherData && window.weatherData.forecast) {
        updateHourlyChart(selectedDayIndex);
      }
    }, 250);
  });
});

function updateHourlyChart(dayIndex) {
  if (
    !window.weatherData ||
    !window.weatherData.forecast ||
    !window.weatherData.forecast[dayIndex]
  ) {
    return;
  }

  const dayData = window.weatherData.forecast[dayIndex];
  let hourlyData = dayData.hourly || [];

  // If it's today (index 0), filter from current time
  if (dayIndex === 0) {
    // Use location's local time if available, otherwise use browser time
    let currentTime;
    if (window.weatherData.location && window.weatherData.location.localtime) {
      const localTime = new Date(window.weatherData.location.localtime);
      currentTime =
        localTime.getHours().toString().padStart(2, "0") +
        ":" +
        localTime.getMinutes().toString().padStart(2, "0");
    } else {
      const now = new Date();
      currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");
    }

    hourlyData = hourlyData.filter((hour) => hour.time >= currentTime);

    // If not enough hours for today, get from tomorrow
    if (hourlyData.length < 24 && window.weatherData.forecast[1]) {
      const remainingHours = 24 - hourlyData.length;
      const tomorrowHours = window.weatherData.forecast[1].hourly.slice(
        0,
        remainingHours
      );
      hourlyData = hourlyData.concat(tomorrowHours);
    }

    // Limit to 24 hours
    hourlyData = hourlyData.slice(0, 24);
  } else {
    // For other days, show all 24 hours
    hourlyData = hourlyData.slice(0, 24);
  }

  // Update chart
  drawHourlyChart(hourlyData);

  // Update hourly icons
  updateHourlyIcons(hourlyData);

  // Update hourly analytics
  updateHourlyAnalytics(hourlyData);
}

function updateHourlyIcons(hourlyData) {
  const hourlyIconsContainer = document.querySelector(".hourly-icons");
  if (!hourlyIconsContainer) return;

  // Clear existing icons
  hourlyIconsContainer.innerHTML = "";

  // Show first 12-24 hours
  const displayHours = hourlyData.slice(0, 24);

  displayHours.forEach((hour) => {
    const iconItem = document.createElement("div");
    iconItem.className = "hourly-icon-item";
    iconItem.innerHTML = `
            <img src="${hour.icon}" 
                 alt="${hour.condition}" 
                 class="hourly-icon-img"
                 onerror="this.style.display='none'">
            <span class="hourly-time">${hour.time}</span>
        `;
    hourlyIconsContainer.appendChild(iconItem);
  });
}

function updateStatistics(dayIndex) {
  if (!window.weatherData || !window.weatherData.forecast) {
    return;
  }

  const selectedDay = window.weatherData.forecast[dayIndex];
  if (!selectedDay) return;

  // Calculate statistics for selected day
  const dayMaxTemp = selectedDay.maxtemp_c;
  const dayMinTemp = selectedDay.mintemp_c;
  const dayAvgTemp =
    selectedDay.avgtemp_c || Math.round((dayMaxTemp + dayMinTemp) / 2);

  // Calculate averages from all forecast days
  const allMaxTemps = window.weatherData.forecast.map((d) => d.maxtemp_c);
  const allMinTemps = window.weatherData.forecast.map((d) => d.mintemp_c);
  const avgMaxTemp = Math.round(
    allMaxTemps.reduce((a, b) => a + b, 0) / allMaxTemps.length
  );
  const avgMinTemp = Math.round(
    allMinTemps.reduce((a, b) => a + b, 0) / allMinTemps.length
  );
  const maxTemp = Math.max(...allMaxTemps);
  const minTemp = Math.min(...allMinTemps);

  // Update statistics cards
  const statCards = document.querySelectorAll(".stat-card");
  if (statCards.length >= 4) {
    // Average High
    statCards[0].querySelector(".stat-value").textContent = avgMaxTemp + "°";
    // Average Low
    statCards[1].querySelector(".stat-value").textContent = avgMinTemp + "°";
    // Max Temp (from selected day)
    statCards[2].querySelector(".stat-value").textContent = dayMaxTemp + "°";
    // Min Temp (from selected day)
    statCards[3].querySelector(".stat-value").textContent = dayMinTemp + "°";
  }
}

function showDayDetailModal(dayIndex) {
  if (
    !window.weatherData ||
    !window.weatherData.forecast ||
    !window.weatherData.forecast[dayIndex]
  ) {
    return;
  }

  const dayData = window.weatherData.forecast[dayIndex];
  const modal = document.getElementById("dayDetailModal");
  const modalContent = document.getElementById("modalDayContent");

  if (!modal || !modalContent) return;

  // Format date
  const date = new Date(dayData.date);
  const dayName = dayData.dayName;
  const dayDate = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Build modal content
  modalContent.innerHTML = `
        <div class="modal-day-header">
            <div class="modal-day-title">${dayName}</div>
            <div class="modal-day-date">${dayDate}</div>
        </div>
        
        <div class="modal-day-main">
            <img src="${dayData.icon}" alt="${
    dayData.condition
  }" class="modal-day-icon">
            <div class="modal-day-temps">
                <div class="modal-day-temp-main">${dayData.maxtemp_c}° / ${
    dayData.mintemp_c
  }°</div>
                <div class="modal-day-condition">${dayData.condition}</div>
            </div>
        </div>

        <div class="modal-day-details">
            <div class="modal-detail-item">
                <div class="modal-detail-label">Suhu Rata-rata</div>
                <div class="modal-detail-value">${dayData.avgtemp_c}°C</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Kecepatan Angin Maksimal</div>
                <div class="modal-detail-value">${
                  dayData.maxwind_kph
                } km/h</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Total Curah Hujan</div>
                <div class="modal-detail-value">${
                  dayData.totalprecip_mm
                } mm</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Jarak Pandang Rata-rata</div>
                <div class="modal-detail-value">${dayData.avgvis_km} km</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Kelembaban Rata-rata</div>
                <div class="modal-detail-value">${dayData.avghumidity}%</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Kemungkinan Hujan</div>
                <div class="modal-detail-value">${
                  dayData.daily_chance_of_rain
                }%</div>
            </div>
            ${
              dayData.daily_chance_of_snow > 0
                ? `
            <div class="modal-detail-item">
                <div class="modal-detail-label">Kemungkinan Salju</div>
                <div class="modal-detail-value">${dayData.daily_chance_of_snow}%</div>
            </div>
            `
                : ""
            }
        </div>

        <div class="modal-hourly-section">
            <div class="modal-hourly-title">Prakiraan Per Jam</div>
            <div class="modal-hourly-list">
                ${dayData.hourly
                  .slice(0, 24)
                  .map(
                    (hour) => `
                    <div class="modal-hourly-item">
                        <div class="modal-hourly-time">${hour.time}</div>
                        <img src="${hour.icon}" alt="${hour.condition}" class="modal-hourly-icon" onerror="this.style.display='none'">
                        <div class="modal-hourly-temp">${hour.temp}°</div>
                        <div style="font-size: 10px; color: #b0b0b0; margin-top: 5px;">${hour.chance_of_rain}%</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  // Show modal
  modal.classList.add("show");
}

function drawHourlyChart(hourlyData) {
  const canvas = document.getElementById("hourlyChart");
  if (!canvas || !hourlyData || hourlyData.length === 0) return;

  // Set canvas size based on container
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.offsetWidth || 800;
    canvas.height = 200;
  }

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Get temperature range
  const temps = hourlyData.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;
  const tempPadding = tempRange * 0.2; // 20% padding

  // Draw grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Draw temperature line
  ctx.strokeStyle = "#4a9eff";
  ctx.lineWidth = 3;
  ctx.beginPath();

  hourlyData.forEach((hour, index) => {
    const x = padding + (chartWidth / (hourlyData.length - 1)) * index;
    const normalizedTemp =
      (hour.temp - minTemp + tempPadding) / (tempRange + tempPadding * 2);
    const y = padding + chartHeight - normalizedTemp * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw temperature points
  ctx.fillStyle = "#ffffff";
  hourlyData.forEach((hour, index) => {
    const x = padding + (chartWidth / (hourlyData.length - 1)) * index;
    const normalizedTemp =
      (hour.temp - minTemp + tempPadding) / (tempRange + tempPadding * 2);
    const y = padding + chartHeight - normalizedTemp * chartHeight;

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw temperature label
    ctx.fillStyle = "#e0e0e0";
    ctx.font = '12px "Segoe UI"';
    ctx.textAlign = "center";
    ctx.fillText(hour.temp + "°", x, y - 15);
    ctx.fillStyle = "#ffffff";
  });

  // Draw time labels on x-axis
  ctx.fillStyle = "#b0b0b0";
  ctx.font = '11px "Segoe UI"';
  ctx.textAlign = "center";
  const timeStep = Math.max(1, Math.floor(hourlyData.length / 6)); // Show ~6 time labels
  hourlyData.forEach((hour, index) => {
    if (index % timeStep === 0 || index === hourlyData.length - 1) {
      const x = padding + (chartWidth / (hourlyData.length - 1)) * index;
      const timeLabel = hour.time;
      ctx.fillText(timeLabel, x, height - 10);
    }
  });
}

function showHourlySummary() {
  if (
    !window.weatherData ||
    !window.weatherData.forecast ||
    !window.weatherData.forecast[selectedDayIndex]
  ) {
    return;
  }

  const dayData = window.weatherData.forecast[selectedDayIndex];
  const hourlyData = dayData.hourly || [];
  const modal = document.getElementById("hourlySummaryModal");
  const modalContent = document.getElementById("hourlySummaryContent");

  if (!modal || !modalContent) return;

  // Calculate summary statistics
  const temps = hourlyData.map((h) => h.temp);
  const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const avgHumidity = Math.round(
    hourlyData.reduce((sum, h) => sum + h.humidity, 0) / hourlyData.length
  );
  const avgWind = Math.round(
    hourlyData.reduce((sum, h) => sum + h.wind_kph, 0) / hourlyData.length
  );
  const totalPrecip = hourlyData.reduce(
    (sum, h) => sum + (h.chance_of_rain || 0),
    0
  );
  const maxPrecip = Math.max(...hourlyData.map((h) => h.chance_of_rain || 0));

  // Calculate analytics data
  const humidities = hourlyData.map((h) => h.humidity);
  const rains = hourlyData.map((h) => h.chance_of_rain || 0);
  const clouds = hourlyData.map((h) => h.cloud || 0);
  const times = hourlyData.map((h) => h.time);

  const maxHumidity = Math.max(...humidities);
  const minHumidity = Math.min(...humidities);
  const maxRain = Math.max(...rains);
  const minRain = Math.min(...rains);
  const maxCloud = Math.max(...clouds);
  const minCloud = Math.min(...clouds);
  const avgCloud = Math.round(
    clouds.reduce((a, b) => a + b, 0) / clouds.length
  );
  const avgRain = Math.round(rains.reduce((a, b) => a + b, 0) / rains.length);

  modalContent.innerHTML = `
        <div class="hourly-modal-header">
            <div class="hourly-modal-title">Ringkasan Per Jam</div>
            <div style="color: #b0b0b0; font-size: 14px;">${
              dayData.dayName
            }, ${new Date(dayData.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}</div>
        </div>

        <div class="hourly-summary-grid">
            <div class="hourly-summary-card">
                <div class="hourly-summary-label">Suhu Rata-rata</div>
                <div class="hourly-summary-value">${avgTemp}°C</div>
            </div>
            <div class="hourly-summary-card">
                <div class="hourly-summary-label">Suhu Maksimal</div>
                <div class="hourly-summary-value">${maxTemp}°C</div>
            </div>
            <div class="hourly-summary-card">
                <div class="hourly-summary-label">Suhu Minimal</div>
                <div class="hourly-summary-value">${minTemp}°C</div>
            </div>
            <div class="hourly-summary-card">
                <div class="hourly-summary-label">Kelembaban Rata-rata</div>
                <div class="hourly-summary-value">${avgHumidity}%</div>
            </div>
            <div class="hourly-summary-card">
                <div class="hourly-summary-label">Kecepatan Angin Rata-rata</div>
                <div class="hourly-summary-value">${avgWind} km/h</div>
            </div>
            <div class="hourly-summary-card">
                <div class="hourly-summary-label">Kemungkinan Hujan Maksimal</div>
                <div class="hourly-summary-value">${maxPrecip}%</div>
            </div>
        </div>

        <div class="modal-analytics-section">
            <div class="modal-hourly-title">Analitik Per Jam</div>
            <div class="modal-analytics-grid">
                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon temp-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"></path>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Suhu</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxTemp}°C</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minTemp}°C</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgTemp}°C</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalTempChart" width="400" height="100"></canvas>
                </div>

                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon humidity-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Kelembaban</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxHumidity}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minHumidity}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgHumidity}%</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalHumidityChart" width="400" height="100"></canvas>
                </div>

                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon rain-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 13v8M8 13v8M12 15v8"></path>
                                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Hujan</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxRain}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minRain}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgRain}%</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalRainChart" width="400" height="100"></canvas>
                </div>

                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon cloud-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.5 10.5c0-2.5-2-4.5-4.5-4.5-1.2 0-2.3.5-3.1 1.3C9.8 6.1 8.2 5 6.5 5 3.5 5 1 7.5 1 10.5c0 .8.2 1.6.5 2.3C.6 13.7 0 14.9 0 16.2c0 2.1 1.7 3.8 3.8 3.8h13.4c2.1 0 3.8-1.7 3.8-3.8 0-1.3-.6-2.5-1.5-3.4.3-.7.5-1.5.5-2.3z" fill="lightblue"/>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Awan</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxCloud}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minCloud}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgCloud}%</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalCloudChart" width="400" height="100"></canvas>
                </div>
            </div>
        </div>

        <div class="modal-hourly-section">
            <div class="modal-hourly-title">Temperature Overview</div>
            <div class="modal-hourly-list">
                ${hourlyData
                  .slice(0, 12)
                  .map(
                    (hour) => `
                    <div class="modal-hourly-item">
                        <div class="modal-hourly-time">${hour.time}</div>
                        <img src="${hour.icon}" alt="${hour.condition}" class="modal-hourly-icon" onerror="this.style.display='none'">
                        <div class="modal-hourly-temp">${hour.temp}°</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  modal.classList.add("show");

  // Draw analytics charts after modal is shown
  setTimeout(() => {
    updateAnalyticsCard(
      "modalTempChart",
      temps,
      times,
      "°C",
      "#ff6b6b",
      "Temperature"
    );
    updateAnalyticsCard(
      "modalHumidityChart",
      humidities,
      times,
      "%",
      "#4a9eff",
      "Humidity"
    );
    updateAnalyticsCard("modalRainChart", rains, times, "%", "#74b9ff", "Rain");
    updateAnalyticsCard(
      "modalCloudChart",
      clouds,
      times,
      "%",
      "#b0c4de",
      "Cloud"
    );
  }, 100);
}

function showHourlyDetails() {
  if (
    !window.weatherData ||
    !window.weatherData.forecast ||
    !window.weatherData.forecast[selectedDayIndex]
  ) {
    return;
  }

  const dayData = window.weatherData.forecast[selectedDayIndex];
  const hourlyData = dayData.hourly || [];
  const modal = document.getElementById("hourlyDetailsModal");
  const modalContent = document.getElementById("hourlyDetailsContent");

  if (!modal || !modalContent) return;

  // Calculate analytics data
  const temps = hourlyData.map((h) => h.temp);
  const humidities = hourlyData.map((h) => h.humidity);
  const rains = hourlyData.map((h) => h.chance_of_rain || 0);
  const clouds = hourlyData.map((h) => h.cloud || 0);
  const times = hourlyData.map((h) => h.time);

  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  const maxHumidity = Math.max(...humidities);
  const minHumidity = Math.min(...humidities);
  const avgHumidity = Math.round(
    humidities.reduce((a, b) => a + b, 0) / humidities.length
  );
  const maxRain = Math.max(...rains);
  const minRain = Math.min(...rains);
  const avgRain = Math.round(rains.reduce((a, b) => a + b, 0) / rains.length);
  const maxCloud = Math.max(...clouds);
  const minCloud = Math.min(...clouds);
  const avgCloud = Math.round(
    clouds.reduce((a, b) => a + b, 0) / clouds.length
  );

  modalContent.innerHTML = `
        <div class="hourly-modal-header">
            <div class="hourly-modal-title">Detail Per Jam</div>
            <div style="color: #b0b0b0; font-size: 14px;">${
              dayData.dayName
            }, ${new Date(dayData.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}</div>
        </div>

        <div class="modal-analytics-section">
            <div class="modal-hourly-title">Ringkasan Analitik Per Jam</div>
            <div class="modal-analytics-grid">
                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon temp-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"></path>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Suhu</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxTemp}°C</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minTemp}°C</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgTemp}°C</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalDetailsTempChart" width="400" height="100"></canvas>
                </div>

                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon humidity-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Kelembaban</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxHumidity}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minHumidity}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgHumidity}%</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalDetailsHumidityChart" width="400" height="100"></canvas>
                </div>

                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon rain-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 13v8M8 13v8M12 15v8"></path>
                                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Hujan</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxRain}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minRain}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgRain}%</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalDetailsRainChart" width="400" height="100"></canvas>
                </div>

                <div class="modal-analytics-card">
                    <div class="modal-analytics-header">
                        <div class="modal-analytics-icon cloud-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.5 10.5c0-2.5-2-4.5-4.5-4.5-1.2 0-2.3.5-3.1 1.3C9.8 6.1 8.2 5 6.5 5 3.5 5 1 7.5 1 10.5c0 .8.2 1.6.5 2.3C.6 13.7 0 14.9 0 16.2c0 2.1 1.7 3.8 3.8 3.8h13.4c2.1 0 3.8-1.7 3.8-3.8 0-1.3-.6-2.5-1.5-3.4.3-.7.5-1.5.5-2.3z" fill="lightblue"/>
                            </svg>
                        </div>
                        <div class="modal-analytics-label">Awan</div>
                    </div>
                    <div class="modal-analytics-stats">
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Maks</span>
                            <span class="modal-stat-value">${maxCloud}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Min</span>
                            <span class="modal-stat-value">${minCloud}%</span>
                        </div>
                        <div class="modal-stat-item">
                            <span class="modal-stat-label">Rata</span>
                            <span class="modal-stat-value">${avgCloud}%</span>
                        </div>
                    </div>
                    <canvas class="modal-analytics-chart" id="modalDetailsCloudChart" width="400" height="100"></canvas>
                </div>
            </div>
        </div>

        <table class="hourly-details-table">
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>Suhu</th>
                    <th>Terasa Seperti</th>
                    <th>Kondisi</th>
                    <th>Kelembaban</th>
                    <th>Angin</th>
                    <th>Tekanan</th>
                    <th>Hujan</th>
                    <th>Awan</th>
                </tr>
            </thead>
            <tbody>
                ${hourlyData
                  .map(
                    (hour) => `
                    <tr>
                        <td><strong>${hour.time}</strong></td>
                        <td>${hour.temp}°C</td>
                        <td>${hour.feelslike}°C</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${hour.icon}" alt="${
                      hour.condition
                    }" style="width: 24px; height: 24px;" onerror="this.style.display='none'">
                                <span>${hour.condition}</span>
                            </div>
                        </td>
                        <td>${hour.humidity}%</td>
                        <td>${hour.wind_kph} km/h</td>
                        <td>${hour.pressure_mb} mb</td>
                        <td>${hour.chance_of_rain}%</td>
                        <td>${hour.cloud || 0}%</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;

  modal.classList.add("show");

  // Draw analytics charts after modal is shown
  setTimeout(() => {
    updateAnalyticsCard(
      "modalDetailsTempChart",
      temps,
      times,
      "°C",
      "#ff6b6b",
      "Temperature"
    );
    updateAnalyticsCard(
      "modalDetailsHumidityChart",
      humidities,
      times,
      "%",
      "#4a9eff",
      "Humidity"
    );
    updateAnalyticsCard(
      "modalDetailsRainChart",
      rains,
      times,
      "%",
      "#74b9ff",
      "Rain"
    );
    updateAnalyticsCard(
      "modalDetailsCloudChart",
      clouds,
      times,
      "%",
      "#b0c4de",
      "Cloud"
    );
  }, 100);
}

function showTodayDetailModal(detailType) {
  if (!window.weatherData || !window.weatherData.todayDetails) {
    return;
  }

  const modal = document.getElementById("todayDetailsModal");
  const modalContent = document.getElementById("todayDetailsContent");

  if (!modal || !modalContent) return;

  const details = window.weatherData.todayDetails;
  const location = window.weatherData.location;
  let content = "";

  switch (detailType) {
    case "sunrise-sunset":
      // Calculate day length
      const sunriseTime = new Date(`2000-01-01 ${details.sunrise}`);
      const sunsetTime = new Date(`2000-01-01 ${details.sunset}`);
      if (sunsetTime < sunriseTime) {
        sunsetTime.setDate(sunsetTime.getDate() + 1);
      }
      const dayLengthMs = sunsetTime - sunriseTime;
      const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
      const dayLengthMinutes = Math.floor(
        (dayLengthMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      content = `
                <div class="hourly-modal-header">
                    <div class="hourly-modal-title">Matahari Terbit & Terbenam</div>
                    <div style="color: #b0b0b0; font-size: 14px;">${
                      location?.name || "Lokasi Saat Ini"
                    }</div>
                </div>

                <div class="modal-day-main" style="flex-direction: column; gap: 30px;">
                    <div style="display: flex; justify-content: space-around; gap: 30px; flex-wrap: wrap;">
                        <div class="modal-detail-item" style="min-width: 200px;">
                            <div class="modal-detail-label">Matahari Terbit</div>
                            <div class="modal-detail-value" style="font-size: 36px;">${
                              details.sunrise
                            }</div>
                            <div style="font-size: 12px; color: #b0b0b0; margin-top: 10px;">Jam emas pagi</div>
                        </div>
                        <div class="modal-detail-item" style="min-width: 200px;">
                            <div class="modal-detail-label">Matahari Terbenam</div>
                            <div class="modal-detail-value" style="font-size: 36px;">${
                              details.sunset
                            }</div>
                            <div style="font-size: 12px; color: #b0b0b0; margin-top: 10px;">Jam emas sore</div>
                        </div>
                    </div>
                    
                    <div class="modal-detail-item">
                        <div class="modal-detail-label">Durasi Siang</div>
                        <div class="modal-detail-value" style="font-size: 32px;">${dayLengthHours}j ${dayLengthMinutes}m</div>
                        <div style="font-size: 12px; color: #b0b0b0; margin-top: 10px;">Total jam siang hari</div>
                    </div>
                </div>
            `;
      break;

    case "uv-index":
      const uvDescription = getUVDescription(details.uvIndex);
      content = `
                <div class="hourly-modal-header">
                    <div class="hourly-modal-title">Indeks UV</div>
                    <div style="color: #b0b0b0; font-size: 14px;">${
                      location?.name || "Lokasi Saat Ini"
                    }</div>
                </div>

                <div class="modal-day-main" style="flex-direction: column; gap: 30px;">
                    <div style="text-align: center;">
                        <div style="font-size: 72px; font-weight: 300; color: #ffffff; margin-bottom: 15px;">${
                          details.uvIndex
                        }</div>
                        <div style="font-size: 24px; color: #ffa500; font-weight: 600; margin-bottom: 20px;">${
                          details.uvLevel
                        }</div>
                        <div class="uv-progress" style="max-width: 500px; margin: 0 auto;">
                            <div class="uv-progress-bar" style="width: ${Math.min(
                              100,
                              (details.uvIndex / 11) * 100
                            )}%"></div>
                        </div>
                    </div>

                    <div class="modal-day-details">
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Level Saat Ini</div>
                            <div class="modal-detail-value">${
                              details.uvLevel
                            }</div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Nilai Indeks</div>
                            <div class="modal-detail-value">${
                              details.uvIndex
                            }</div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Perlindungan Diperlukan</div>
                            <div class="modal-detail-value">${getUVProtection(
                              details.uvIndex
                            )}</div>
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-top: 20px;">
                        <div style="font-size: 14px; color: #e0e0e0; line-height: 1.6;">
                            <strong style="color: #ffffff;">Deskripsi:</strong><br>
                            ${uvDescription}
                        </div>
                    </div>
                </div>
            `;
      break;

    case "visibility":
      const visibilityDescription = getVisibilityDescription(
        details.visibility
      );
      content = `
                <div class="hourly-modal-header">
                    <div class="hourly-modal-title">Jarak Pandang</div>
                    <div style="color: #b0b0b0; font-size: 14px;">${
                      location?.name || "Lokasi Saat Ini"
                    }</div>
                </div>

                <div class="modal-day-main" style="flex-direction: column; gap: 30px;">
                    <div style="text-align: center;">
                        <div style="font-size: 72px; font-weight: 300; color: #ffffff; margin-bottom: 15px;">${
                          details.visibility
                        }</div>
                        <div style="font-size: 18px; color: #b0b0b0; margin-bottom: 10px;">kilometer</div>
                        <div style="font-size: 16px; color: #87cefa; font-weight: 600;">${visibilityDescription}</div>
                    </div>

                    <div class="modal-day-details">
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Jarak Pandang Saat Ini</div>
                            <div class="modal-detail-value">${
                              details.visibility
                            } km</div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Kondisi</div>
                            <div class="modal-detail-value">${visibilityDescription}</div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Dampak Kualitas Udara</div>
                            <div class="modal-detail-value">${getVisibilityImpact(
                              details.visibility
                            )}</div>
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-top: 20px;">
                        <div style="font-size: 14px; color: #e0e0e0; line-height: 1.6;">
                            <strong style="color: #ffffff;">Skala Jarak Pandang:</strong><br>
                            • Sangat Baik: > 10 km<br>
                            • Baik: 5-10 km<br>
                            • Sedang: 2-5 km<br>
                            • Poor: 1-2 km<br>
                            • Very Poor: < 1 km
                        </div>
                    </div>
                </div>
            `;
      break;

    case "cloud-cover":
      const cloudDescription = getCloudDescription(details.cloudCover);
      content = `
                <div class="hourly-modal-header">
                    <div class="hourly-modal-title">Cloud Cover</div>
                    <div style="color: #b0b0b0; font-size: 14px;">${
                      location?.name || "Current Location"
                    }</div>
                </div>

                <div class="modal-day-main" style="flex-direction: column; gap: 30px;">
                    <div style="text-align: center;">
                        <div style="font-size: 72px; font-weight: 300; color: #ffffff; margin-bottom: 15px;">${
                          details.cloudCover
                        }%</div>
                        <div style="font-size: 18px; color: #b0b0b0; margin-bottom: 10px;">sky coverage</div>
                        <div style="font-size: 16px; color: #b0c4de; font-weight: 600;">${cloudDescription}</div>
                    </div>

                    <div class="modal-day-details">
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Cloud Coverage</div>
                            <div class="modal-detail-value">${
                              details.cloudCover
                            }%</div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Sky Condition</div>
                            <div class="modal-detail-value">${cloudDescription}</div>
                        </div>
                        <div class="modal-detail-item">
                            <div class="modal-detail-label">Sun Exposure</div>
                            <div class="modal-detail-value">${
                              100 - details.cloudCover
                            }%</div>
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-top: 20px;">
                        <div style="font-size: 14px; color: #e0e0e0; line-height: 1.6;">
                            <strong style="color: #ffffff;">Cloud Cover Scale:</strong><br>
                            • Clear: 0-10%<br>
                            • Mostly Clear: 11-25%<br>
                            • Partly Cloudy: 26-50%<br>
                            • Mostly Cloudy: 51-75%<br>
                            • Overcast: 76-100%
                        </div>
                    </div>
                </div>
            `;
      break;
  }

  modalContent.innerHTML = content;
  modal.classList.add("show");
}

function getUVDescription(uvIndex) {
  if (uvIndex >= 11)
    return "Radiasi UV ekstrem. Hindari paparan matahari antara jam 10 pagi-4 sore. Cari tempat teduh dan kenakan pakaian pelindung.";
  if (uvIndex >= 8)
    return "Radiasi UV sangat tinggi. Perlindungan ekstra diperlukan. Hindari matahari antara jam 10 pagi-4 sore.";
  if (uvIndex >= 6)
    return "Radiasi UV tinggi. Perlindungan diperlukan. Cari tempat teduh saat tengah hari.";
  if (uvIndex >= 3)
    return "Radiasi UV sedang. Perlindungan diperlukan. Cari tempat teduh saat tengah hari jika di luar.";
  return "Radiasi UV rendah. Perlindungan minimal diperlukan. Aman untuk berada di luar.";
}

function getUVProtection(uvIndex) {
  if (uvIndex >= 11) return "Maksimal";
  if (uvIndex >= 8) return "Sangat Tinggi";
  if (uvIndex >= 6) return "Tinggi";
  if (uvIndex >= 3) return "Sedang";
  return "Minimal";
}

function getVisibilityDescription(visibility) {
  if (visibility > 10) return "Sangat Baik";
  if (visibility >= 5) return "Baik";
  if (visibility >= 2) return "Sedang";
  if (visibility >= 1) return "Buruk";
  return "Sangat Buruk";
}

function getVisibilityImpact(visibility) {
  if (visibility > 10) return "Jernih";
  if (visibility >= 5) return "Normal";
  if (visibility >= 2) return "Berkurang";
  return "Terbatas";
}

function getCloudDescription(cloudCover) {
  if (cloudCover <= 10) return "Clear";
  if (cloudCover <= 25) return "Mostly Clear";
  if (cloudCover <= 50) return "Partly Cloudy";
  if (cloudCover <= 75) return "Mostly Cloudy";
  return "Overcast";
}

// Analytics functions are now in analytics.js

// Add pulse animation
const style = document.createElement("style");
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
