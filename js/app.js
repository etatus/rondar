
/**
 * Calculates and displays a walking route from the St Paul's Cathedral in London
 * to the Tate Modern on the south bank of the River Thames
 *
 * A full list of available request parameters can be found in the Routing API documentation.
 * see:  http://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function calculateRouteFromAtoB (platform) {
  var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'shortest;pedestrian',
	  language: 'es-es',
      representation: 'display',
//      waypoint0: '42.430847884649,-8.648626030161', 
//      waypoint1: '42.434915884995,-8.643584001564', 
//      waypoint2: '42.431764617121,-8.648568734382', 
      routeattributes: 'waypoints,summary,shape,legs',
      maneuverattributes: 'direction,action'
    };
	
  for (i in pois_coords) {
	  routeRequestParams["waypoint"+i] = "stopOver!"+pois_coords[i].lat+","+pois_coords[i].lon+";;"+pois_coords[i].name;
  }

  router.calculateRoute(
    routeRequestParams,
    onSuccess,
    onError
  );
}
/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccess(result) {
  var route = result.response.route[0];
 /*
  * The styling of the route response on the map is entirely under the developer's control.
  * A representitive styling can be found the full JS + HTML code of this example
  * in the functions below:
  */
  addRouteShapeToMap(route);
  addManueversToMap(route);

  addWaypointsToPanel(route.waypoint);
  addSummaryToPanel(route.summary);
  addManueversToPanel(route);
  // ... etc.
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function onError(error) {
  alert('Ooops!');
}




/**
 * Boilerplate map initialization code starts below:
 */


//Step 1: initialize communication with the platform
var platform = new H.service.Platform({
  app_id: '<HERE APP ID>',
  app_code: '<HERE APP CODE>',
  useCIT: true,
  useHTTPS: true
});

var mapContainer;
var defaultLayers;
var map;
var behavior;
var ui;

/* // set up containers for the map  + panel
var mapContainer = document.getElementById('map'),
  routeInstructionsContainer = document.getElementById('panel');

var defaultLayers = platform.createDefaultLayers();

//Step 2: initialize a map - this map is centered over Berlin
var map = new H.Map(mapContainer,
  defaultLayers.normal.map,{
  center: {lat:52.5160, lng:13.3779},
  zoom: 13
});

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);
 */

// Hold a reference to any infobubble opened
var bubble;

/**
 * Opens/Closes a infobubble
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text){
 if(!bubble){
    bubble =  new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}


/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route){
  var strip = new H.geo.Strip(),
    routeShape = route.shape,
    polyline;

  routeShape.forEach(function(point) {
    var parts = point.split(',');
    strip.pushLatLngAlt(parts[0], parts[1]);
  });

  polyline = new H.map.Polyline(strip, {
    style: {
      lineWidth: 4,
      strokeColor: 'rgba(0, 128, 255, 0.7)'
    }
  });
  // Add the polyline to the map
  map.addObject(polyline);
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route){
  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
    group = new  H.map.Group(),
    i,
    j;

  // Add a marker for each maneuver
  for (i = 0;  i < route.leg.length; i += 1) {
    for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[j];
      // Add a marker to the maneuvers group
      var marker =  new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude} ,
        {icon: dotIcon});
      marker.instruction = maneuver.instruction;
      group.addObject(marker);
    }
  }

  group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getPosition());
    openBubble(
       evt.target.getPosition(), evt.target.instruction);
  }, false);

  // Add the maneuvers group to the map
  map.addObject(group);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addWaypointsToPanel(waypoints){



  var nodeH5 = document.createElement('h5'),
    waypointLabels = [],
    i;


   for (i = 0;  i < waypoints.length; i += 1) {
    waypointLabels.push(waypoints[i].userLabel)
   }

   nodeH5.textContent = waypointLabels.join(' - ');

  routeInstructionsContainer.innerHTML = '';
  routeInstructionsContainer.appendChild(nodeH5);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(summary){
  var summaryDiv = document.createElement('div'),
   content = '<br/>';
   content += '<b>Distancia total</b>: ' + summary.distance  + ' metros <br/>';
   content += '<b>Tiempo del recorrido</b>: ' + summary.travelTime.toMMSS(); // + ' (in current traffic)';
   content += '<br/>';


  summaryDiv.style.fontSize = 'large';
  summaryDiv.style.marginLeft ='15px';
  summaryDiv.style.marginRight ='15px';
  summaryDiv.innerHTML = content;
  routeInstructionsContainer.appendChild(summaryDiv);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToPanel(route){



  var nodeOL = document.createElement('ol'),
    i,
    j;

  nodeOL.style.fontSize = 'medium';
  nodeOL.style.marginLeft ='15px';
  nodeOL.style.marginRight ='15px';
  nodeOL.className = 'directions';

     // Add a marker for each maneuver
  for (i = 0;  i < route.leg.length; i += 1) {
    for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[j];

      var li = document.createElement('li'),
        spanArrow = document.createElement('span'),
        spanInstruction = document.createElement('span');

      spanArrow.className = 'arrow '  + maneuver.action;
      spanInstruction.innerHTML = maneuver.instruction;
      li.appendChild(spanArrow);
      li.appendChild(spanInstruction);

      nodeOL.appendChild(li);
    }
  }

  routeInstructionsContainer.appendChild(nodeOL);
}


Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutos '; //+ (this % 60)  + ' seg.';
}

// Now use the map as required...
//calculateRouteFromAtoB (platform);


/**
 * Calculates and displays the address details of 200 S Mathilda Ave, Sunnyvale, CA
 * based on a free-form text
 *
 *
 * A full list of available request parameters can be found in the Geocoder API documentation.
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-geocode.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function geocode(platform,direccion) {
  var geocoder = platform.getGeocodingService(),
    geocodingParameters = {
      searchText: direccion,
      jsonattributes : 1
    };

  geocoder.geocode(
    geocodingParameters,
    geo_onSuccess,
    geo_onError
  );
}
/**
 * This function will be called once the Geocoder REST API provides a response
 * @param  {Object} result          A JSONP object representing the  location(s) found.
 *
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-type-response-geocode.html
 */
function geo_onSuccess(result) {
  if (result.response == undefined || result.response.view[0] == undefined) {
	  M.toast({html: 'Dirección no encontrada!<br/>Intenta escribirla de otra forma.'});
	  $('#calculate-button').show();
	  $('#loading').hide();
  } else {
	  var locations = result.response.view[0].result;
	  calcular_itinerario(locations);
  }
 /*
  * The styling of the geocoding response on the map is entirely under the developer's control.
  * A representitive styling can be found the full JS + HTML code of this example
  * in the functions below:
  */
  //addLocationsToMap(locations);
  //addLocationsToPanel(locations);
  // ... etc.
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function geo_onError(error) {
  //alert('Ooops!');
   M.toast({html: 'Ocurrió un error validando la dirección. Por favor, pruebe otra vez.'});
   $('#calculate-button').show();
   $('#loading').hide();
}

/*
 * Note that the places module https://js.api.here.com/v3/3.0/mapsjs-places.js
 * must be loaded to use the Places API endpoints
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function placesNearby(platform,lat,lon) {
  var here = new H.places.Here(platform.getPlacesService());
  // List of parameters passed to the Explore entrypoint
  var params = {
    'at': lat+","+lon //'42.2833337,-8.743231999999999'
  };
  // Creating a here request with parameters and callbacks
  here.request(params, {}, near_onResult, near_onError);
}


/**
 * This function will be called once the Places REST API provides a response
 * @param  {Object} result          A JSONP object representing the  location(s) found.
 *
 * see: http://developer.here.com/rest-apis/documentation/places/topics_api/media-type-search.html
 */
function near_onResult(result) {
  var places = result.results.items;
  if (places.length > 0) {
	  $('#direccion').val(places[0].title);
	  //console.log("places: "+places[0].title);
  }
  /*
   * The styling of the places response on the map is entirely under the developer's control.
   * A representative styling can be found the full JS + HTML code of this example
   * in the functions below:
   */
  //addPlacesToMap(places);
  //addPlacesToPanel(places);
}


/**
 * Boilerplate map initialization code starts below:
 */


/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 *
 * see: http://developer.here.com/rest-apis/documentation/places/topics_api/object-error.html
 */
function near_onError(error) {
  //error = data;
}

/**
 * Moves the map to display over Berlin
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
function moveMapToLocation(map,lat,lon){
  //map.setCenter({lat:52.5159, lng:13.3777});
  map.setCenter({lat:lat, lng:lon});
  map.setZoom(14);
}


/**
 * Adds a  draggable marker to the map..
 *
 * @param {H.Map} map                      A HERE Map instance within the
 *                                         application
 * @param {H.mapevents.Behavior} behavior  Behavior implements
 *                                         default interactions for pan/zoom
 */
function addDraggableMarker(map, behavior, lat, lon){

  var marker = new H.map.Marker({lat:lat, lng:lon});
  // Ensure that the marker can receive drag events
  marker.draggable = true;
  map.addObject(marker);

  // disable the default draggability of the underlying map
  // when starting to drag a marker object:
  map.addEventListener('dragstart', function(ev) {
    var target = ev.target;
    if (target instanceof H.map.Marker) {
      behavior.disable();
    }
  }, false);


  // re-enable the default draggability of the underlying map
  // when dragging has completed
  map.addEventListener('dragend', function(ev) {
    var target = ev.target;
    if (target instanceof mapsjs.map.Marker) {
      behavior.enable();
	  //placesNearby(platform,target.getPosition().lat,target.getPosition().lng);
	  reverseGeocode(platform,target.getPosition().lat,target.getPosition().lng);
    }      
  }, false);

  // Listen to the drag event and move the position of the marker
  // as necessary
   map.addEventListener('drag', function(ev) {
    var target = ev.target,
        pointer = ev.currentPointer;
    if (target instanceof mapsjs.map.Marker) {
      target.setPosition(map.screenToGeo(pointer.viewportX, pointer.viewportY));
    }
  }, false);
}

/**
 * Calculates and displays the address details of the location found at
 * a specified location in Berlin (52.5309°N 13.3847°E) using a 150 meter
 * radius to retrieve the address of Nokia House. The expected address is:
 * Invalidenstraße 116, 10115 Berlin.
 *
 *
 * A full list of available request parameters can be found in the Geocoder API documentation.
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-reverse-geocode.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function reverseGeocode(platform,lat,lon) {
  var geocoder = platform.getGeocodingService(),
    reverseGeocodingParameters = {
      prox: lat+","+lon,//'52.5309,13.3847,150', // Berlin
      mode: 'retrieveAddresses',
      maxresults: '1',
      jsonattributes : 1
    };

  geocoder.reverseGeocode(
    reverseGeocodingParameters,
    rev_onSuccess,
    rev_onError
  );
}

/**
 * This function will be called once the Geocoder REST API provides a response
 * @param  {Object} result          A JSONP object representing the  location(s) found.
 *
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-type-response-geocode.html
 */
function rev_onSuccess(result) {
  var locations = result.response.view[0].result;
  if (locations.length > 0) {
	  $('#direccion').val(locations[0].location.address.label);
	  //$('#direccion').focus();
	  //console.log("places: "+places[0].title);
  }  
 /*
  * The styling of the geocoding response on the map is entirely under the developer's control.
  * A representitive styling can be found the full JS + HTML code of this example
  * in the functions below:
  */
  //addLocationsToMap(locations);
  //addLocationsToPanel(locations);
  // ... etc.
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function rev_onError(error) {
  alert('Ooops!');
}
