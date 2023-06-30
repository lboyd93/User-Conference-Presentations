require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Search",
], (WebMap, MapView, Legend, Search) => {
	// Get the webmap via ID and add it to the View.
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

	// Get the layer to update when the webmap loads.
	webmap.when(() => {
		const uniLayer = webmap.layers.at(0);
		uniLayer.popupTemplate.outFields = ["*"];

		// Check the array of popup template content for a media element
		// and modify it by adding a title.
		uniLayer.popupTemplate.content.forEach((content) => {
			if (content.type === "media") {
				content.mediaInfos[0].caption =
					"Artist: {Artist} circa {Year_installed}";
			}
		});

		// Create a layer search source for the Search and Directions widgets.
		const layerSearchSource = {
			layer: uniLayer,
			searchFields: ["NAME"],
			displayField: "NAME",
			exactMatch: false,
			outFields: ["*"],
			name: "College",
			placeholder: "Search for a college",
		};

		// Add the custom Search widget to the popup.
		addCustomContent(uniLayer, layerSearchSource);
	});

	// Creates a search widget with the art layer as the source
	// then adds that to a custom content element.
	function addCustomContent(featureLayer, layerSearchSource) {
		const search = new Search({
			view: view,
			includeDefaultSources: false,
			locationEnabled: false,
			popupEnabled: true,
			searchAllEnabled: false,
			suggestionsEnabled: true,
			sources: [layerSearchSource],
		});
		const searchContent = {
			type: "custom",
			outFields: ["*"],
			creator: (event) => {
				return search;
			},
		};

		// Add this custom content to the top of the popup.
		featureLayer.popupTemplate.content.unshift(searchContent);
	}
});
