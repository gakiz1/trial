window.onload = function() {
	
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();
	var input =JSON.parse(window.localStorage.getItem("triproute"));
    var latlng = new google.maps.LatLng(parseFloat(input.origin.latitude), parseFloat(input.origin.longitude));
	var destlatlng = new google.maps.LatLng(parseFloat(input.destination.latitude), parseFloat(input.destination.longitude));
	var waypoints =new Array();
	 var start = new Array();
    start[0] = latlng;
	var end = new Array();
	end[0] = destlatlng;
	var i =0;
	for (var i =0; i<input.waypoints.length;i++){
		waypoints[i]={};
		waypoints[i].location = new google.maps.LatLng(parseFloat(input.waypoints[i].latitude), parseFloat(input.waypoints[i].longitude));
		end[i+1] = new google.maps.LatLng(parseFloat(input.waypoints[i].latitude), parseFloat(input.waypoints[i].longitude));
		
	}
    var map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
	 directionsDisplay.setMap(map);
	 var request = { 
			origin: latlng,
			destination: destlatlng,
			waypoints: waypoints,
		provideRouteAlternatives: false,
		travelMode: 'DRIVING',
		unitSystem: google.maps.UnitSystem.METRIC 
};
	  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });

   var distanceFromOrigin = new Array();
   var distanceService = new google.maps.DistanceMatrixService();
     distanceService.getDistanceMatrix({
        origins: start,
        destinations: end,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: true,
        avoidHighways: false,
        avoidTolls: false
    },
    function (response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
            console.log('Error:', status);
        } else {
       
			for(var j=0;j<response.rows[0].elements.length;j++){
				distanceFromOrigin[j] = response.rows[0].elements[j].distance.value;
				
			}
			
           
        }
    });

    var marker = new google.maps.Marker({
        position: latlng,
        map: directionsDisplay.getMap(),
        title: 'Set lat/lon values for this property',
        draggable: true,
		icon:"truck.jpg"
    });
  var neareststore;
    google.maps.event.addListener(marker, 'click', function(a) {
		var current = new Array();
		var loc =new google.maps.LatLng(parseFloat(a.latLng.lat()), parseFloat(a.latLng.lng()))
		current[0]=loc;
		 distanceService.getDistanceMatrix({
        origins: start,
        destinations: current,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: true,
        avoidHighways: false,
        avoidTolls: false
    },
    function (response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
            console.log('Error:', status);
        } else {
				var currentDistance = response.rows[0].elements[0].distance.value;
				neareststore =nearestStore(distanceFromOrigin,currentDistance);
				   
        }
		var heading = end[neareststore].lat();
		var endPoint = google.maps.geometry.spherical.computeOffset(loc, 100000, heading);
	 createHtml(loc,"temp1", "<h2>The Temparature at current location : </h2><br/>" ) ;
	 createHtml(endPoint,"temp2", "<h2>The Temparature at 100 KM from here : </h2><br/>" ) ;
	 createHtml(end[neareststore],"temp3", "<h2>The Temparature at nearest store : </h2><br/>") ;
	
	 });	
});




};

function nearestStore(storedistances,current){
	 var k =0;
	for(var j=1;j<storedistances.length;j++){
		if(current<storedistances[j] && storedistances[j]<storedistances[k]){
			k=j;
		}
	}
	return k;
}

function createHtml(a,b,c){ 
	
		
	$.ajax({
  dataType: "json",
  url: "http://api.openweathermap.org/data/2.5/weather?lat="+a.lat()+"&lon="+a.lng()+"&units=metric&APPID=5ae2143ccdf2726af36808b228b539c5",
  async: true, 
  success: function(json) {
     document.getElementById(b).innerHTML =   c + space() + '<img src=http://openweathermap.org/img/w/'+json.weather[0].icon+'.png style="width:128px;height:128px;" > ' +
		' </img> <h2>' +
		json.weather[0].main +'&nbsp;-' + json.weather[0].description +'<br/>' + json.name + '<br/> ' + json.main.temp + '  &#8451;</h2> ';
  }
});

}
function space(){
	return '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
}