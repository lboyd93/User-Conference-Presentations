require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Expand",
	"esri/popup/content/MediaContent",
	"esri/widgets/Search",
], (WebMap, MapView, Legend, Expand, MediaContent, Search) => {
	// UI components
	const panel = document.getElementById("info-div");
	const saveBtn = document.getElementById("save-button");
	const alertSuccess = document.getElementById("alert-success");
	const alertFail = document.getElementById("alert-fail");
	let failMessage = document.getElementById("fail-message");
	let successMessage = document.getElementById("success-message");
	const webmapTitle = document.getElementById("webmap-title");

	// Get the webmap via ID and add it to the View.
	const webmap = new WebMap({
		portalItem: {
			// autocasts as new PortalItem()
			id: "e978148d29d54ca68e2711e60a928a6b",
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

	// Get the layer to update when the webmap loads.
	webmap.when(() => {
		const uniLayer = webmap.layers.at(0);
		uniLayer.popupTemplate.outFields = ["*"];
		const content = uniLayer.popupTemplate.content;
		// Remove the TextContent with enrollment information.
		content.pop();
		// Create a new MediaContent item to display a pie chart.
		const mediaContent = new MediaContent({
			title: "Enrollment 2019-2020",
			mediaInfos: [
				{
					caption:
						"Part time vs full time enrollment (total {TOT_ENROLL}) for the 2019-2020 school year.",
					type: "pie-chart",
					value: {
						fields: ["FT_ENROLL", "PT_ENROLL"],
					},
				},
			],
		});
		// Add the new content to the current popup.
		content.push(mediaContent);
		saveBtn.addEventListener("click", saveWebmapAs);

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

	// Function to save a copy with the new popup.
	function saveWebmapAs() {
		// Create the item from the textbox input.
		const item = {
			title: webmapTitle.value,
		};

		// Call updateFrom to update the webmap.
		webmap.updateFrom(view).then(() => {
			// Call saveAs with the item information.
			webmap
				.saveAs(item)
				.then((savedItem) => {
					// If the item saved successfully, display a success alert with a link to the item page.
					const itemPageUrl = `${savedItem.portal.url}/home/item.html?id=${savedItem.id}`;
					const link = `<a target="_blank" href="${itemPageUrl}">${savedItem.title}</a>`;
					successMessage.innerHTML = `<br>Successfully saved as <i>${link}</i>.`;
					alertSuccess.open = true;
				})
				.catch((error) => {
					// If the item didn't save, catch the error and display an alert.
					if (error.name != "identity-manager:user-aborted") {
						failMessage.innerHTML = `Item failed to save.<br><b>Error: ${error}<b>`;
						alertFail.open = true;
					}
				});
		});
	}

	// Add the Legend and the save panel in the Expand widget to the View.
	view.ui.add(new Legend({ view }), "bottom-left");
	view.ui.add(
		new Expand({ content: panel, expandIcon: "save", view }),
		"top-right"
	);
});
