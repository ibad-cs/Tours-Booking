// console.log('Hello ');

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaWJhZDI0IiwiYSI6ImNsbDEzaGZvcDBxOHozcHFybmR3aWlva3QifQ.SqKcRBb-FHofleB00MZprg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ibad24/cll17wmaz00b001p854omf6oc',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 4
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add marker on map
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);
    //Extends map bounds
    bounds.extend(loc.coordinates);
  });
  //Fit bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
