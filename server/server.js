const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3001;

app.use(cors());

// Function to calculate distance between two coordinates using Haversine formula
const haversineDistance = (coords1, coords2) => {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const lat1 = coords1.lat;
  const lon1 = coords1.lng;
  const lat2 = coords2.lat;
  const lon2 = coords2.lng;

  const R = 6371; // Radius of the Earth in kilometers

  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;

  return d;
};

app.get("/api/places", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 1500,
          type: "restaurant",
          key: process.env.REACT_APP_GOOGLE_PLACES_API_KEY,
        },
      }
    );
    console.log(response);

    const restaurants = response.data.results.map((restaurant) => {
      const photoUrl = restaurant.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`
        : null;
      return {
        name: restaurant.name,
        vicinity: restaurant.vicinity,
        rating: restaurant.rating,
        user_ratings_total: restaurant.user_ratings_total,
        distance: haversineDistance(
          { lat: parseFloat(lat), lng: parseFloat(lng) },
          {
            lat: restaurant.geometry.location.lat,
            lng: restaurant.geometry.location.lng,
          }
        ),
        photoUrl,
      };
    });

    // Sort restaurants by distance and return top 10
    const sortedRestaurants = restaurants
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    res.json(sortedRestaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
