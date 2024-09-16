import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchRestaurants, resetRestaurants } from "../redux/restaurantsSlice";
import RestaurantItem from "./RestaurantItem";
import {
  APIProvider,
  Map,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { FaSpinner } from "react-icons/fa6";
import PlaceAutocomplete from "./PlaceAutocomplete";
import defaultImage from "../images/menuplate.jpg";

const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || "";
const mapId = process.env.REACT_APP_MAP_ID || "";

const RestaurantList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { restaurants, status, error } = useAppSelector(
    (state) => state.restaurants
  );
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showStaticImage, setShowStaticImage] = useState(true);

  useEffect(() => {
    if (location) {
      dispatch(fetchRestaurants(location));
    }
  }, [dispatch, location]);

  useEffect(() => {
    if (selectedPlace && selectedPlace.geometry?.location) {
      setLocation({
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng(),
      });
      setShowStaticImage(false);
    }
  }, [selectedPlace]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowStaticImage(false);
        },
        (error) => {
          console.error(error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleReset = () => {
    setLocation(null);
    setSelectedPlace(null);
    setShowStaticImage(true);
    dispatch(resetRestaurants());
  };

  return (
    <div className="relative">
      <div>
        <div className="relative">
          <div className="flex justify-center">
          <div className="max-w-md">
              <h1 className="mb-5 text-3xl font-bold">Find Nearby Restaurants</h1>
              <p className="mb-5">
              “Find nearby restaurants, explore new dining options, check distances, ratings, and view them on Google Maps.”
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
