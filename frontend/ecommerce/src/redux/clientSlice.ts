import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '../types';
import { clientService } from '../services/clientService';

interface ClientsState {
  clients: Client[];
  client: Client | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  totalClients: number;
  totalPages: number;
  currentPage: number;
}

const initialState: ClientsState = {
  clients: [],
  client: null,
  loading: false,
  error: null,
  success: false,
  totalClients: 0,
  totalPages: 0,
  currentPage: 1
};

// Get all clients
export const fetchClients = createAsyncThunk<
  { clients: Client[]; total: number; pages: number },
  { page?: number; limit?: number }
>('clients/fetchClients', async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    return await clientService.getClients(page, limit);
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch clients');
  }
});

// Get client details
export const fetchClientDetails = createAsyncThunk<Client, string>(
  'clients/fetchClientDetails',
  async (id, { rejectWithValue }) => {
    try {
      return await clientService.getClientById(id);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch client details');
    }
  }
);

// Create new client
export const createClient = createAsyncThunk<
  Client,
  Omit<Client, '_id'>
>('clients/createClient', async (clientData, { rejectWithValue }) => {
  try {
    return await clientService.createClient(clientData);
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to create client');
  }
});

// Update client
export const updateClient = createAsyncThunk<
  Client,
  { id: string; clientData: Partial<Client> }
>('clients/updateClient', async ({ id, clientData }, { rejectWithValue }) => {
  try {
    return await clientService.updateClient(id, clientData);
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to update client');
  }
});

// Delete client
export const deleteClient = createAsyncThunk<string, string>(
  'clients/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await clientService.deleteClient(id);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete client');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClientDetails: (state) => {
      state.client = null;
      state.success = false;
    },
    resetClientSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    // Fetch clients
    builder.addCase(fetchClients.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchClients.fulfilled,
      (state, action: PayloadAction<{ clients: Client[]; total: number; pages: number }>) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.totalClients = action.payload.total;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.pages > 0 ? state.currentPage : 1;
      }
    );
    builder.addCase(fetchClients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch client details
    builder.addCase(fetchClientDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchClientDetails.fulfilled,
      (state, action: PayloadAction<Client>) => {
        state.loading = false;
        state.client = action.payload;
      }
    );
    builder.addCase(fetchClientDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create client
    builder.addCase(createClient.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(
      createClient.fulfilled,
      (state, action: PayloadAction<Client>) => {
        state.loading = false;
        state.success = true;
        state.clients.push(action.payload);
        state.client = action.payload;
      }
    );
    builder.addCase(createClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });

    // Update client
    builder.addCase(updateClient.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(
      updateClient.fulfilled,
      (state, action: PayloadAction<Client>) => {
        state.loading = false;
        state.success = true;
        state.clients = state.clients.map(client =>
          client._id === action.payload._id ? action.payload : client
        );
        state.client = action.payload;
      }
    );
    builder.addCase(updateClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });

    // Delete client
    builder.addCase(deleteClient.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteClient.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client._id !== action.payload);
        if (state.client && state.client._id === action.payload) {
          state.client = null;
        }
      }
    );
    builder.addCase(deleteClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearClientDetails, resetClientSuccess } = clientSlice.actions;
export default clientSlice.reducer;
