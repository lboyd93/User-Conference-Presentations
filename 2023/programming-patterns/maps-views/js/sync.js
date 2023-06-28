function syncViews(sceneView, mapView) {
	// Logic to sync the views
	const views = [sceneView, mapView];
	let active;
	const sync = (source) => {
		if (!active || !active.viewpoint || active !== source) {
			return;
		}
		for (const view of views) {
			if (view !== active) {
				view.viewpoint = active.viewpoint;
			}
		}
	};
	for (const view of views) {
		view.watch(["interacting", "animation"], () => {
			active = view;
			sync(active);
		});
		view.watch("viewpoint", () => sync(view));
	}
}
