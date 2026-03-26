// =============================================================================
// Climate Change & Agriculture Impact - Application Logic
// =============================================================================

(function() {
  'use strict';

  // -------------------------------------------------------------------------
  // Application State
  // -------------------------------------------------------------------------
  const state = {
    selectedKey: 'wheat',
    commodityType: 'crop',
    tempIncrease: 2,
    currentView: 'world',
    currentRegion: null,
    map: null,
    geoJsonLayer: null,
    geoJsonData: null,
    arrowLayers: [],
    charts: {
      regional: null,
      trajectory: null
    }
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  function getSelectedData() {
    if (state.commodityType === 'crop') {
      return APP_DATA.crops[state.selectedKey];
    }
    return APP_DATA.livestock[state.selectedKey];
  }

  function getImpactValue(data, regionKey) {
    const impacts = data.yieldChange || data.impacts;
    if (!impacts || !impacts[regionKey]) return null;
    const idx = state.tempIncrease - 1;
    return impacts[regionKey][idx];
  }

  function getRegionForCountry(iso3) {
    return APP_DATA.countryToRegion[iso3] || null;
  }

  function getAllRegionKeys() {
    return Object.keys(APP_DATA.regions);
  }

  // -------------------------------------------------------------------------
  // Map Initialization
  // -------------------------------------------------------------------------
  function initMap() {
    state.map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
      maxBounds: [[-85, -200], [85, 200]]
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(state.map);

    // Add labels layer on top
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      pane: 'shadowPane'
    }).addTo(state.map);

    loadGeoJson();
  }

  function loadGeoJson() {
    const url = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
    fetch(url)
      .then(r => r.json())
      .then(data => {
        state.geoJsonData = data;
        renderMap();
        updateAll();
        document.getElementById('loading-overlay').classList.add('hidden');
      })
      .catch(err => {
        console.error('Failed to load GeoJSON:', err);
        document.getElementById('loading-text').textContent = 'Failed to load map data. Please refresh.';
      });
  }

  // -------------------------------------------------------------------------
  // Map Rendering
  // -------------------------------------------------------------------------
  function renderMap() {
    if (!state.geoJsonData) return;

    const data = getSelectedData();
    if (!data) return;

    // Remove existing layer
    if (state.geoJsonLayer) {
      state.map.removeLayer(state.geoJsonLayer);
    }
    clearArrows();

    state.geoJsonLayer = L.geoJSON(state.geoJsonData, {
      style: feature => getFeatureStyle(feature, data),
      onEachFeature: (feature, layer) => bindFeatureEvents(feature, layer, data),
      filter: feature => {
        if (state.currentView !== 'world' && state.currentRegion) {
          const region = APP_DATA.regions[state.currentRegion];
          return region && region.countries.includes(feature.id);
        }
        return true;
      }
    }).addTo(state.map);

    renderArrows(data);
    updateLegend();
  }

  function getFeatureStyle(feature, data) {
    const regionKey = getRegionForCountry(feature.id);
    const value = regionKey ? getImpactValue(data, regionKey) : null;
    const color = APP_DATA.getImpactColor(value);

    const isHighlighted = state.currentView !== 'world' && state.currentRegion;

    return {
      fillColor: color,
      weight: isHighlighted ? 2 : 1,
      opacity: 1,
      color: isHighlighted ? '#e8e8f0' : '#2a2a4a',
      fillOpacity: value !== null ? 0.85 : 0.3
    };
  }

  function bindFeatureEvents(feature, layer, data) {
    const regionKey = getRegionForCountry(feature.id);
    const region = regionKey ? APP_DATA.regions[regionKey] : null;
    const value = regionKey ? getImpactValue(data, regionKey) : null;
    const label = APP_DATA.getImpactLabel(value);

    layer.bindTooltip(
      `<div class="map-tooltip">
        <strong>${feature.properties.name}</strong><br>
        <span class="tooltip-region">${region ? region.name : 'Unclassified'}</span><br>
        ${value !== null
          ? `<span class="tooltip-value" style="color:${APP_DATA.getImpactColor(value)}">${value > 0 ? '+' : ''}${value}%</span> <span class="tooltip-label">${label}</span>`
          : '<span class="tooltip-label">No data available</span>'
        }
      </div>`,
      { sticky: true, className: 'custom-tooltip' }
    );

    layer.on({
      mouseover: e => {
        const l = e.target;
        l.setStyle({ weight: 3, color: '#fff', fillOpacity: 0.95 });
        l.bringToFront();
      },
      mouseout: e => {
        state.geoJsonLayer.resetStyle(e.target);
      },
      click: () => {
        if (regionKey && state.currentView === 'world') {
          drillDown(regionKey);
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Arrows for production shifts
  // -------------------------------------------------------------------------
  function renderArrows(data) {
    const shifts = APP_DATA.productionShifts[state.selectedKey];
    if (!shifts) return;

    // Only show arrows at higher warming levels
    if (state.tempIncrease < 2) return;

    shifts.forEach(([fromLat, fromLng, toLat, toLng, label]) => {
      const line = L.polyline(
        [[fromLat, fromLng], [toLat, toLng]],
        {
          color: '#ffd93d',
          weight: 2,
          opacity: Math.min(0.3 + state.tempIncrease * 0.15, 0.9),
          dashArray: '8, 8',
          className: 'shift-arrow'
        }
      ).addTo(state.map);

      // Arrowhead at destination
      const arrow = L.circleMarker([toLat, toLng], {
        radius: 5,
        fillColor: '#ffd93d',
        fillOpacity: Math.min(0.3 + state.tempIncrease * 0.15, 0.9),
        color: '#ffd93d',
        weight: 1
      }).addTo(state.map);

      arrow.bindTooltip(label, { className: 'custom-tooltip', direction: 'top' });

      state.arrowLayers.push(line, arrow);
    });
  }

  function clearArrows() {
    state.arrowLayers.forEach(l => state.map.removeLayer(l));
    state.arrowLayers = [];
  }

  // -------------------------------------------------------------------------
  // Region Drill-down
  // -------------------------------------------------------------------------
  function drillDown(regionKey) {
    const region = APP_DATA.regions[regionKey];
    if (!region) return;

    state.currentView = 'region';
    state.currentRegion = regionKey;

    state.map.flyTo(region.center, region.zoom, { duration: 0.8 });
    renderMap();
    updateAll();

    document.getElementById('back-to-world').classList.remove('hidden');
    document.getElementById('region-title').textContent = region.name;
    document.getElementById('region-title').classList.remove('hidden');
  }

  function backToWorld() {
    state.currentView = 'world';
    state.currentRegion = null;

    state.map.flyTo([20, 0], 2, { duration: 0.8 });
    renderMap();
    updateAll();

    document.getElementById('back-to-world').classList.add('hidden');
    document.getElementById('region-title').classList.add('hidden');
  }

  // -------------------------------------------------------------------------
  // Legend
  // -------------------------------------------------------------------------
  function updateLegend() {
    const legend = document.getElementById('map-legend');
    const items = [
      { color: '#1a9850', label: '> +5%' },
      { color: '#66bd63', label: '+2 to +5%' },
      { color: '#a6d96a', label: '0 to +2%' },
      { color: '#fee08b', label: '0 to -5%' },
      { color: '#fdae61', label: '-5 to -10%' },
      { color: '#f46d43', label: '-10 to -15%' },
      { color: '#d73027', label: '-15 to -25%' },
      { color: '#a50026', label: '-25 to -40%' },
      { color: '#67001f', label: '< -40%' }
    ];

    legend.innerHTML = '<div class="legend-title">Yield / Productivity Change</div>' +
      items.map(i =>
        `<div class="legend-item"><span class="legend-color" style="background:${i.color}"></span>${i.label}</div>`
      ).join('');
  }

  // -------------------------------------------------------------------------
  // Info Panel
  // -------------------------------------------------------------------------
  function updateInfoPanel() {
    const data = getSelectedData();
    if (!data) return;

    // Commodity card
    const card = document.getElementById('commodity-card');
    const isLivestock = state.commodityType === 'livestock';
    const tempRange = isLivestock ? data.thermoneutralZone : data.optimalTemp;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-icon">${data.icon}</span>
        <div>
          <h2 class="card-title">${data.name}</h2>
          <span class="card-production">${data.globalProduction}</span>
        </div>
      </div>
      <p class="card-desc">${data.description}</p>
      <div class="card-stats">
        <div class="stat">
          <span class="stat-label">${isLivestock ? 'Thermoneutral Zone' : 'Optimal Range'}</span>
          <span class="stat-value">${tempRange.min}\u00B0C \u2013 ${tempRange.max}\u00B0C</span>
        </div>
        <div class="stat">
          <span class="stat-label">${isLivestock ? 'Heat Stress Onset' : 'Critical Max'}</span>
          <span class="stat-value critical">${isLivestock ? data.heatStressOnset : data.criticalMax}\u00B0C</span>
        </div>
        <div class="stat stat-full">
          <span class="stat-label">Critical Threshold</span>
          <span class="stat-detail">${data.criticalNote}</span>
        </div>
      </div>
    `;

    // Temperature gauge
    renderTempGauge(data);

    // Production shift
    document.getElementById('shift-text').textContent = data.productionShift;
    document.getElementById('adaptation-text').textContent = data.adaptations;

    // Scenario info
    const scenario = APP_DATA.scenarios[state.tempIncrease];
    document.getElementById('scenario-label').textContent = scenario.label;
    document.getElementById('scenario-year').textContent = scenario.yearRange;
    document.getElementById('scenario-ssp').textContent = scenario.ssp;
    document.getElementById('scenario-label').style.color = scenario.color;
  }

  // -------------------------------------------------------------------------
  // Temperature Gauge (SVG)
  // -------------------------------------------------------------------------
  function renderTempGauge(data) {
    const container = document.getElementById('temp-gauge');
    const isLivestock = state.commodityType === 'livestock';
    const optMin = isLivestock ? data.thermoneutralZone.min : data.optimalTemp.min;
    const optMax = isLivestock ? data.thermoneutralZone.max : data.optimalTemp.max;
    const critical = isLivestock ? data.criticalTemp : data.criticalMax;
    const heatOnset = isLivestock ? data.heatStressOnset : data.criticalMax;

    const gaugeMin = 0;
    const gaugeMax = 50;
    const width = 300;
    const height = 50;
    const barY = 18;
    const barH = 16;

    function xPos(temp) {
      return ((temp - gaugeMin) / (gaugeMax - gaugeMin)) * width;
    }

    // Effective temperature (simplified: add warming to midpoint of optimal)
    const baseMid = (optMin + optMax) / 2;
    const effectiveTemp = baseMid + state.tempIncrease;

    container.innerHTML = `
      <svg width="100%" viewBox="0 0 ${width} ${height + 20}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background bar -->
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#4a90d9"/>
            <stop offset="30%" stop-color="#1a9850"/>
            <stop offset="55%" stop-color="#fee08b"/>
            <stop offset="75%" stop-color="#f46d43"/>
            <stop offset="100%" stop-color="#d73027"/>
          </linearGradient>
        </defs>
        <rect x="0" y="${barY}" width="${width}" height="${barH}" rx="4" fill="url(#tempGrad)" opacity="0.3"/>

        <!-- Optimal range -->
        <rect x="${xPos(optMin)}" y="${barY}" width="${xPos(optMax) - xPos(optMin)}" height="${barH}" rx="2" fill="#1a9850" opacity="0.6"/>

        <!-- Heat stress zone -->
        <rect x="${xPos(heatOnset)}" y="${barY}" width="${xPos(critical) - xPos(heatOnset)}" height="${barH}" rx="0" fill="#f46d43" opacity="0.4"/>

        <!-- Critical zone -->
        <rect x="${xPos(critical)}" y="${barY}" width="${width - xPos(critical)}" height="${barH}" rx="0" fill="#d73027" opacity="0.4"/>

        <!-- Critical line -->
        <line x1="${xPos(critical)}" y1="${barY - 2}" x2="${xPos(critical)}" y2="${barY + barH + 2}" stroke="#ff4444" stroke-width="2"/>
        <text x="${xPos(critical)}" y="${barY - 5}" text-anchor="middle" fill="#ff6666" font-size="8">${critical}\u00B0</text>

        <!-- Effective temperature marker -->
        <circle cx="${Math.min(xPos(effectiveTemp), width - 4)}" cy="${barY + barH/2}" r="6" fill="${effectiveTemp > critical ? '#ff4444' : effectiveTemp > heatOnset ? '#fdae61' : '#1a9850'}" stroke="white" stroke-width="2"/>

        <!-- Labels -->
        <text x="${xPos(optMin)}" y="${barY + barH + 14}" text-anchor="middle" fill="#9898b0" font-size="7">${optMin}\u00B0</text>
        <text x="${xPos(optMax)}" y="${barY + barH + 14}" text-anchor="middle" fill="#9898b0" font-size="7">${optMax}\u00B0</text>
        <text x="${Math.min(xPos(effectiveTemp), width - 20)}" y="${barY + barH + 14}" text-anchor="middle" fill="#fff" font-size="8" font-weight="600">${effectiveTemp.toFixed(0)}\u00B0 eff.</text>

        <!-- Scale labels -->
        <text x="2" y="12" fill="#666" font-size="7">0\u00B0C</text>
        <text x="${width - 2}" y="12" text-anchor="end" fill="#666" font-size="7">50\u00B0C</text>
      </svg>
    `;
  }

  // -------------------------------------------------------------------------
  // Charts
  // -------------------------------------------------------------------------
  function updateCharts() {
    updateRegionalChart();
    updateTrajectoryChart();
  }

  function updateRegionalChart() {
    const data = getSelectedData();
    if (!data) return;

    const impacts = data.yieldChange || data.impacts;
    const idx = state.tempIncrease - 1;

    const regionKeys = getAllRegionKeys();
    const labels = regionKeys.map(k => APP_DATA.regions[k].name);
    const values = regionKeys.map(k => impacts[k] ? impacts[k][idx] : 0);
    const colors = values.map(v => APP_DATA.getImpactColor(v));

    const ctx = document.getElementById('regional-chart').getContext('2d');

    if (state.charts.regional) {
      state.charts.regional.destroy();
    }

    state.charts.regional = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${data.name} impact at +${state.tempIncrease}\u00B0C`,
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#e8e8f0',
            bodyColor: '#e8e8f0',
            borderColor: '#3a3a5a',
            borderWidth: 1,
            callbacks: {
              label: ctx => `${ctx.raw > 0 ? '+' : ''}${ctx.raw}% yield change`
            }
          }
        },
        scales: {
          x: {
            min: -65,
            max: 15,
            grid: { color: '#2a2a4a' },
            ticks: {
              color: '#9898b0',
              callback: v => v + '%'
            },
            title: {
              display: true,
              text: state.commodityType === 'crop' ? 'Yield Change (%)' : 'Productivity Change (%)',
              color: '#9898b0'
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#c8c8e0', font: { size: 11 } }
          }
        }
      }
    });
  }

  function updateTrajectoryChart() {
    const data = getSelectedData();
    if (!data) return;

    const impacts = data.yieldChange || data.impacts;
    const regionKeys = getAllRegionKeys();

    const regionColors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
      '#1abc9c', '#e67e22', '#2980b9', '#27ae60', '#8e44ad'
    ];

    const datasets = regionKeys.map((k, i) => ({
      label: APP_DATA.regions[k].name,
      data: impacts[k] || [0, 0, 0, 0, 0],
      borderColor: regionColors[i % regionColors.length],
      backgroundColor: regionColors[i % regionColors.length] + '20',
      tension: 0.3,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2
    }));

    const ctx = document.getElementById('trajectory-chart').getContext('2d');

    if (state.charts.trajectory) {
      state.charts.trajectory.destroy();
    }

    state.charts.trajectory = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['+1\u00B0C', '+2\u00B0C', '+3\u00B0C', '+4\u00B0C', '+5\u00B0C'],
        datasets: datasets
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
            position: 'bottom',
            labels: {
              color: '#c8c8e0',
              boxWidth: 12,
              padding: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#e8e8f0',
            bodyColor: '#e8e8f0',
            borderColor: '#3a3a5a',
            borderWidth: 1,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw > 0 ? '+' : ''}${ctx.raw}%`
            }
          },
          annotation: {
            annotations: {
              currentLine: {
                type: 'line',
                xMin: state.tempIncrease - 1,
                xMax: state.tempIncrease - 1,
                borderColor: '#ffd93d',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Current: +${state.tempIncrease}\u00B0C`,
                  position: 'start'
                }
              }
            }
          }
        },
        scales: {
          y: {
            grid: { color: '#2a2a4a' },
            ticks: {
              color: '#9898b0',
              callback: v => v + '%'
            },
            title: {
              display: true,
              text: state.commodityType === 'crop' ? 'Yield Change (%)' : 'Productivity Change (%)',
              color: '#9898b0'
            }
          },
          x: {
            grid: { color: '#2a2a4a' },
            ticks: { color: '#c8c8e0' },
            title: {
              display: true,
              text: 'Global Warming Above Pre-Industrial',
              color: '#9898b0'
            }
          }
        }
      }
    });

    // Draw vertical line for current temperature manually
    drawTempIndicator();
  }

  function drawTempIndicator() {
    // The annotation plugin isn't loaded, so we draw it via afterDraw
    // This is handled in the chart options using a simple plugin:
    if (!state.charts.trajectory) return;

    const chart = state.charts.trajectory;
    const originalAfterDraw = chart.options.plugins.afterDraw;

    // Add a simple plugin
    const indicatorPlugin = {
      id: 'tempIndicator',
      afterDraw(chart) {
        const idx = state.tempIncrease - 1;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data[idx]) return;

        const x = meta.data[idx].x;
        const yScale = chart.scales.y;
        const ctx = chart.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2;
        ctx.moveTo(x, yScale.top);
        ctx.lineTo(x, yScale.bottom);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#ffd93d';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Selected', x, yScale.top - 5);
        ctx.restore();
      }
    };

    // Register plugin only once
    if (!Chart.registry.plugins.get('tempIndicator')) {
      Chart.register(indicatorPlugin);
    }
    chart.update();
  }

  // -------------------------------------------------------------------------
  // Top producers table
  // -------------------------------------------------------------------------
  function updateTopProducers() {
    const data = getSelectedData();
    if (!data || !data.topProducers) return;

    const container = document.getElementById('top-producers');
    const impacts = data.yieldChange || data.impacts;

    const rows = data.topProducers.slice(0, 8).map(iso => {
      const regionKey = getRegionForCountry(iso);
      const value = regionKey && impacts[regionKey] ? impacts[regionKey][state.tempIncrease - 1] : null;
      const feature = state.geoJsonData ?
        state.geoJsonData.features.find(f => f.id === iso) : null;
      const name = feature ? feature.properties.name : iso;

      return `<tr>
        <td>${name}</td>
        <td style="color:${APP_DATA.getImpactColor(value)}; font-weight:600">
          ${value !== null ? (value > 0 ? '+' : '') + value + '%' : 'N/A'}
        </td>
      </tr>`;
    }).join('');

    container.innerHTML = `
      <table class="producers-table">
        <thead><tr><th>Top Producer</th><th>Impact at +${state.tempIncrease}\u00B0C</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // -------------------------------------------------------------------------
  // Update All
  // -------------------------------------------------------------------------
  function updateAll() {
    updateInfoPanel();
    updateCharts();
    updateTopProducers();
  }

  // -------------------------------------------------------------------------
  // UI Event Handlers
  // -------------------------------------------------------------------------
  function buildCommodityButtons() {
    const cropsContainer = document.getElementById('crop-tabs');
    const livestockContainer = document.getElementById('livestock-tabs');

    Object.entries(APP_DATA.crops).forEach(([key, crop]) => {
      const btn = document.createElement('button');
      btn.className = 'commodity-btn' + (key === state.selectedKey ? ' active' : '');
      btn.dataset.key = key;
      btn.dataset.type = 'crop';
      btn.innerHTML = `<span class="btn-icon">${crop.icon}</span><span class="btn-label">${crop.name}</span>`;
      btn.addEventListener('click', () => selectCommodity(key, 'crop'));
      cropsContainer.appendChild(btn);
    });

    Object.entries(APP_DATA.livestock).forEach(([key, animal]) => {
      const btn = document.createElement('button');
      btn.className = 'commodity-btn' + (key === state.selectedKey ? ' active' : '');
      btn.dataset.key = key;
      btn.dataset.type = 'livestock';
      btn.innerHTML = `<span class="btn-icon">${animal.icon}</span><span class="btn-label">${animal.name}</span>`;
      btn.addEventListener('click', () => selectCommodity(key, 'livestock'));
      livestockContainer.appendChild(btn);
    });
  }

  function selectCommodity(key, type) {
    state.selectedKey = key;
    state.commodityType = type;

    document.querySelectorAll('.commodity-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.key === key);
    });

    renderMap();
    updateAll();
  }

  function onSliderChange(e) {
    state.tempIncrease = parseInt(e.target.value);
    const display = document.getElementById('temp-display');
    const scenario = APP_DATA.scenarios[state.tempIncrease];
    display.textContent = scenario.label;
    display.style.color = scenario.color;

    // Update slider track color
    updateSliderTrack(e.target);

    renderMap();
    updateAll();
  }

  function updateSliderTrack(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    const colors = ['#ffd93d', '#ff9f43', '#ee5a24', '#e74c3c', '#c0392b'];
    const color = colors[state.tempIncrease - 1];
    slider.style.setProperty('--track-color', color);
    slider.style.setProperty('--track-pct', pct + '%');
  }

  // -------------------------------------------------------------------------
  // Region selector dropdown
  // -------------------------------------------------------------------------
  function buildRegionSelector() {
    const select = document.getElementById('region-select');
    select.innerHTML = '<option value="world">World View</option>';

    Object.entries(APP_DATA.regions).forEach(([key, region]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = region.name;
      select.appendChild(opt);
    });

    select.addEventListener('change', e => {
      if (e.target.value === 'world') {
        backToWorld();
      } else {
        drillDown(e.target.value);
      }
      e.target.value = state.currentView === 'world' ? 'world' : state.currentRegion;
    });
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------
  function init() {
    buildCommodityButtons();
    buildRegionSelector();

    const slider = document.getElementById('temp-slider');
    slider.addEventListener('input', onSliderChange);
    updateSliderTrack(slider);

    document.getElementById('back-to-world').addEventListener('click', backToWorld);

    // Tab switching between crops and livestock
    document.querySelectorAll('.tab-header-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-header-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.target;
        document.getElementById('crop-tabs').classList.toggle('hidden', target !== 'crops');
        document.getElementById('livestock-tabs').classList.toggle('hidden', target !== 'livestock');
      });
    });

    initMap();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
