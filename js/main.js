let restaurants,
    neighborhoods,
    cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    updateRestaurants();
    document.getElementById('load_map').style = "display: none";
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    const imgUrl = DBHelper.imageUrlForRestaurant(restaurant);
    image.className = 'restaurant-img responsively-lazy';
    image.setAttribute("data-srcset",
        imgUrl.replace(".jpg", "-small.jpg 480w,") +
        imgUrl.replace(".jpg", "-medium.jpg 640w,") +
        imgUrl.replace(".jpg", "-large.jpg 2x")
    );
    image.setAttribute("srcset", "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==")
    image.setAttribute("sizes",
        `(max-width: 480px) 480px, 100vw,
            (min-width: 481) 640px, 100vw,
            (min-width: 640px) 480px, 50vw, 
            (min-width: 960px) 480px 33.33vw,
            640px`
    );
    image.src = imgUrl.replace(".jpg", "-small.jpg");
    image.setAttribute("alt", restaurant.name + " - " + restaurant.cuisine_type)
    li.append(image);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    name.className = 'restaurant-name'
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more)

    li.className = 'small--one-whole medium--one-half large--one-third'

    return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}