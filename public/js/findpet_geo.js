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
  // bound change post refresh
  map.addListener("bounds_changed", () => {
    // get bound
    const test = map.getBounds();
    console.log(test);

    // get all markers with in bound
    // delete markers
    // add markers
  });
}

// show filter map
// const applyBtn = document.querySelector(".apply");
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
  } else {
    alert("請選擇全部篩選項目");
  }
});

// add all markers
async function addAllMarker() {
  const response = await fetch("/api/getFindPetsGeoInfo");
  const findPetsGeoData = await response.json();
  addMarker(findPetsGeoData);
}

// add filter markers
async function filterMapMarker(kind, county, district, date) {
  const response = await fetch(
    `/api/getFindPetsGeoInfo?kind=${kind}&county=${county}&district=${district}&date=${date}`
  );
  const filterGeoData = await response.json();
  console.log(filterGeoData);
  // add new marker
  addMarker(filterGeoData);
}

function addMarker(data) {
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
      <div>${pet.kind}</div>
      <div>${pet.breed}</div>
      <div>${pet.color}</div>
      <a href="/?id=${pet.id}"></a>
    </div>`;
    // markers
    marker = new google.maps.Marker({
      position: myLatLng,
      map,
      title: pet.breed,
      icon: image,
    });
    console.log("mark");
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
  // console.log("delete");
  const len = markers.length;
  for (i = 0; i < len; i++) {
    markers[i].setMap(null);
  }
}
