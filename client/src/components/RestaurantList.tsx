import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchRestaurants, resetRestaurants } from "../redux/restaurantsSlice";
import RestaurantItem from "./RestaurantItem";
import { useMap } from "@vis.gl/react-google-maps"; // Ensure this import is correct

import {
  APIProvider,
  Map,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { FaSpinner } from "react-icons/fa6";
import PlaceAutocomplete from "./PlaceAutocomplete";
import defaultImage from "../images/menuplate.jpg";

const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || "";
const mapId = process.env.REACT_APP_MAP_ID || "";

const RestaurantList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { restaurants, status, error, totalResults } = useAppSelector(
    (state) => state.restaurants
  );
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showStaticImage, setShowStaticImage] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Fetch restaurants based on location and page number
  useEffect(() => {
    if (location) {
      dispatch(fetchRestaurants({ location, page, pageSize }));
    }
  }, [dispatch, location, page]);

  // When a place is selected from autocomplete, update location and reset search
  useEffect(() => {
    if (selectedPlace && selectedPlace.geometry?.location) {
      const newLocation = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng(),
      };
      setLocation(newLocation);
      setShowStaticImage(false);

      // Reset the restaurant list and start from page 1
      dispatch(resetRestaurants());
      setPage(1);
      dispatch(fetchRestaurants({ location: newLocation, page: 1, pageSize }));
    }
  }, [selectedPlace, dispatch]);

  // Handle geolocation search
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          setShowStaticImage(false);

          // Reset state before fetching new results
          dispatch(resetRestaurants());
          setPage(1); // Reset page number when getting a new location
          dispatch(fetchRestaurants({ location: newLocation, page: 1, pageSize }));
        },
        (error) => {
          console.error(error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Reset the search and clear the results
  const handleReset = () => {
    setLocation(null);
    setSelectedPlace(null);
    setShowStaticImage(true);
    setPage(1); // Reset the page when resetting the location
    dispatch(resetRestaurants());
  };

  // Load more results by incrementing the page
  const handleLoadMore = () => {
    if (restaurants.length < totalResults) {
      setPage((prevPage) => prevPage + 1); // Increment page on Load More button click
    }
  };

  return (
    <div className="relative">
      <div>
        <div className="relative">
          <div className="flex justify-center">
            <div className="max-w-md">
              <h1 className="mb-5 text-3xl font-bold">Find Nearby Restaurants</h1>
              <p className="mb-5">
                “Find nearby restaurants, explore new dining options, check distances,
                ratings, and view them on Google Maps.”
              </p>
            </div>
          </div>
          <APIProvider apiKey={apiKey}>
            <Map
              mapId={mapId}
              style={{
                width: "100vw",
                height: "50vh",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px",
                margin: "5px",
              }}
              defaultCenter={{ lat: 22.54992, lng: 0 }}
              defaultZoom={3}
              gestureHandling={"greedy"}
              disableDefaultUI={true}
            >
              <AdvancedMarker ref={markerRef} position={null} />
              <MapHandler selectedPlace={selectedPlace} marker={marker} />
            </Map>
            <MapControl position={ControlPosition.TOP}>
              <div className="autocomplete-control bg-white p-2 rounded-md shadow-md relative z-100">
                <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
              </div>
            </MapControl>
          </APIProvider>
        </div>
        <div className="hero min-h-screen bg-gradient-to-r from-white to-stone-700">
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="hero-content flex flex-col items-center justify-start text-neutral-content h-full w-full">
            <div className="flex justify-center">
              <button
                className="bg-neutral-700 text-white px-3 py-1 rounded-md hover:bg-neutral-900 mx-2"
                onClick={handleGetLocation}
              >
                Search My Location
              </button>
              <button
                className="bg-red-400 text-white px-3 py-1 rounded-md hover:bg-red-500 mx-2"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
            {status === "loading" && (
              <FaSpinner className="w-16 h-16 text-white animate-spin" />
            )}
            {status === "succeeded" && restaurants.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                {restaurants.map((restaurant, index) => (
                  <RestaurantItem
                    key={index}
                    name={restaurant.name}
                    vicinity={restaurant.vicinity}
                    rating={restaurant.rating}
                    userRatingsTotal={restaurant.user_ratings_total}
                    distance={restaurant.distance}
                    photoUrl={restaurant.photoUrl || undefined}
                    placeId={restaurant.place_id}
                  />
                ))}
              </div>
            )}
            {status === "succeeded" && restaurants.length === 0 && (
              <div className="flex flex-col items-center mt-4">
                <p>No restaurants found</p>
              </div>
            )}
            {status === "failed" && <p>{error}</p>}
            {showStaticImage && (
              <div className="mt-4 w-full flex justify-center items-center">
                <img
                  className="rounded-md"
                  src={defaultImage}
                  alt="Default"
                  style={{
                    width: "100%",
                    height: "50vh",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            {restaurants.length < totalResults && (
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-blue-700"
              >
                Load More
              </button>
            )}
          </div>
          <div className="bg-white w-full"></div>
        </div>
      </div>
    </div>
  );
};

interface MapHandlerProps {
  selectedPlace: google.maps.places.PlaceResult | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
}

const MapHandler: React.FC<MapHandlerProps> = ({ selectedPlace, marker }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace && selectedPlace.geometry?.location && marker && map) {
      const location = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng(),
      };

      marker.position = new google.maps.LatLng(location.lat, location.lng);

      if (selectedPlace.geometry.viewport) {
        map.fitBounds(selectedPlace.geometry.viewport);
      } else {
        map.setCenter(location);
        map.setZoom(15);
      }
    } else if (marker && map) {
      marker.position = null;
      map.setCenter({ lat: 22.54992, lng: 0 });
      map.setZoom(3);
    }
  }, [selectedPlace, marker, map]);

  return null;
};

export default RestaurantList;
