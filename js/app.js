/* Model */
var initData = [{
        title: 'Museum of Islamic Art',
        location: { lat: 30.0444, lng: 31.2524 },
        id: 1
    },
    {
        title: 'Cairo Citadel',
        location: { lat: 30.0299, lng: 31.2611 },
        id: 2
    },
    {
        title: 'Mosque-Madrassa of Sultan Hassan',
        location: { lat: 30.0323, lng: 31.2562 },
        id: 3
    },
    {
        title: 'The Hanging Church',
        location: { lat: 30.0053, lng: 31.2302 },
        id: 4
    },
    {
        title: 'Maimonides Synagogue',
        location: { lat: 30.0509, lng: 31.2626 },
        id: 5
    }
];



/* ViewModel */
var ViewModel = function() {
    var self = this;
    var markers = [];
    var message;
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    self.query = ko.observable('');
    self.showMarker = function(clickeditem) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].id == clickeditem.id) {
                populateInfoWindow(markers[i], largeInfowindow);
            }
        }
    };
    self.filteredList = ko.computed(function() {
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(initData, function(item) {
            return item.title.toLowerCase().indexOf(search) >= 0;
        });
    });

    // I had to declare this function outside the loop to avoid JSlint errors  
    callpopulateInfoWindow = function() {
        populateInfoWindow(this, largeInfowindow);
    }

    // The following group uses the filteredList array to create an array of markers on initialize.
    for (var i = 0; i < self.filteredList().length; i++) {

        // Get the position from the location array.
        var position = self.filteredList()[i].location;
        var title = self.filteredList()[i].title;
        var id = self.filteredList()[i].id;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: id
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // add an onclick event to open an infowindow at each marker.
        marker.addListener('click', callpopulateInfoWindow);
        bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            var wikiRequestTimeout = setTimeout(function() {
                infowindow.setContent('<div id=' + marker.id + '>' + marker.title + '</div><p>wikipedia failed,Try again later!</p>');
            }, 2000);
            var wikiURL = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + marker.title + "&format=json&callback=wikiCallback";
            $.ajax({
                url: wikiURL,
                dataType: "jsonp",
                success: function(response) {
                    var list = response[1];
                    var link = "https://en.wikipedia.org/wiki/" + list[0];
                    infowindow.setContent('<div id=' + marker.id + '>' + marker.title + '</div><br/><a href="' + link + '" target="_blank">' +
                        'visit wikipedia for more info!</h1>');
                    clearTimeout(wikiRequestTimeout);
                }
            });

            infowindow.open(map, marker);
            // controlling the timing of the marker's animations is obtained from this repo 
            // https://github.com/jennikins813/Neighborhood-Map/blob/master/js/main.js 
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    }

    self.locationForFilteredList = function() {

        for (var i = 0; i < markers.length; i++) {

            markers[i].setMap(null);
            for (var j = 0; j < self.filteredList().length; j++) {

                if (self.filteredList()[j].id == markers[i].id) {

                    markers[i].setMap(map);
                }
            }

        }

    };
};

/* init function that renders the app */
function initMap() {
    // the content of this function is obtained from this repo 
    //https://github.com/jennikins813/Neighborhood-Map/blob/master/js/main.js 
    function loadMap(loadLocations) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 30.0444, lng: 31.2357 },
            zoom: 13
        });

        loadLocations();
    }

    // load the map and then, ONLY then, load the loacations by calling Knockout bindings via new ViewModel()
    loadMap(function() {
        ko.applyBindings(new ViewModel());
    });
}


function mapError() {

    document.getElementById('map').innerHTML = "There was an error loading the map, please try again later!";
}