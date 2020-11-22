import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {CarEvents, CarRequest} from "../../types";
import {createBooking, listRequests, deleteRequests} from "../../fakeTranspositFunctions";
import {AppDispatch} from "../store";

interface RequestState {
    entries: CarRequest[],
    newest: CarRequest | null,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null,
    threeDays: CarEvents
}

export const loadRequests = createAsyncThunk(
    'requests/loadRequests',
    async () => {
        const response = await listRequests();
        return response.response;
    }
)

export const createRequest = createAsyncThunk<CarRequest, CarRequest, {
    dispatch: AppDispatch
    state: RequestState
    extra: {
        jwt: string
    }
}>(
    'requests/createRequest',
    async (request :CarRequest) => {
        const response = await createBooking(request);
        return response.response as CarRequest;
    }
)

export const deleteRequest = createAsyncThunk<CarRequest[], string[], {
    dispatch: AppDispatch
    state: RequestState
    extra: {
        jwt: string
    }
}>(
    'requests/deleteRequest',
    async (eventIds) => {
        console.log(`deleting ${eventIds}`);
        const response = await deleteRequests(eventIds);
        return response.response as CarRequest[];
    }
)

export const resetNewest = createAsyncThunk<any, any, {
    dispatch: AppDispatch
    state: RequestState
    extra: {
        jwt: string
    }
}>(
    'requests/resetNewest',
    async () => {
        return "";
    }
)

export const requestSlice = createSlice({
    name: 'requests',
    initialState: {
        entries: [
            {
                "threadId": "1759168e6f62e313",
                "vehicle": "ELEMENT",
                "requester": "pwcottle@gmail.com",
                "start": "2021-03-10T05:00:00-0800",
                "end": "2021-03-10T14:00:00-0800",
                "eventId": "o106pbpmlcap5t6a4oc16b335g",
                "confirmed": "TRUE"
            }
        ] as CarRequest[],
        status: "idle",
        error: "",
        newest: null
    } as RequestState,
    reducers: {
    },
    extraReducers: builder => {
        builder.addCase(loadRequests.fulfilled, (state, action) => {
            state.entries = action.payload;
            state.status = "idle";
        })
        builder.addCase(loadRequests.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(loadRequests.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
        builder.addCase(createRequest.fulfilled, (state, action) => {
            state.entries.push(action.payload);
            state.newest = action.payload;
            state.status = "idle";
        })
        builder.addCase(createRequest.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(createRequest.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
        builder.addCase(deleteRequest.fulfilled, (state, action) => {
            action.payload.forEach(x => {
                let eventMap = state.entries.map(y => {return y.eventId;});
                let index = eventMap.indexOf(x.eventId);
                state.entries.splice(index, 1);
            });
            state.newest = null;
            state.status = "idle";
        })
        builder.addCase(deleteRequest.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(deleteRequest.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
        builder.addCase(resetNewest.fulfilled, (state, action) => {
            state.newest = null;
            state.status = "idle";
        })
        builder.addCase(resetNewest.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(resetNewest.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
    }
})

export const {  } = requestSlice.actions

export default requestSlice.reducer