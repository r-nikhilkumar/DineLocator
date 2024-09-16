
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { server } from '../constants';

interface Restaurant {
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  distance: number;
  photoUrl: string | null;
  place_id: string; // Add place_id here
}

interface RestaurantsState {
  restaurants: Restaurant[];
  totalResults: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RestaurantsState = {
  restaurants: [],
  totalResults: 0,
  status: 'idle',
  error: null,
};


export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async ({ location, page, pageSize }: { location: { lat: number; lng: number }, page: number, pageSize: number }) => {
    const response = await axios.get(`${server}/api/places`, {
      params: {
        lat: location.lat,
        lng: location.lng,
        page,
        pageSize,
      },
    });
    
    return { restaurants: response.data.restaurants, totalResults: response.data.totalResults }; // Ensure totalResults is returned by the API
  }
);

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    resetRestaurants: (state) => {
      state.restaurants = [];
      state.totalResults = 0; // Reset total results
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.restaurants = action.payload.restaurants;
        state.totalResults = action.payload.totalResults; // Save total results from API response
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});
export const { resetRestaurants } = restaurantsSlice.actions;
export default restaurantsSlice.reducer;
