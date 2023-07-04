require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Expand",
	"esri/popup/content/MediaContent",
], (WebMap, MapView, Legend, Expand, MediaContent) => {
	const panel = document.getElementById("info-div");
	const saveBtn = document.getElementById("save-button");
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
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");
	view.ui.add(
		new Expand({ content: panel, expandIcon: "save", view }),
		"top-right"
	);

	// After the webmap loads, access the first layer's content.
	webmap.when(() => {
		const uniLayer = webmap.layers.at(0);
		uniLayer.popupTemplate.outFields = ["*"];
		const content = uniLayer.popupTemplate.content;
		// Create a new MediaContent item to display a pie chart.
		const mediaContent = new MediaContent({
			mediaInfos: [
				{
					title: "Enrollment 2019-2020",
					caption:
						"Part time vs full time enrollment for the 2019-2020 school year.",
					type: "pie-chart",
					value: {
						fields: ["FT_ENROLL", "PT_ENROLL"],
					},
				},
			],
		});
		// Add the new content to the current popup.
		content.push(mediaContent);

		// Add an event handler to the save button.
		saveBtn.addEventListener("click", saveWebmapAs);
	});

	// Function to save a copy with the new popup.
	function saveWebmapAs() {
		const alertSuccess = document.getElementById("alert-success");
		const alertFail = document.getElementById("alert-fail");
		let failMessage = document.getElementById("fail-message");
		let successMessage = document.getElementById("success-message");
		const webmapTitle = document.getElementById("webmap-title");

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
});
