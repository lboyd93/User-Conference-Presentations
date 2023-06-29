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
		popup: {
			// Dock the popup and set the breakpoint to
			// false so it always docks.
			dockEnabled: true,
			dockOptions: {
				breakpoint: false,
				position: "bottom-right",
			},
		},
	});
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");

	webmap.when(() => {
		const uniLayer = webmap.layers.at(0);
		uniLayer.popupTemplate.outFields = ["*"];

		uniLayer.popupTemplate.content.forEach((content) => {
			console.log(content);
			// if (content.type === "media") {
			// 	content.mediaInfos[0].caption =
			// 		"Artist: {Artist} circa {Year_installed}";
			// }
		});
	});
});
