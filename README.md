# Climate Change & Agriculture Impact Visualizer

An interactive web dashboard that visualizes how rising global temperatures affect crop yields and livestock productivity across world regions.

[![Live Demo](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen)](https://joelfirenze.github.io/climate-food-impact/)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?logo=buymeacoffee&logoColor=white)](https://buymeacoffee.com/joelfirenze)

## Features

- **Interactive Choropleth Map** — Countries colored by projected yield/productivity impact. Click any region to drill down to a continental view.
- **7 Major Crops** — Wheat, Rice, Maize, Soybeans, Potatoes, Coffee (Arabica), Cocoa — with optimal temperature ranges, critical thresholds, and per-region yield projections.
- **5 Livestock Types** — Beef Cattle, Dairy Cows, Poultry, Pigs, Sheep & Goats — with thermoneutral zones, heat stress onset, and productivity impacts.
- **Temperature Slider (+1°C to +5°C)** — Explore impacts across warming scenarios mapped to IPCC SSP pathways and approximate timelines.
- **Regional Impact Charts** — Horizontal bar chart comparing all 10 world regions at the selected warming level.
- **Yield Trajectory Chart** — Line chart showing how each region's yields track from +1°C through +5°C of warming.
- **Production Shift Arrows** — Animated map overlays showing where agricultural production is projected to migrate.
- **Temperature Threshold Gauge** — SVG visualization showing where each commodity sits relative to its critical heat limits.
- **Top Producers Table** — Impact breakdown for the world's leading producers of each commodity.
- **Adaptation Strategies** — Research-based adaptation options for each crop and livestock type.

## Data Sources

All data is synthesized from peer-reviewed research:

- [IPCC AR6 Working Group II, Chapter 5](https://www.ipcc.ch/report/ar6/wg2/) — Food, Fibre and Other Ecosystem Products
- [IPCC Special Report on Climate Change and Land (SRCCL)](https://www.ipcc.ch/srccl/) — Figure 5.2 yield projections
- [FAO](https://www.fao.org/faostat/) — Production statistics and top producer rankings
- [CGIAR](https://www.cgiar.org/) — Crop and livestock climate adaptation research

Values represent median estimates from meta-analyses. Actual impacts vary with local conditions, adaptation measures, CO₂ fertilization effects, and water availability.

## Tech Stack

Zero build tools — just open `index.html` in a browser.

| Library | Purpose |
|---------|---------|
| [Leaflet.js](https://leafletjs.com/) (CDN) | Interactive map with GeoJSON choropleth |
| [Chart.js](https://www.chartjs.org/) (CDN) | Bar and line charts |
| [CARTO](https://carto.com/) | Dark basemap tiles |
| [johan/world.geo.json](https://github.com/johan/world.geo.json) | Country boundary GeoJSON |

## Project Structure

```
climate_food_impact/
├── index.html   # HTML structure + embedded CSS + CDN links
├── data.js      # All research data: crops, livestock, regions, thresholds
├── app.js       # Application logic: map, charts, interactivity
└── README.md
```

## Running Locally

Just open the file — no server required:

```bash
open index.html
```

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Support

If you find this project useful, consider buying me a coffee!

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=joelfirenze&button_colour=FFDD00&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=ffffff)](https://buymeacoffee.com/joelfirenze)

## License

MIT
