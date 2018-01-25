/* Model */
var initData = [
  {
    title: 'Museum of Islamic Art',
    location: {lat: 30.0444, lng: 31.2524},
    id: 1
  },
  {
    title: 'Cairo Citadel',
    location: {lat: 30.0299, lng: 31.2611},
    id: 2
  },
  {
    title: 'Mosque-Madrassa of Sultan Hassan',
    location: {lat: 30.0323, lng: 31.2562},
    id: 3
  },
  {
    title: 'The Hanging Church',
    location: {lat: 30.0053, lng: 31.2302},
    id: 4
  },
  {
    title: 'Maimonides Synagogue',
    location: {lat: 30.0509, lng: 31.2626},
    id: 5
  }
];



function initMap() {


    function setMap(callback) {
        map = new google.maps.Map(document.getElementById('map'), {
            center:{ lat: 30.0444, lng: 31.2357 },
            zoom: 13
        });

        callback();
    }

    // call setMap and, after map is rendered, call Knockout bindings via new MyApp()
    setMap(function() {
        ko.applyBindings(new ViewModel());
    });
}
/* ViewModel */
var ViewModel = function() {
    var self = this;
    var markers = [];
    var message;
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
   
    self.query = ko.observable('');
    self.showMarker = function(clickeditem){
        // console.log(self.filteredList().length);
        for (var i = 0; i < markers.length; i++) {
          if(markers[i].id == clickeditem.id ){
            populateInfoWindow(markers[i], largeInfowindow);
          }
     }
}
    self.filteredList = ko.computed(function() {
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(initData, function(item) {
            return item.title.toLowerCase().indexOf(search) >= 0;
        });
});
       

        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < self.filteredList().length; i++) {

          // Get the position from the location array.
          var position = self.filteredList()[i].location;
          var title = self.filteredList()[i].title;
          var id = self.filteredList()[i].id;
          // Create a marker per location, and put into markers array.
           var marker = new google.maps.Marker({
            map:map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: id
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);

          });
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
          var wikiRequestTimeout = setTimeout(function(){

           infowindow.setContent('<div id='+marker.id+'>' + marker.title + '</div><p>wikipedia failed,Try again later!</p>');
            },2000)
          var wikiURL = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+marker.title+"&format=json&callback=wikiCallback";
          $.ajax({
            url: wikiURL,
            dataType: "jsonp",
            success: function( response ){
            var list = response[1];
            var link = "https://en.wikipedia.org/wiki/"+list[0];
            infowindow.setContent('<div id='+marker.id+'>' + marker.title + '</div><br/><a href="'+link+'" target="_blank">read more about this place!</h1>');
            clearTimeout(wikiRequestTimeout);
         }
        });
          
          infowindow.open(map, marker);
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
          marker.setAnimation(null);
             }, 1400);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      }

      self.locationForFilteredList = function (){


        for (var i = 0; i < markers.length; i++) {

            markers[i].setMap(null);
            for (var j = 0; j< self.filteredList().length; j++){

               if (self.filteredList()[j].id == markers[i].id){
                     markers[i].setMap(map);

                    console.log('MATCH !!! for marker'+ markers[i].id + 'for list'+self.filteredList()[j].id)
                }
            }
          
        }

      }
}


