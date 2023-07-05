require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/popup/content/MediaContent",
	"esri/widgets/Search",
	"esri/widgets/Directions",
	"esri/widgets/Expand",
	"esri/layers/RouteLayer",
	"esri/rest/support/Stop",
	"esri/core/reactiveUtils",
], (
	WebMap,
	MapView,
	Legend,
	MediaContent,
	Search,
	Directions,
	Expand,
	RouteLayer,
	Stop,
	reactiveUtils
) => {
	// UI Components
	const panel = document.getElementById("info-div");
	const saveBtn = document.getElementById("save-button");
	const alertSuccess = document.getElementById("alert-success");
	const alertFail = document.getElementById("alert-fail");
	let failMessage = document.getElementById("fail-message");
	let successMessage = document.getElementById("success-message");
	const webmapTitle = document.getElementById("webmap-title");

	let directionsWidget;
	let directionsExpand;

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
			name: "Colleges",
			placeholder: "Search for a college",
		};

		// Add the custom Search widget to the popup.
		addCustomContent(uniLayer, layerSearchSource);
		// Add the custom actions to the popup.
		addCustomActions(uniLayer, layerSearchSource);
	});

	// Creates two new custom actions and creates the Directions widget
	function addCustomActions(featureLayer, layerSearchSource) {
		// Add custom actions to popupTemplate
		featureLayer.popupTemplate.actions = [
			{
				id: "open-site",
				className: "esri-icon-public",
				title: "Website",
			},
			{
				id: "directions",
				className: "esri-icon-directions2",
				title: "Get Directions",
			},
		];
		createDirectionsWidget(layerSearchSource);
	}

	// When one of the action buttons are triggered, open the website or Directions widget.
	reactiveUtils.on(
		() => view.popup?.viewModel,
		"trigger-action",
		(event) => {
			const selectedFeature = view.popup.viewModel.selectedFeature;
			if (event.action.id === "open-site") {
				// Get the 'Information' field attribute
				let info = selectedFeature.attributes.WEBSITE;
				// Make sure the 'Information' field value is not null
				if (info) {
					// Open up a new browser using the URL value in the 'Information' field
					info = formatWebsite(info);
					if (info !== "No site") {
						window.open(info.trim());
					}
				}
			} else if (event.action.id === "directions") {
				// Create a new RouteLayer for the Directions widget and add it to the map.
				routeLayer = new RouteLayer();
				directionsWidget.layer = routeLayer;
				view.map.add(routeLayer);
				// Add a stop with the current selected feature and a blank stop.
				const start = new Stop({
					name: selectedFeature.attributes.Title,
					geometry: selectedFeature.geometry,
				});
				const end = new Stop();
				directionsWidget.layer.stops = [start, end];
				// Close the popup and open the directions widget
				view.closePopup();
				directionsExpand.expanded = true;
			}
		}
	);

	// Watch when the directions widget is collapsed and destroy the
	// route layer to remove it from the map and watch
	// when the selected feature changes.
	reactiveUtils.watch(
		() => [directionsExpand?.expanded, view.popup?.selectedFeature],
		([expanded, graphic]) => {
			if (!expanded) {
				directionsWidget.layer.destroy();
			} else {
				view.closePopup();
			}

			if (graphic) {
				// Set the action's visible property to true if the 'website' field value is not null, otherwise set it to false
				const graphicTemplate = graphic.getEffectivePopupTemplate();
				graphicTemplate.actions.items[0].visible =
					graphic.attributes.WEBSITE !== "NOT AVAILABLE" ? true : false;
			}
		}
	);

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

	// Function to create a new Directions widget and add it to the view.
	function createDirectionsWidget(layerSearchSource) {
		// Create a new Route layer and add it to the map
		let routeLayer = new RouteLayer();
		view.map.add(routeLayer);

		// new RouteLayer must be added to Directions widget
		directionsWidget = new Directions({
			view: view,
			layer: routeLayer,
			//apiKey: "ADD API KEY HERE",
			searchProperties: {
				includeDefaultSources: false,
				searchAllEnabled: false,
				sources: [layerSearchSource],
			},
		});

		// Add the Directions widget to Expand and add to the view.
		directionsExpand = new Expand({
			view: view,
			content: directionsWidget,
		});
		view.ui.add(directionsExpand, "top-right");
	}

	// Function to format the website attribute.
	function formatWebsite(website) {
		const https = "https://";
		const https2 = "https://www.";
		const formatSite = https.concat(website);
		const formatSite2 = https2.concat(website);

		if (website.slice(0, 3) === "www" || website.slice(0, 3) === "WWW")
			return formatSite;

		if (website.slice(0, 5) === "https") return website;

		if (website === "NOT AVAILABLE") return "No site";

		if (website === "ww2.mcm.edu") return "https://mcm.edu/";

		return formatSite2;
	}

	// Function to save the webmap to ArcGIS Online.
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
