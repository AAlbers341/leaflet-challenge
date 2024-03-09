// Endpoint from GeoJSON API
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + "Time: " + new Date(feature.properties.time) +
            "</p><p>" + "Magnitude: " + (feature.properties.mag));
    }

    // Function to assign radius of earthquake by magnitude
    function markerSize(magnitude) {
        return magnitude * 10000;
    }
    // Function to assign color by depth value
    function markerColor(depth) {
        if (depth > 90) {
            return "#ff0000"; // Red
        } else if (depth > 70 && depth <= 90) {
            return "#ff4d00"; // Orange
        } else if (depth > 50 && depth <= 70) {
            return "#ff9900"; // Orange-Yellow
        } else if (depth > 30 && depth <= 50) {
            return "#ffcc00"; // Yellow
        } else if (depth > 10 && depth <= 30) {
            return "#ccff00"; // Green-Yellow 
        } else {
            return "#00ff00"; // Green
        }
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (earthquakeData, latlng) {
            return L.circle(latlng, {
                radius: markerSize(earthquakeData.properties.mag),
                color: "black", 
                fillColor: markerColor(earthquakeData.geometry.coordinates[2]), 
                fillOpacity: .9,
            });
        },
        onEachFeature: onEachFeature
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
      };
    
    // Create overlay object to hold our overlay layer
    let overlayMaps = {
        Earthquakes: earthquakes
    };
    // Create our map, giving it the lightmap and earthquakes layers to display on load
    let myMap = L.map("map", {
        center: [36.1699, -115.1398],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add Legend
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function (myMap) {
        let div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Depth</h4>";
        div.innerHTML += '<i style="background: #00ff00"></i><span>-10 - 10</span><br>';
        div.innerHTML += '<i style="background: #ccff00"></i><span>10-30</span><br>';
        div.innerHTML += '<i style="background: #ffcc00"></i><span>30-50</span><br>';
        div.innerHTML += '<i style="background: #ff9900"></i><span>50-70</span><br>';
        div.innerHTML += '<i style="background: #ff4d00"></i><span>70-90</span><br>';
        div.innerHTML += '<i style="background: #ff0000""></i><span>90+</span><br>';
    
        return div;
    };
    
    legend.addTo(myMap);
};