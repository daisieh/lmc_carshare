import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Car, CarRequest} from "../../types";
import {getAvailableCars, listAllCars} from "../../fakeTranspositFunctions";
import {AppDispatch} from "../store";

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

export const loadAvailableCars = createAsyncThunk<string[], CarRequest, {
    dispatch: AppDispatch
    state: CarState
    extra: {
        jwt: string
    }
}>(
    'cars/loadAvailableCars',
    async (request :CarRequest) => {
        const response = await getAvailableCars(request);
        return response.response as string[];
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
        },
        clearAvailable: (state) => {
            state.available = [] as Car[];
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
            let licenceMap = state.entries.map(x => {return x.Licence;});
            state.available = action.payload.map(x => {
                return state.entries[licenceMap.indexOf(x)] as Car;
            });
            console.log(`available is ${state.available[0].Description}`);
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

export const { add, remove, clearAvailable } = carSlice.actions

export default carSlice.reducer