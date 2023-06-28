require([
	"esri/Map",
	"esri/views/MapView",
	"esri/views/SceneView",
	"esri/WebMap",
], (Map, MapView, SceneView, WebMap) => {
	// Create a new map instance
	const map = new Map({
		// ArcGIS Organization basemap
		basemap: "topo-vector",
	});

	// Webmap URL: https://jsapi.maps.arcgis.com/home/item.html?id=96bb2829b1614d8c9cd4433595a079ff
	const webmap = new WebMap({
		portalItem: {
			id: "96bb2829b1614d8c9cd4433595a079ff",
		},
	});
	const sceneView = new SceneView({
		container: "sceneViewDiv",
		map: map,
	});
	const mapView = new MapView({
		container: "mapViewDiv",
		map: map,
		constraints: {
			// Disable zoom snapping to get the best synchronization
			snapToZoom: false,
		},
	});
	// Function to sync the views interaction
	syncViews(sceneView, mapView);
});
