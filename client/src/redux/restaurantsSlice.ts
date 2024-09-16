
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RestaurantsState = {
  restaurants: [],
  status: 'idle',
  error: null,
};

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (location: { lat: number; lng: number }) => {
    const response = await axios.get('/api/places', {
      params: {
        lat: location.lat,
        lng: location.lng,
      },
    });
    return response.data;
  }
);

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    resetRestaurants: (state) => {
      state.restaurants = [];
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
        state.restaurants = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { resetRestaurants } = restaurantsSlice.actions;
export default restaurantsSlice.reducer;
