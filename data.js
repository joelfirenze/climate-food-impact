// =============================================================================
// Climate Change & Agriculture Impact - Data Layer
// Sources: IPCC AR6 WGII Ch5, IPCC SRCCL, FAO, CGIAR research
// =============================================================================

window.APP_DATA = {};

// ---------------------------------------------------------------------------
// Regions with ISO3 country codes, map centers, and zoom levels
// ---------------------------------------------------------------------------
APP_DATA.regions = {
  south_asia: {
    name: "South Asia",
    countries: ["IND","PAK","BGD","LKA","NPL","BTN","AFG"],
    center: [22, 78], zoom: 4,
    currentClimate: "Tropical to arid; monsoon-dependent agriculture",
    population: "1.9 billion"
  },
  southeast_asia: {
    name: "Southeast Asia",
    countries: ["THA","VNM","IDN","PHL","MMR","KHM","LAO","MYS","SGP","BRN","TLS"],
    center: [5, 112], zoom: 4,
    currentClimate: "Tropical; high humidity, heavy rainfall",
    population: "680 million"
  },
  east_asia: {
    name: "East Asia",
    countries: ["CHN","JPN","KOR","PRK","MNG","TWN"],
    center: [35, 105], zoom: 4,
    currentClimate: "Temperate to continental; diverse growing zones",
    population: "1.6 billion"
  },
  sub_saharan_africa: {
    name: "Sub-Saharan Africa",
    countries: ["NGA","ETH","KEN","TZA","GHA","CIV","CMR","ZAF","MOZ","UGA","MWI","ZMB","ZWE","SEN","MLI","BFA","NER","TCD","COD","COG","AGO","NAM","BWA","MDG","RWA","BDI","SOM","SSD","GAB","GNQ","SLE","LBR","GIN","GMB","TGO","BEN","ERI","DJI","COM","MUS","SWZ","LSO"],
    center: [0, 25], zoom: 3,
    currentClimate: "Tropical to semi-arid; rain-fed agriculture dominates",
    population: "1.2 billion"
  },
  north_africa_mena: {
    name: "N. Africa & Middle East",
    countries: ["EGY","MAR","DZA","TUN","LBY","IRQ","IRN","SAU","YEM","OMN","ARE","QAT","BHR","KWT","JOR","LBN","SYR","ISR","PSE","SDN","MRT"],
    center: [28, 35], zoom: 4,
    currentClimate: "Arid to semi-arid; irrigation-dependent",
    population: "600 million"
  },
  europe: {
    name: "Europe",
    countries: ["FRA","DEU","ESP","ITA","GBR","POL","UKR","ROU","NLD","SWE","NOR","FIN","DNK","BEL","AUT","CHE","CZE","SVK","HUN","PRT","IRL","GRC","BGR","HRV","SRB","BIH","ALB","MKD","MNE","SVN","EST","LVA","LTU","BLR","MDA","ISL","LUX"],
    center: [50, 10], zoom: 4,
    currentClimate: "Temperate maritime to continental; highly mechanized agriculture",
    population: "450 million"
  },
  north_america: {
    name: "North America",
    countries: ["USA","CAN","MEX","GTM","BLZ","SLV","HND","NIC","CRI","PAN","CUB","HTI","DOM","JAM","TTO","BHS","BRB","GRD","ATG","DMA","KNA","LCA","VCT"],
    center: [40, -100], zoom: 3,
    currentClimate: "Diverse; from arctic to tropical. Industrial farming dominates",
    population: "580 million"
  },
  south_america: {
    name: "South America",
    countries: ["BRA","ARG","COL","PER","CHL","ECU","VEN","BOL","PRY","URY","GUY","SUR"],
    center: [-15, -60], zoom: 3,
    currentClimate: "Tropical to temperate; major grain and livestock exporter",
    population: "430 million"
  },
  oceania: {
    name: "Oceania",
    countries: ["AUS","NZL","PNG","FJI","SLB","VUT","WSM","TON","FSM","KIR","MHL","PLW","NRU","TUV"],
    center: [-25, 140], zoom: 4,
    currentClimate: "Arid interior, temperate coasts; drought-prone",
    population: "45 million"
  },
  central_asia: {
    name: "Central Asia & Russia",
    countries: ["RUS","KAZ","UZB","TKM","KGZ","TJK","GEO","ARM","AZE"],
    center: [50, 65], zoom: 3,
    currentClimate: "Continental steppe; wheat belt expanding northward",
    population: "220 million"
  }
};

// ---------------------------------------------------------------------------
// Build a reverse lookup: country ISO3 -> region key
// ---------------------------------------------------------------------------
APP_DATA.countryToRegion = {};
Object.entries(APP_DATA.regions).forEach(([regionKey, region]) => {
  region.countries.forEach(iso => {
    APP_DATA.countryToRegion[iso] = regionKey;
  });
});

// ---------------------------------------------------------------------------
// Crops
// Yield changes at [+1C, +2C, +3C, +4C, +5C] relative to pre-industrial
// Based on IPCC AR6 WGII Chapter 5, SRCCL Figure 5.2, meta-analyses
// ---------------------------------------------------------------------------
APP_DATA.crops = {
  wheat: {
    name: "Wheat",
    icon: "\u{1F33E}",
    category: "crop",
    description: "The world's most widely grown cereal, a staple for 2.5 billion people. Sensitive to high temperatures during grain filling.",
    optimalTemp: { min: 12, max: 25 },
    criticalMax: 32,
    criticalNote: "Grain filling stops above 32\u00B0C; each degree above optimal reduces yield ~6%",
    waterSensitivity: "moderate",
    globalProduction: "780 million tonnes/year",
    topProducers: ["CHN","IND","RUS","USA","FRA","CAN","UKR","PAK","DEU","ARG"],
    yieldChange: {
      south_asia:          [-4, -10, -20, -32, -45],
      southeast_asia:      [-3, -8,  -16, -26, -38],
      east_asia:           [+2, -2,  -10, -20, -33],
      sub_saharan_africa:  [-5, -13, -24, -38, -50],
      north_africa_mena:   [-5, -12, -22, -35, -48],
      europe:              [+3, +2,  -5,  -15, -28],
      north_america:       [+2, 0,   -8,  -18, -30],
      south_america:       [-2, -6,  -14, -24, -36],
      oceania:             [-4, -10, -19, -30, -42],
      central_asia:        [+4, +3,  -3,  -12, -24]
    },
    productionShift: "Wheat belts shift poleward 150-300 km per degree of warming. Canada, Scandinavia, and Russia gain new arable land while South Asia, North Africa, and Australia face severe declines. By +3\u00B0C, the Indo-Gangetic Plain\u2014which feeds 900 million people\u2014could lose 20-25% of wheat output.",
    adaptations: "Heat-tolerant varieties, shifting planting dates earlier, supplemental irrigation, moving to higher elevations"
  },

  rice: {
    name: "Rice",
    icon: "\u{1F35A}",
    category: "crop",
    description: "Staple food for over 3.5 billion people, predominantly grown in flooded paddies across Asia. Highly sensitive to heat during flowering.",
    optimalTemp: { min: 22, max: 30 },
    criticalMax: 35,
    criticalNote: "Spikelet sterility above 35\u00B0C during flowering; nighttime temps above 26\u00B0C reduce grain quality",
    waterSensitivity: "very high",
    globalProduction: "520 million tonnes/year",
    topProducers: ["CHN","IND","IDN","BGD","VNM","THA","MMR","PHL","BRA","JPN"],
    yieldChange: {
      south_asia:          [-3, -8,  -17, -28, -40],
      southeast_asia:      [-2, -7,  -15, -25, -38],
      east_asia:           [+1, -3,  -10, -20, -32],
      sub_saharan_africa:  [-5, -12, -22, -35, -48],
      north_africa_mena:   [-4, -10, -20, -32, -45],
      europe:              [+3, +2,  -4,  -14, -26],
      north_america:       [+2, 0,   -8,  -18, -30],
      south_america:       [-2, -6,  -14, -24, -36],
      oceania:             [-3, -8,  -16, -27, -40],
      central_asia:        [+3, +1,  -6,  -16, -28]
    },
    productionShift: "The Mekong Delta, which produces ~50% of Vietnam's rice, faces existential threats from saltwater intrusion and flooding. Production shifts northward to Manchuria, Hokkaido, and the Russian Far East. In Africa, highland areas in Ethiopia and Kenya become newly viable for rice cultivation.",
    adaptations: "Flood-tolerant and heat-tolerant varieties (e.g., Sub1 rice), alternate wetting-drying irrigation, shifting to dry-season cropping"
  },

  maize: {
    name: "Maize (Corn)",
    icon: "\u{1F33D}",
    category: "crop",
    description: "The world's most produced cereal by volume, used for food, feed, and fuel. Extremely sensitive to drought stress during pollination.",
    optimalTemp: { min: 18, max: 33 },
    criticalMax: 38,
    criticalNote: "Pollen viability drops sharply above 35\u00B0C; complete failure above 38\u00B0C during tasseling",
    waterSensitivity: "high",
    globalProduction: "1,150 million tonnes/year",
    topProducers: ["USA","CHN","BRA","ARG","UKR","IND","MEX","IDN","FRA","ZAF"],
    yieldChange: {
      south_asia:          [-3, -7,  -15, -25, -38],
      southeast_asia:      [-2, -6,  -13, -22, -35],
      east_asia:           [+1, -2,  -8,  -17, -28],
      sub_saharan_africa:  [-5, -12, -22, -35, -50],
      north_africa_mena:   [-4, -10, -18, -30, -44],
      europe:              [+2, +1,  -5,  -14, -26],
      north_america:       [+1, -2,  -8,  -16, -28],
      south_america:       [-2, -5,  -12, -22, -34],
      oceania:             [-3, -8,  -16, -26, -38],
      central_asia:        [+3, +2,  -4,  -13, -25]
    },
    productionShift: "The US Corn Belt shifts 150 km northward per degree of warming. Sub-Saharan Africa, where maize is the primary staple for 300 million people, faces the most severe losses. Southern Brazil loses while southern Argentina and Canada gain.",
    adaptations: "Drought-tolerant GMO varieties, conservation tillage, shifting planting windows, supplemental irrigation"
  },

  soybeans: {
    name: "Soybeans",
    icon: "\u{1FAD8}",
    category: "crop",
    description: "The world's most important oilseed and protein crop. Critical for animal feed and vegetable oil. Moderately heat-tolerant but drought-sensitive.",
    optimalTemp: { min: 20, max: 30 },
    criticalMax: 36,
    criticalNote: "Pod abortion increases above 33\u00B0C; seed quality declines significantly above 36\u00B0C",
    waterSensitivity: "high",
    globalProduction: "370 million tonnes/year",
    topProducers: ["BRA","USA","ARG","CHN","IND","PRY","CAN","UKR","BOL","URY"],
    yieldChange: {
      south_asia:          [-2, -6,  -13, -22, -34],
      southeast_asia:      [-2, -5,  -11, -19, -30],
      east_asia:           [+2, 0,   -6,  -15, -26],
      sub_saharan_africa:  [-4, -10, -18, -30, -42],
      north_africa_mena:   [-3, -8,  -16, -26, -38],
      europe:              [+3, +3,  -2,  -10, -22],
      north_america:       [+2, +1,  -5,  -13, -24],
      south_america:       [-1, -4,  -10, -18, -30],
      oceania:             [-2, -6,  -13, -22, -34],
      central_asia:        [+4, +3,  -2,  -10, -22]
    },
    productionShift: "Brazil's Cerrado, the world's soybean frontier, faces increasing drought risk. Production shifts southward in South America and northward in North America. Russia and Kazakhstan emerge as new soybean regions beyond +2\u00B0C.",
    adaptations: "Drought-tolerant varieties, no-till farming, double-cropping systems, expansion into new temperate zones"
  },

  potatoes: {
    name: "Potatoes",
    icon: "\u{1F954}",
    category: "crop",
    description: "The world's 4th-largest food crop. Uniquely sensitive to high temperatures which halt tuber formation entirely.",
    optimalTemp: { min: 15, max: 20 },
    criticalMax: 29,
    criticalNote: "Tuber initiation stops above 29\u00B0C; every 1\u00B0C above 20\u00B0C reduces tuber yield by ~8%",
    waterSensitivity: "moderate",
    globalProduction: "375 million tonnes/year",
    topProducers: ["CHN","IND","UKR","RUS","USA","DEU","BGD","FRA","NLD","POL"],
    yieldChange: {
      south_asia:          [-5, -12, -22, -35, -48],
      southeast_asia:      [-4, -10, -18, -30, -42],
      east_asia:           [0,  -5,  -12, -22, -35],
      sub_saharan_africa:  [-6, -14, -26, -40, -52],
      north_africa_mena:   [-5, -12, -22, -34, -46],
      europe:              [+2, +1,  -6,  -16, -28],
      north_america:       [+1, -1,  -8,  -18, -30],
      south_america:       [-3, -8,  -16, -26, -38],
      oceania:             [-4, -10, -18, -28, -40],
      central_asia:        [+3, +2,  -4,  -14, -26]
    },
    productionShift: "Potato cultivation shifts dramatically to higher latitudes and altitudes. The Andean highlands, origin of the potato, face severe losses. Northern Europe, Canada, and Russia become prime potato regions. In the tropics, production retreats to mountain areas above 2000m.",
    adaptations: "Heat-tolerant varieties, shifting to cooler growing seasons, high-altitude cultivation, improved storage to reduce post-harvest losses"
  },

  coffee_arabica: {
    name: "Coffee (Arabica)",
    icon: "\u{2615}",
    category: "crop",
    description: "Arabica coffee, which accounts for 60% of global production, is exceptionally climate-sensitive. Requires specific narrow temperature and altitude ranges.",
    optimalTemp: { min: 18, max: 22 },
    criticalMax: 25,
    criticalNote: "Above 23\u00B0C bean quality declines; above 25\u00B0C cherries ripen too fast for flavor development; above 30\u00B0C plants suffer severe stress",
    waterSensitivity: "high",
    globalProduction: "10 million tonnes/year",
    topProducers: ["BRA","VNM","COL","IDN","ETH","HND","IND","UGA","MEX","PER"],
    yieldChange: {
      south_asia:          [-6, -15, -28, -42, -58],
      southeast_asia:      [-5, -13, -25, -40, -55],
      east_asia:           [-2, -8,  -18, -30, -44],
      sub_saharan_africa:  [-8, -18, -32, -48, -62],
      north_africa_mena:   [-6, -14, -26, -40, -55],
      europe:              [0,  -2,  -8,  -18, -30],
      north_america:       [-4, -10, -20, -34, -48],
      south_america:       [-5, -12, -24, -38, -52],
      oceania:             [-4, -10, -20, -32, -46],
      central_asia:        [0,  -3,  -10, -20, -34]
    },
    productionShift: "By +2\u00B0C, up to 50% of current arabica-suitable land becomes unviable. Brazil's major coffee regions (Minas Gerais, S\u00E3o Paulo) shift southward. Ethiopia's coffee forests, the genetic origin of arabica, lose 40-60% suitability. Production moves to higher elevations everywhere, but suitable highland area is limited. Some shift to robusta, which tolerates higher temperatures but commands lower prices.",
    adaptations: "Shade-grown systems, migration to higher altitudes, breeding heat-tolerant cultivars, agroforestry, switching to robusta"
  },

  cocoa: {
    name: "Cocoa",
    icon: "\u{1F36B}",
    category: "crop",
    description: "Grown exclusively in the tropics within 20\u00B0 of the equator. West Africa produces 70% of the world's cocoa. Highly sensitive to temperature and moisture changes.",
    optimalTemp: { min: 21, max: 27 },
    criticalMax: 32,
    criticalNote: "Above 30\u00B0C, pod development impaired; above 32\u00B0C with low humidity causes severe water stress and crop failure",
    waterSensitivity: "very high",
    globalProduction: "5.7 million tonnes/year",
    topProducers: ["CIV","GHA","IDN","ECU","CMR","NGA","BRA","PER","DOM","COL"],
    yieldChange: {
      south_asia:          [-4, -10, -20, -32, -46],
      southeast_asia:      [-3, -8,  -18, -30, -44],
      east_asia:           [-2, -6,  -14, -24, -36],
      sub_saharan_africa:  [-6, -15, -28, -42, -58],
      north_africa_mena:   [-4, -10, -20, -32, -46],
      europe:              [0,  0,   -2,  -6,  -14],
      north_america:       [-3, -8,  -16, -26, -38],
      south_america:       [-3, -8,  -16, -28, -42],
      oceania:             [-3, -8,  -16, -26, -40],
      central_asia:        [0,  -1,  -4,  -10, -20]
    },
    productionShift: "C\u00F4te d'Ivoire and Ghana, producing 60% of global cocoa, face devastating losses beyond +2\u00B0C. The cocoa belt shifts from lowlands (200-400m) to highlands (400-800m), but suitable mountain area in West Africa is limited and often already forested. Indonesia and Ecuador may expand production at higher altitudes.",
    adaptations: "Agroforestry shade systems, drought-tolerant varieties, irrigation investment, relocating to higher altitudes where possible"
  }
};

// ---------------------------------------------------------------------------
// Livestock
// Impact values represent productivity changes (growth, milk, fertility combined)
// Based on Temperature-Humidity Index (THI) research and IPCC WGII
// ---------------------------------------------------------------------------
APP_DATA.livestock = {
  cattle_beef: {
    name: "Cattle (Beef)",
    icon: "\u{1F404}",
    category: "livestock",
    description: "Global beef production is concentrated in the Americas and Oceania. Cattle are moderately heat-sensitive, with reduced feed intake and weight gain under heat stress.",
    thermoneutralZone: { min: 5, max: 25 },
    heatStressOnset: 25,
    criticalTemp: 35,
    criticalNote: "Above 25\u00B0C: reduced feed intake and weight gain. Above 35\u00B0C: severe heat stress, mortality risk. Water needs increase 2-3x.",
    globalProduction: "72 million tonnes/year",
    topProducers: ["USA","BRA","CHN","ARG","AUS","IND","MEX","PAK","RUS","FRA"],
    impacts: {
      south_asia:          [-2, -6,  -12, -22, -35],
      southeast_asia:      [-2, -5,  -11, -20, -32],
      east_asia:           [0,  -3,  -8,  -16, -28],
      sub_saharan_africa:  [-3, -8,  -16, -28, -42],
      north_africa_mena:   [-3, -7,  -14, -25, -38],
      europe:              [+1, -1,  -5,  -12, -22],
      north_america:       [0,  -2,  -7,  -14, -25],
      south_america:       [-2, -5,  -11, -20, -32],
      oceania:             [-2, -6,  -13, -23, -36],
      central_asia:        [+1, 0,   -5,  -13, -24]
    },
    productionShift: "Beef production shifts poleward. Canada, Scandinavia, and Russia gain rangeland viability. Tropical/subtropical ranching becomes marginal beyond +3\u00B0C. Brazilian Cerrado cattle ranching faces compound stress from heat and pasture degradation.",
    adaptations: "Heat-tolerant breeds (Brahman crosses), shade structures, feedlot cooling, shifting grazing to cooler hours, improved pasture species"
  },

  dairy_cows: {
    name: "Dairy Cows",
    icon: "\u{1F42E}",
    category: "livestock",
    description: "Dairy cows are among the most heat-sensitive livestock. Milk production drops measurably above 22\u00B0C and severely above 32\u00B0C. High-producing breeds are most vulnerable.",
    thermoneutralZone: { min: 5, max: 22 },
    heatStressOnset: 22,
    criticalTemp: 32,
    criticalNote: "Above 22\u00B0C: milk yield drops 0.5 kg/day per degree. Above 32\u00B0C: milk drops 10-25%, fertility falls 20-30%, increased mastitis risk.",
    globalProduction: "930 million tonnes milk/year",
    topProducers: ["IND","USA","PAK","CHN","BRA","DEU","RUS","FRA","NZL","GBR"],
    impacts: {
      south_asia:          [-4, -10, -18, -30, -44],
      southeast_asia:      [-3, -8,  -16, -26, -40],
      east_asia:           [-1, -4,  -10, -20, -32],
      sub_saharan_africa:  [-5, -12, -22, -35, -48],
      north_africa_mena:   [-4, -10, -18, -30, -44],
      europe:              [0,  -2,  -7,  -16, -28],
      north_america:       [-1, -3,  -8,  -16, -28],
      south_america:       [-3, -7,  -14, -24, -36],
      oceania:             [-3, -8,  -15, -25, -38],
      central_asia:        [0,  -2,  -6,  -14, -26]
    },
    productionShift: "India, the world's largest milk producer, faces severe declines. European dairy powerhouses (Netherlands, Germany) see increasing summer stress. New Zealand's pastoral dairy model is threatened by drought. Production advantages shift to northern Europe, Canada, and higher-altitude regions.",
    adaptations: "Cooling systems (fans, misters, tunnels), heat-tolerant crossbreeds, nutritional supplements, shifting to indoor systems, genetic selection for heat tolerance"
  },

  poultry: {
    name: "Poultry",
    icon: "\u{1F414}",
    category: "livestock",
    description: "Chickens are particularly heat-vulnerable due to lack of sweat glands. Modern broilers bred for rapid growth are even more susceptible. Egg production also drops sharply with heat.",
    thermoneutralZone: { min: 18, max: 24 },
    heatStressOnset: 28,
    criticalTemp: 35,
    criticalNote: "Above 28\u00B0C: feed intake drops 5% per degree, egg production falls. Above 35\u00B0C: mass mortality events common in broiler houses. Each degree above 32\u00B0C reduces egg production ~7%.",
    globalProduction: "137 million tonnes/year",
    topProducers: ["USA","CHN","BRA","RUS","IND","MEX","JPN","IDN","TUR","ARG"],
    impacts: {
      south_asia:          [-3, -8,  -16, -28, -42],
      southeast_asia:      [-3, -7,  -14, -24, -38],
      east_asia:           [-1, -3,  -9,  -18, -30],
      sub_saharan_africa:  [-4, -10, -20, -32, -46],
      north_africa_mena:   [-3, -8,  -16, -28, -42],
      europe:              [+1, 0,   -5,  -14, -25],
      north_america:       [0,  -2,  -7,  -15, -26],
      south_america:       [-2, -5,  -12, -22, -34],
      oceania:             [-2, -6,  -14, -24, -37],
      central_asia:        [+1, 0,   -4,  -12, -24]
    },
    productionShift: "Poultry production increasingly requires climate-controlled housing, raising costs significantly in tropical regions. Southeast Asian and African smallholder poultry farming faces the greatest disruption. Investment in cooling infrastructure becomes essential globally.",
    adaptations: "Evaporative cooling systems, tunnel ventilation, heat-resistant breeds, adjusted stocking density, nutritional interventions (electrolytes, betaine)"
  },

  pigs: {
    name: "Pigs",
    icon: "\u{1F416}",
    category: "livestock",
    description: "Pigs cannot sweat and rely on behavioral cooling. They are highly sensitive to heat, with reproduction and growth severely impacted above 25\u00B0C.",
    thermoneutralZone: { min: 16, max: 22 },
    heatStressOnset: 25,
    criticalTemp: 33,
    criticalNote: "Above 25\u00B0C: boar fertility drops 50%, sow conception rates fall. Above 33\u00B0C: feed intake drops 40%, severe stress and mortality. Pigs cannot sweat\u2014they are physiologically limited in heat dissipation.",
    globalProduction: "120 million tonnes/year",
    topProducers: ["CHN","USA","DEU","ESP","BRA","RUS","VNM","CAN","POL","FRA"],
    impacts: {
      south_asia:          [-3, -8,  -16, -26, -40],
      southeast_asia:      [-3, -7,  -14, -24, -36],
      east_asia:           [-1, -4,  -10, -20, -32],
      sub_saharan_africa:  [-4, -10, -20, -32, -46],
      north_africa_mena:   [-3, -8,  -16, -26, -40],
      europe:              [0,  -1,  -6,  -14, -26],
      north_america:       [0,  -2,  -7,  -15, -26],
      south_america:       [-2, -5,  -12, -22, -34],
      oceania:             [-2, -6,  -13, -24, -36],
      central_asia:        [+1, 0,   -5,  -13, -24]
    },
    productionShift: "China, producing nearly half the world's pork, faces significant heat challenges in its southern provinces. Production intensifies in climate-controlled indoor facilities but at substantially higher energy and infrastructure costs. Northern China, Canada, and northern Europe gain relative advantage.",
    adaptations: "Sprinkler and drip cooling systems, insulated housing, genetic selection for heat tolerance, reduced stocking in summer, nutritional management"
  },

  sheep_goats: {
    name: "Sheep & Goats",
    icon: "\u{1F411}",
    category: "livestock",
    description: "The most heat-tolerant major livestock. Goats in particular are well-adapted to arid conditions. Critical for food security in semi-arid developing regions.",
    thermoneutralZone: { min: 10, max: 28 },
    heatStressOnset: 30,
    criticalTemp: 38,
    criticalNote: "Above 30\u00B0C: wool quality declines, milk production drops. Above 38\u00B0C: heat stress begins even in these hardy animals. Goats tolerate drought better than sheep.",
    globalProduction: "16 million tonnes meat/year",
    topProducers: ["CHN","AUS","IND","NGA","PAK","IRN","GBR","TUR","SDN","ETH"],
    impacts: {
      south_asia:          [-1, -4,  -9,  -16, -26],
      southeast_asia:      [-1, -3,  -8,  -14, -24],
      east_asia:           [+1, -1,  -5,  -12, -20],
      sub_saharan_africa:  [-2, -6,  -12, -22, -34],
      north_africa_mena:   [-2, -5,  -10, -18, -28],
      europe:              [+2, +1,  -3,  -9,  -18],
      north_america:       [+1, 0,   -4,  -10, -20],
      south_america:       [-1, -3,  -8,  -15, -25],
      oceania:             [-1, -4,  -10, -18, -28],
      central_asia:        [+2, +1,  -3,  -10, -20]
    },
    productionShift: "Sheep and goat herding becomes increasingly important as a climate adaptation strategy, replacing cattle in heat-stressed regions. Australian wool industry faces drought pressure. Goat farming expands in Sub-Saharan Africa as a resilient alternative.",
    adaptations: "Hardy indigenous breeds, rotational grazing, water harvesting, shade provision, integrated crop-livestock systems"
  }
};

// ---------------------------------------------------------------------------
// Production shift arrows for map visualization
// [fromLat, fromLng, toLat, toLng, label]
// ---------------------------------------------------------------------------
APP_DATA.productionShifts = {
  wheat: [
    [28, 77, 50, 70, "Indo-Gangetic \u2192 Kazakhstan/Russia"],
    [35, -100, 52, -105, "US Great Plains \u2192 Canadian Prairies"],
    [48, 2, 60, 15, "W. Europe \u2192 Scandinavia"],
    [30, 31, 50, 30, "N. Africa \u2192 Ukraine"],
    [-33, -60, -45, -68, "Pampas \u2192 Patagonia"]
  ],
  rice: [
    [10, 106, 25, 108, "Mekong Delta \u2192 N. Vietnam/S. China"],
    [25, 85, 45, 130, "Ganges Plain \u2192 Manchuria"],
    [35, 136, 43, 143, "Honshu \u2192 Hokkaido"],
    [7, 80, -2, 37, "Sri Lanka \u2192 E. African highlands"]
  ],
  maize: [
    [40, -90, 50, -100, "US Corn Belt \u2192 S. Canada"],
    [-5, 35, 0, 37, "E. Africa lowlands \u2192 highlands"],
    [-15, -48, -30, -55, "Cerrado \u2192 S. Brazil/Argentina"],
    [35, 115, 45, 125, "N. China Plain \u2192 Manchuria"]
  ],
  soybeans: [
    [-15, -48, -30, -58, "Cerrado \u2192 S. Brazil/Argentina"],
    [40, -90, 50, -100, "US Midwest \u2192 S. Canada"],
    [35, 118, 50, 70, "E. China \u2192 Central Asia"]
  ],
  potatoes: [
    [28, 77, 55, 40, "N. India \u2192 Russia"],
    [50, 10, 62, 25, "C. Europe \u2192 Scandinavia/Finland"],
    [-15, -70, -35, -70, "Andes low \u2192 Andes high"]
  ],
  coffee_arabica: [
    [-20, -45, -25, -50, "Minas Gerais \u2192 Paran\u00E1/S. Paulo south"],
    [7, 38, 2, 35, "Ethiopian highlands shift upslope"],
    [7, -73, 15, -87, "Colombia \u2192 Mexico highlands"],
    [-5, 110, -3, 120, "Java lowlands \u2192 Sulawesi highlands"]
  ],
  cocoa: [
    [7, -5, 5, 10, "Ivory Coast \u2192 Cameroon highlands"],
    [7, -1, 0, 30, "Ghana \u2192 E. African highlands"],
    [-2, 110, -3, 120, "Sumatra \u2192 Sulawesi"]
  ],
  cattle_beef: [
    [-15, -48, -35, -58, "Cerrado \u2192 S. Brazil/Uruguay"],
    [35, -100, 52, -110, "US Plains \u2192 Canadian Prairies"],
    [-25, 135, -38, 145, "Central AU \u2192 SE Australia"]
  ],
  dairy_cows: [
    [28, 77, 55, 40, "India \u2192 Russia"],
    [52, 5, 62, 15, "Netherlands \u2192 Scandinavia"],
    [-38, 175, -45, 170, "NZ North \u2192 NZ South"]
  ],
  poultry: [
    [10, 78, 30, 70, "S. India \u2192 N. India/Pakistan"],
    [0, 30, 10, 38, "Equatorial Africa \u2192 E. African highlands"]
  ],
  pigs: [
    [25, 110, 45, 125, "S. China \u2192 N. China/Manchuria"],
    [40, -85, 50, -95, "US Midwest \u2192 S. Canada"]
  ],
  sheep_goats: [
    [-30, 140, -38, 148, "Inland AU \u2192 Coastal AU"],
    [10, 0, 5, 10, "Sahel \u2192 Coastal W. Africa"]
  ]
};

// ---------------------------------------------------------------------------
// Global temperature scenarios and timelines (IPCC SSP pathways)
// ---------------------------------------------------------------------------
APP_DATA.scenarios = {
  1: { label: "+1\u00B0C", yearRange: "2020\u20132040", ssp: "SSP1-2.6 (best case)", color: "#ffd93d" },
  2: { label: "+2\u00B0C", yearRange: "2040\u20132060", ssp: "SSP2-4.5 (moderate)", color: "#ff9f43" },
  3: { label: "+3\u00B0C", yearRange: "2060\u20132080", ssp: "SSP3-7.0 (high)", color: "#ee5a24" },
  4: { label: "+4\u00B0C", yearRange: "2080\u20132100", ssp: "SSP5-8.5 (very high)", color: "#e74c3c" },
  5: { label: "+5\u00B0C", yearRange: "2100+", ssp: "SSP5-8.5 (extreme)", color: "#c0392b" }
};

// ---------------------------------------------------------------------------
// Color scale for choropleth map
// ---------------------------------------------------------------------------
APP_DATA.getImpactColor = function(value) {
  if (value === null || value === undefined) return '#444466';
  if (value > 5)   return '#1a9850';
  if (value > 2)   return '#66bd63';
  if (value > 0)   return '#a6d96a';
  if (value > -5)  return '#fee08b';
  if (value > -10) return '#fdae61';
  if (value > -15) return '#f46d43';
  if (value > -25) return '#d73027';
  if (value > -40) return '#a50026';
  return '#67001f';
};

APP_DATA.getImpactLabel = function(value) {
  if (value === null || value === undefined) return 'No data';
  if (value > 5)   return 'Strong gain';
  if (value > 0)   return 'Slight gain';
  if (value > -5)  return 'Minimal impact';
  if (value > -10) return 'Moderate decline';
  if (value > -15) return 'Significant decline';
  if (value > -25) return 'Severe decline';
  if (value > -40) return 'Critical decline';
  return 'Catastrophic decline';
};
