/* Model */
var initData = [
  {
    title: 'Bronze Horseman',
    location: {lat: 59.936378, lng: 30.30223}
  },
  {
    title: 'Saint Isaac\'s Cathedral',
    location: {lat: 59.933905, lng: 30.306485}
  },
  {
    title: 'Church of the Savior on Blood',
    location: {lat: 59.940100, lng: 30.3289}
  },
  {
    title: 'Hermitage Museum',
    location: {lat: 59.939832, lng: 30.31456}
  },
  {
    title: 'Rostral Columns',
    location: {lat: 59.944682, lng: 30.304971}
  }
];

      var map;
      var markers = [];

      function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 59.942803, lng: 30.324841 },
          zoom: 13,
          mapTypeControl: false
        });

        ko.applyBindings(new ViewModel())

        var largeInfowindow = new google.maps.InfoWindow();
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < ViewModel.List.length; i++) {

          // Get the position from the location array.
          var position = list[i].location;
          var title = list[i].title;
          // Create a marker per location, and put into markers array.
           var marker = new google.maps.Marker({
            map:map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
        }
      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      }

      }
/* ViewModel */
var ViewModel = function() {
    var self = this;
    self.query = ko.observable('sa');
    self.alertHi = function(clickeditem){

        console.log(clickeditem)
    }
    self.List = ko.computed(function() {
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(initData, function(item) {
            return item.title.toLowerCase().indexOf(search) >= 0;
        });
});
}
