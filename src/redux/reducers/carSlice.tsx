import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Car, CarRequest} from "../../types";
import {getAvailableCars, listAllCars} from "../../transpositFunctions";
import {AppDispatch} from "../store";

interface CarState {
    entries: Car[],
    available: Car[] | null,
    availableRequestId: string,
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
        return response.response;
    }
)
export const clearAvailable = createAsyncThunk<any, any, {
    dispatch: AppDispatch
    state: CarState
    extra: {
        jwt: string
    }
}>(
    'cars/clearAvailable',
    async () => {
        return "";
    }
)

export const carSlice = createSlice({
    name: 'cars',
    initialState: {
        entries: [] as Car[],
        available: null,
        status: "idle",
        error: "",
        availableRequestId: ""
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
            console.log(`fulfilling ${action.meta.requestId}`);
            if (state.availableRequestId === action.meta.requestId) {
                let licenceMap = state.entries.map(x => {
                    return x.Licence;
                });
                state.available = action.payload.map(x => {
                    return state.entries[licenceMap.indexOf(x)] as Car;
                });
                if (action.meta.arg.features.length > 0) {
                    state.available = state.available.filter(car => {
                        return action.meta.arg.features.every(feature => {
                            return car.Features.some(feat => {
                                return feat === feature;
                            });
                        })
                    })
                }
            } else {
                console.log("must've been reset");
            }
            state.availableRequestId = "";
            state.status = "idle";
        })
        builder.addCase(loadAvailableCars.pending, (state, action) => {
            console.log(`loading ${action.meta.requestId}`);
            state.availableRequestId = action.meta.requestId;
            state.status = "loading";
        })
        builder.addCase(loadAvailableCars.rejected, (state, action) => {
            state.status = "failed";
            state.availableRequestId = "";
            state.error = action.error.toString();
        })
        builder.addCase(clearAvailable.fulfilled, (state) => {
            state.status = "idle";
        })
        builder.addCase(clearAvailable.pending, (state) => {
            state.available = null;
            state.availableRequestId = "";
            state.status = "loading";
        })
        builder.addCase(clearAvailable.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
    }
})

export const { add, remove } = carSlice.actions

export default carSlice.reducer