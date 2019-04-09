(function($){
  $(function(){

    $('.sidenav').sidenav();
	$('#mapa').hide();
  }); // end of document ready
})(jQuery); // end of jQuery name space

var contenido_itinerario = "";
var direccion = "";
var id_provincia = 0;
var lat;
var lon;

function mostrar_itinerario() {
	if (id_provincia != 0) calcular_itinerario(null);
	else if ($('#direccion').val() == undefined || $('#direccion').val() == "") M.toast({html: 'Debe introducirse una dirección de salida.'});
	else geocode(platform,$('#direccion').val());	
}

function calcular_itinerario(locations) {
	
	var ids_provincias_minube = {"A Coruña":989,"Lugo":1016,"Ourense":1023,"Pontevedra":1025};
	if (id_provincia == 0) id_provincia = ids_provincias_minube[locations[0].location.address.county];
	if (direccion == "" ) direccion = locations[0].location.address.label;
	//locations[0].location.displayPosition.latitude
	var cat = -1;
	for (var i in params) {
		if (params[i].pattern == "ADF") {
			cat = params[i].category_id;
		}			
	}
	if (lat == null) {
		lat = locations[0].location.displayPosition.latitude;
		lon = locations[0].location.displayPosition.longitude;
	}
	var dist = 1000;
	var api_key = 'V8p7DUAN3G3mwh5H';
	console.log("minube_proxy.php?url="+encodeURIComponent("http://papi.minube.com/pois?lang=es&country_id=63&zone_id="+id_provincia+"&subcategory_id="+cat+"&latitude="+lat+"&longitude="+lon+"&max_distance="+dist+"&min_distance=0&page=0&api_key="+api_key));
	$.get( "minube_proxy.php?url="+encodeURIComponent("http://papi.minube.com/pois?lang=es&country_id=63&zone_id="+id_provincia+"&subcategory_id="+cat+"&latitude="+lat+"&longitude="+lon+"&max_distance="+dist+"&min_distance=0&page=0&api_key="+api_key))
	.done(function(data) {
		var contenido_itinerario = '<div class="row"><div class="col s12"><div class="route-header">Itinerario desde '+direccion+'<div></div></div>';
		var pois = data;
		if (data.length == 0) {
			contenido_itinerario += '<div class="row"><div class="col s12 center"><h5>Lo siento, no se han encontrado puntos de interés en la ubicación indicada</h5></div>';
		}else contenido_itinerario += '<a href="javascript:void(0);" onclick="mostrar_mapa()" class="btn-floating btn-large waves-effect waves-light cyan darken-3 right map-button pulse"><i class="material-icons">map</i></a>';

		cont = 0;
		for (var j in pois) {
			cont++;
			contenido_itinerario += '<div class="row">';
			contenido_itinerario += '	  <div class="col s2 center route-line"><div class="route-number">'+cont+'</div></div>';
			contenido_itinerario += '	  <div class="col s5 center"><div class="route-title">'+pois[j].name+'</div></div>';
			contenido_itinerario += '	  <div class="col s5 center"><img src="'+pois[j].picture_url+'" class="z-depth-3" style="max-width: 100%"/></div>';
			contenido_itinerario += '	</div>';
			console.log(pois[j].name+" lat: "+pois[j].latitude+", lon: "+pois[j].longitude);
		}
		$('#contenido').html(contenido_itinerario);
		//id_provincia = 0;
		//direccion = "";
		//lat = null;
	})
	.fail(function() {
		var contenido_itinerario = '<div class="row"><div class="col s12"><div class="route-header red-text">Error buscando puntos de interés!<div></div></div>';
		$('#contenido').html(contenido_itinerario);	
		id_provincia = 0;
		direccion = "";
		lat = null;		
	})	
}

var contenido_mapa = "";

function mostrar_mapa() {
	if (contenido_mapa == undefined || contenido_mapa == "") {
		var contenido_mapa =  `
			 <a href="javascript:void(0);" onclick="mostrar_itinerario()" class="btn-floating btn-large waves-effect waves-light cyan darken-3 right map-button pulse"><i class="material-icons">timeline</i></a>			
			<div id="map" style="width: 100%; height: 350px; background: grey"></div>
			<div id="panel" style="width: 100%;"></div>			
			<!-- <script type="text/javascript" src='js/app.js'></script> -->
		`;
		$('#contenido').html(contenido_mapa);
		/////////////////////////////////////////////////////////////
		// set up containers for the map  + panel
		mapContainer = document.getElementById('map'),
		  routeInstructionsContainer = document.getElementById('panel');

		defaultLayers = platform.createDefaultLayers();

		//Step 2: initialize a map - this map is centered over Berlin
		map = new H.Map(mapContainer,
		  defaultLayers.normal.map,{
		  center: {lat:42.22133, lng:-8.73334},
		  zoom: 13
		});

		//Step 3: make the map interactive
		// MapEvents enables the event system
		// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
		behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

		// Create the default UI components
		ui = H.ui.UI.createDefault(map, defaultLayers);

		/////////////////////////////////////////////////////////////////

		calculateRouteFromAtoB(platform);
	}else {
		$('#contenido').html(contenido_mapa);
		calculateRouteFromAtoB(platform);
	}
}