import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {CarRequest} from "../../types";
import {createBooking, listRequests} from "../../fakeTranspositFunctions";
import {AppDispatch} from "../store";

interface RequestState {
    entries: CarRequest[],
    newest: CarRequest | null,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
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
        add: (state, action :PayloadAction<CarRequest[]>) => {
            state.status = "loading";
            state.entries.push(...action.payload);
            state.status = "idle";
        },
        remove: (state, action :PayloadAction<string>) => {
            state.status = "loading";
            let eventMap = state.entries.map(x => {return x.eventId;});
            console.log(`removing ${action.payload} from ${eventMap}`);
            let index = eventMap.indexOf(action.payload);
            if (index >= 0) {
                state.entries.splice(index, 1);
            }
            state.status = "idle";
        },
        resetNewest: (state) => {
            state.newest = null;
        }
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
    }
})

export const { add, remove, resetNewest } = requestSlice.actions

export default requestSlice.reducer