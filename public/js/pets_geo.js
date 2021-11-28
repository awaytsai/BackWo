// show map
let map;
let marker;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.042652909381292, lng: 121.56489823950734 },
    zoom: 14,
  });
  addAllMarker();
  map.addListener("dragend", () => {
    // get bounds
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    // render by with in new bounds
    addMarkerByBounds(ne, sw);
  });
}

// show filter map
applyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const kind = document.querySelector(".filterkind").value;
  const county = document.querySelector(".filtercounty").value;
  const district = document.querySelector(".filterdistrict").value;
  const date = document.querySelector("#datepicker").value;
  if (kind && county && district && date) {
    // delete existing markers
    deleteMarkers();
    // add new markers
    filterMapMarker(kind, county, district, date);
  }
});

// add all markers
async function addAllMarker() {
  checkPerson(urlParam);
  const response = await fetch(`/api/get${person}GeoInfo`);
  const findOwnersGeoData = await response.json();
  console.log(findOwnersGeoData);
  addMarker(findOwnersGeoData);
}

// add filter markers
async function filterMapMarker(kind, county, district, date) {
  checkPerson(urlParam);
  const response = await fetch(
    `/api/get${person}GeoInfo?kind=${kind}&county=${county}&district=${district}&date=${date}`
  );
  const filterGeoData = await response.json();
  if (filterGeoData.message == "wrong date format") {
    Swal.fire({
      icon: "info",
      text: `日期無效`,
    });
    return;
  }
  // add new marker
  addMarkerFitBound(filterGeoData);
}

// add markers by bounds
async function addMarkerByBounds(ne, sw) {
  checkPerson(urlParam);
  const response = await fetch(`/api/get${person}GeoInfo?ne=${ne}&sw=${sw}`);
  const findOwnersGeoData = await response.json();
  console.log(findOwnersGeoData);
  addMarker(findOwnersGeoData);
  deleteElement();
  createElement(findOwnersGeoData);
}

function addMarker(data) {
  console.log("add maker");
  console.log(data);
  // update map center
  data.forEach((pet) => {
    const myLatLng = { lat: pet.lat, lng: pet.lng };
    let image =
      "https://cdn1.iconfinder.com/data/icons/animals-109/100/Dog-02_2-48.png";

    if (pet.kind !== "狗") {
      image =
        "https://cdn1.iconfinder.com/data/icons/amenities-solid-ii/48/_cats2-40.png";
    }
    const contentString = `
    <div>
      <a href="/${person}/detail.html?id=${pet.id}">
        <img src="${pet.photo}" width="150px">
      </a>
      <div>品種: ${pet.breed}</div>
      <div>顏色: ${pet.color}</div>
    </div>`;
    // markers
    marker = new google.maps.Marker({
      position: myLatLng,
      map,
      title: pet.breed,
      icon: image,
    });
    // add info window
    addInfoWindow(marker, contentString);
    markers.push(marker);
  });
}

// info window
function addInfoWindow(marker, contentString) {
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
  });
  marker.addListener("click", () => {
    infowindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });
  });
}

function deleteMarkers() {
  const len = markers.length;
  for (i = 0; i < len; i++) {
    markers[i].setMap(null);
  }
}

function addMarkerFitBound(data) {
  var bounds = new google.maps.LatLngBounds();
  // update map center
  data.forEach((pet) => {
    const myLatLng = { lat: pet.lat, lng: pet.lng };
    let image =
      "https://cdn1.iconfinder.com/data/icons/animals-109/100/Dog-02_2-48.png";

    if (pet.kind !== "狗") {
      image =
        "https://cdn1.iconfinder.com/data/icons/amenities-solid-ii/48/_cats2-40.png";
    }
    const contentString = `
    <div>
      <a href="/${person}/detail.html?id=${pet.id}">
        <img src="${pet.photo}" width="150px">
      </a>
      <div>品種: ${pet.breed}</div>
      <div>顏色: ${pet.color}</div>
    </div>`;
    // markers
    marker = new google.maps.Marker({
      position: myLatLng,
      map,
      title: pet.breed,
      icon: image,
    });
    bounds.extend(myLatLng);
    // add info window
    addInfoWindow(marker, contentString);
    markers.push(marker);
  });
  // adj center
  map.panToBounds(bounds, 300);
}
