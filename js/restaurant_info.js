let restaurant;
var map;
let submitButton = document.getElementById('submitButton');
let favButton = document.getElementById('fav-button');

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const restaurantId = document.getElementById('restaurant_id');
    restaurantId.value = restaurant.id;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const isFav = document.getElementById('fav-button');
    const fav = restaurant.is_favorite ? JSON.parse(restaurant.is_favorite) : false;

    console.log(restaurant.is_favorite);

    if (fav) {
        isFav.innerText = `Remove from favourites`;
        remFromFavourites(restaurant.id);
    } else {

        isFav.innerText = `Add to favourites`
        addToFavourites(restaurant.id);
    }


    const image = document.getElementById('restaurant-img');
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
    image.setAttribute("alt", restaurant.name + " " + restaurant.cuisine_type);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key].replace(",", "<br>");
        time.classList.add('time');
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {

    var revWait = fetch(`http://localhost:1337/reviews/?restaurant_id=${self.restaurant.id}`)
        .then(response => response)
        .then(review => review.json())

    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.className = 'review-title';
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {

    }
    const ul = document.getElementById('reviews-list');
    revWait.then(res => {
        res.forEach(review => {
            ul.appendChild(createReviewHTML(review));
            container.appendChild(ul);
        });
    }).catch(() => {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    })

}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
        const li = document.createElement('li');
        const name = document.createElement('p');
        name.innerHTML = review.name;
        name.classList.add("name");
        li.appendChild(name);

        const date = document.createElement('p');
        let updateDate = new Date(review.updatedAt);
        date.innerHTML = `${updateDate.getDate()} / ${updateDate.getMonth() + 1} / ${updateDate.getFullYear()}`
        date.classList.add("date");
        li.appendChild(date);

        const rating = document.createElement('p');
        rating.innerHTML = `Rating: ${review.rating}`;
        rating.classList.add("rating");
        li.appendChild(rating);

        const comments = document.createElement('p');
        comments.innerHTML = review.comments;
        comments.classList.add("comments");
        li.appendChild(comments);

        return li;
    }
    /**
     * Add restaurant name to the breadcrumb navigation menu
     */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    //create a pseudo link to the current page
    const a = document.createElement('a');

    a.href = window.location.href;

    a.innerHTML = restaurant.name;
    a.setAttribute('aria-current', 'page')
    breadcrumb.appendChild(li);
    li.appendChild(a);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}



submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    let url = 'http://localhost:1337/reviews/';
    let data = {
        "restaurant_id": document.getElementById('restaurant_id').value,
        "name": document.getElementById('name').value,
        "rating": document.getElementById('rating').value,
        "comments": document.getElementById('comments').value
    };

    fetch(url, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));

    window.location.reload();
});

addToFavourites = (id) => {
    console.log("add")
    favButton.addEventListener('click', () => {
        fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=true`, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json'
            }
        })
        window.location.reload();
    });

};

remFromFavourites = (id) => {
    console.log("rem")
    favButton.addEventListener('click', () => {
        fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=false`, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json'
            }
        })
        window.location.reload();
    })
};