import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      cars: [],
      bookings: [],
      locations: [],
      categories: [],
      selectedLocation: '',
      pickupDate: '',
      pickupTime: '10:00',
      dropDate: '',
      dropTime: '10:00',
      selectedCar: null,

      // --- Data Fetching ---

      fetchLocations: async () => {
        try {
          const res = await fetch(`${API_BASE}/locations`);
          const data = await res.json();
          set({ locations: data });
          if (data.length > 0 && !get().selectedLocation) {
             set({ selectedLocation: data[0].name });
          }
        } catch (err) { console.error('Error fetching locations', err); }
      },

      addLocation: async (name) => {
        try {
          const res = await fetch(`${API_BASE}/locations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
          if (res.ok) {
            const newLoc = await res.json();
            set((state) => ({ locations: [...state.locations, newLoc] }));
          }
        } catch (err) { console.error('Error adding location', err); }
      },

      deleteLocation: async (id) => {
        try {
          const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
          if (res.ok) {
            set((state) => ({ locations: state.locations.filter(l => (l._id || l.id) !== id) }));
          }
        } catch (err) { console.error('Error removing location', err); }
      },

      fetchCategories: async () => {
        try {
          const res = await fetch(`${API_BASE}/categories`);
          if (!res.ok) throw new Error('Registry Offline');
          const data = await res.json();
          // Fallback array if database is initialized but empty
          set({ categories: data.length > 0 ? data : [] });
        } catch (err) { 
          console.error('Error fetching categories', err);
          // Only use hardcoded defaults if fetch absolutely fails
          if (get().categories.length === 0) {
             set({ categories: [] });
          }
        }
      },

      addCategory: async (name) => {
        try {
          const res = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
          const data = await res.json();
          if (res.ok) {
            set((state) => ({ categories: [...state.categories, data] }));
            return { success: true };
          } else {
            alert(data.message || 'Hub Error: Failed to add Category.');
            return { success: false };
          }
        } catch (err) { 
          console.error('Error adding category', err); 
          alert('System Offline: Category Signal Failure.');
          return { success: false };
        }
      },

      deleteCategory: async (id) => {
        try {
          const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
          if (res.ok) {
            set((state) => ({ categories: state.categories.filter(c => (c._id || c.id) !== id) }));
          }
        } catch (err) { console.error('Error removing category', err); }
      },

      fetchCars: async () => {
        try {
          const response = await fetch(`${API_BASE}/cars`);
          const data = await response.json();
          set({ cars: data });
        } catch (err) {
          console.error('❌ Hub Error: Unit Retrieval Failure.', err);
        }
      },

      fetchBookings: async (email = null) => {
        try {
          const url = email ? `${API_BASE}/bookings?email=${email}` : `${API_BASE}/bookings`;
          const response = await fetch(url);
          const data = await response.json();
          set({ bookings: data });
        } catch (err) {
          console.error('❌ Hub Error: Registry Read Failure.', err);
        }
      },

      // --- Security & Identity Hub ---

      login: (userData) => set({ user: userData }),
      
      signup: async (userData) => {
        try {
          const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });
          const data = await response.json();
          if (response.ok) {
            set({ user: data.user });
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (err) {
          console.error('❌ Hub Error: Identity Onboarding Failure.', err);
          return { success: false, message: 'System Offline: Registry Hub failure.' };
        }
      },

      logout: () => set({ user: null }),

      // --- Mobility Registry Control ---

      setLocation: (location) => set({ selectedLocation: location }),
      
      setDates: (pickupDate, pickupTime, dropDate, dropTime) => 
        set({ pickupDate, pickupTime, dropDate, dropTime }),

      selectCar: (car) => set({ selectedCar: car }),

      addBooking: async (bookingData) => {
        try {
          const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
          });
          if (response.ok) {
            const newBooking = await response.json();
            set((state) => ({ bookings: [newBooking, ...state.bookings] }));
            return { success: true, booking: newBooking };
          }
          return { success: false };
        } catch (err) {
          console.error('❌ Hub Error: Transaction Commit Signal Failure.', err);
          return { success: false };
        }
      },

      clearBooking: () => set({ selectedCar: null }),

      // --- Administrative Registry Hub ---

      addCar: async (carData) => {
        try {
          const response = await fetch(`${API_BASE}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData),
          });
          if (response.ok) {
            const newCar = await response.json();
            set((state) => ({ cars: [...state.cars, newCar] }));
          }
        } catch (err) {
          console.error('❌ Hub Error: Asset Registration Failure.', err);
        }
      },

      updateCar: async (id, updatedData) => {
        try {
          const response = await fetch(`${API_BASE}/cars/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
          });
          if (response.ok) {
            const updatedCar = await response.json();
            set((state) => ({
              cars: state.cars.map((c) => ((c._id || c.id) === id ? updatedCar : c)),
            }));
          }
        } catch (err) {
          console.error('❌ Hub Error: Asset Modification Signal Failure.', err);
        }
      },

      deleteCar: async (id) => {
        try {
          const response = await fetch(`${API_BASE}/cars/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            set((state) => ({
              cars: state.cars.filter((c) => (c._id || c.id) !== id),
            }));
          }
        } catch (err) {
          console.error('❌ Hub Error: Unit Decommission Sequence Failure.', err);
        }
      }
    }),
    {
      name: 'rg-selfdriving-registry-v2',
    }
  )
);

export default useStore;
