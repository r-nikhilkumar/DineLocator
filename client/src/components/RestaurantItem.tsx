/* eslint-disable react/jsx-no-comment-textnodes */

import React from "react";
import defaultImage from "../images/def-restaurant.jpg";

interface RestaurantItemProps {
  name: string;
  vicinity: string;
  rating: number;
  userRatingsTotal: number;
  distance: number;
  photoUrl?: string;
  placeId: string;
}

// Component to display individual restaurant information
const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  vicinity,
  rating,
  userRatingsTotal,
  distance,
  photoUrl,
  placeId,
}) => {
  const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

  return (
    <div className="flex flex-row justify-center">
      <div className="p-3 bg-white m-2 shadow-md rounded-md w-80 hover:scale-105 transition ease-in-out">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        {photoUrl ? (
          <img
            className="w-full h-48 object-cover rounded-md"
            src={photoUrl}
            alt={name}
          />
        ) : (
          <img
            className="w-full h-48 object-cover rounded-md"
            src={defaultImage}
            alt="Default"
          />
        )}
        <p className="text-gray-600 mt-1">{vicinity}</p>
        <p className="text-gray-600">
          Rating: {rating} ({userRatingsTotal} reviews)
        </p>
        <p className=" text-gray-900 font-semibold">
          Distance: {distance.toFixed(4)} km
        </p>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 block"
        >
          View on Google Maps
        </a>
      </div>
    </div>
  );
};

export default RestaurantItem;
