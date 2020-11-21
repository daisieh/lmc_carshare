import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Car, CarRequest} from "../../types";
import {getAvailableCars, listAllCars} from "../../fakeTranspositFunctions";

interface CarState {
    entries: Car[],
    available: Car[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

export const loadCars = createAsyncThunk(
    'cars/loadCars',
    async () => {
        const response = await listAllCars();
        return response.response;
    }
)

export const loadAvailableCars = createAsyncThunk(
    'cars/loadAvailableCars',
    async (request :CarRequest) => {
        console.log(`hi ${request.vehicle}`);
        const response = await getAvailableCars(request);
        return response.response;
    }
)

export const carSlice = createSlice({
    name: 'cars',
    initialState: {
        entries: [] as Car[],
        available: [] as Car[],
        status: "idle",
        error: ""
    } as CarState,
    reducers: {
        add: (state, action :PayloadAction<Car>) => {
            state.entries.push(action.payload);
        },
        remove: (state, action :PayloadAction<string>) => {
            let licenceMap = state.entries.map(x => {return x.Licence;});
            let index = licenceMap.indexOf(action.payload);
            if (index >= 0) {
                state.entries.splice(index, 1);
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(loadCars.fulfilled, (state, action) => {
            state.entries = action.payload;
            state.status = "idle";
        })
        builder.addCase(loadCars.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(loadCars.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
        builder.addCase(loadAvailableCars.fulfilled, (state, action) => {
            state.available = action.payload;
            state.status = "idle";
        })
        builder.addCase(loadAvailableCars.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(loadAvailableCars.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
    }
})

export const { add, remove } = carSlice.actions

export default carSlice.reducer