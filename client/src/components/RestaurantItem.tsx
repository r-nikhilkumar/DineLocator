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

const renderStars = (rating: number) => {
  // Ensure the rating is a valid number between 0 and 5
  const safeRating = Math.min(Math.max(rating, 0), 5) || 0;
  const fullStars = Math.max(0, Math.floor(safeRating));
  const halfStar = safeRating % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

  return (
    <div className="flex text-yellow-400 text-lg">
      {Array(fullStars)
        .fill(0)
        .map((_, idx) => (
          <span key={`full-${idx}`}>&#9733;</span>
        ))}
      {halfStar && <span>&#9734;</span>}
      {Array(emptyStars)
        .fill(0)
        .map((_, idx) => (
          <span key={`empty-${idx}`} className="text-gray-400">
            &#9734;
          </span> // Empty star
        ))}
    </div>
  );
};



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
        <div className="flex items-center mt-1">
          {renderStars(rating)}
          <span className="ml-2 text-gray-600">({userRatingsTotal??0} reviews)</span>
        </div>
        <p className="text-gray-900 font-semibold">
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
