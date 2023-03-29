// Use this link to get the GeoJSON data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Create data markers that reflect the depth of the earthquake by their color
// Earthquakes with greater depth should appear darker in color (scale is green is shallower to red as darker)
function depthColor(depth) {
  if (depth >= 90) return "#FA0505";
  else if (depth >= 70) return "#F55B1D";
  else if (depth >= 50) return "#F59205";
  else if (depth >= 30) return "#FFCC00";
  else if (depth >= 10) return "#AEFF00";
  else if (depth >= -10) return "#00FF1A"; 
}

// Create data markers that reflect the magnitude of the earthquake by their size
// Earthquakes with higher magnitudes should appear larger
function magSize(magnitude) {
  return magnitude * 8000;
};

function createFeatures(earthquakeData) {

  // Create popups that provide additional information about the earthquake when the marker is clicked
  // Must show at least magnitude, location and depth
  // I added pop ups to capture the place, magnitude, lat/long, depth and date
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Type: ${feature.geometry.type}</p><p>Magnitude: ${feature.properties.mag}</p><p>Latitude, Longitude: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}</p><p>Depth: ${feature.geometry.coordinates[2]}</p><p>Date: ${new Date(feature.properties.time)}</p>`);
  }

  // Variable for earchquakes for coordinates, popups and marker info
  var earthquakes = L.geoJSON(earthquakeData, {
    // Binding a popup to each layer
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, coords) {
      // Create marker style - showing magnitude higher magnitude earthquakes with larger markers and showing the depth with the color scale established above
      var style = {
        radius: magSize(feature.properties.mag),
        color: "black",
        weight: 0.25,
        fillColor: depthColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.9,
      } 
      return L.circle(coords, style);
    }
  });
  
  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}
   
function createMap(earthquakes) {
  
  // Create the base layer
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [44.22, -114.94],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Create a legend to display information about our map
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
      // Set legend variables
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [-10, 10, 30, 50, 70, 90],
          labels = [];
          legendTitle = "<h2>Depth: </h2>";

          div.innerHTML = legendTitle;
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  };
  
  // Adding the legend to the map
  legend.addTo(myMap);
};

// Some code copied over from activity files from class activities then edited for this project
// Some code copied over from leafletjs.com (resource provided from class activity files) then edited for this project