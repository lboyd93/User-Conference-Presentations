require(["esri/WebMap", "esri/views/MapView", "esri/widgets/Legend"], (
	WebMap,
	MapView,
	Legend
) => {
	const webmap = new WebMap({
		portalItem: {
			// autocasts as new PortalItem()
			id: "a28a0c2c2175410d89edadcd437e52e0",
		},
	});
	const view = new MapView({
		container: "viewDiv",
		map: webmap,
	});
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");
});
