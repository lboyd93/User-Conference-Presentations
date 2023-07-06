require(["esri/WebMap", "esri/views/MapView", "esri/widgets/Legend"], (
	WebMap,
	MapView,
	Legend
) => {
	const webmap = new WebMap({
		portalItem: {
			// autocasts as new PortalItem()
			id: "e978148d29d54ca68e2711e60a928a6b",
		},
	});
	const view = new MapView({
		container: "viewDiv",
		map: webmap,
	});
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");
});
