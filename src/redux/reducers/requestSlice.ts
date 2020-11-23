import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {CarEvents, CarRequest} from "../../types";
import {
    createBooking,
    listRequests,
    deleteRequests,
    getThreeDaysEvents,
    sendReminderToOwner
} from "../../transpositFunctions";
import {AppDispatch} from "../store";

interface RequestState {
    entries: CarRequest[],
    newest: CarRequest | null,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null,
    threeDays: CarEvents | null,
    interval: number
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

export const sendReminderForRequest = createAsyncThunk<string, CarRequest, {
    dispatch: AppDispatch
    state: RequestState
    extra: {
        jwt: string
    }
}>(
    'requests/sendReminderForRequest',
    async (request) => {
        console.log(`sending reminder for  ${request.eventId}`);
        const response = await sendReminderToOwner(request.eventId as string);
        return response.response;
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

export const getThreeDays = createAsyncThunk<CarEvents, {start: string, interval: number}, {
    dispatch: AppDispatch
    state: RequestState
    extra: {
        jwt: string
    }
}>(
    'requests/getThreeDays',
    async (req :{start: string, interval: number}) => {
        const response = await getThreeDaysEvents(req.start, req.interval);
        return response.response as CarEvents;
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
        newest: null,
        threeDays: null,
        interval: 900
    } as RequestState,
    reducers: {
        add: (state, action :PayloadAction<CarRequest>) => {
            state.entries.push(action.payload);
        },
        remove: (state, action :PayloadAction<string>) => {
            let licenceMap = state.entries.map(x => {return x.vehicle;});
            let index = licenceMap.indexOf(action.payload);
            if (index >= 0) {
                state.entries.splice(index, 1);
            }
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
        builder.addCase(sendReminderForRequest.fulfilled, (state) => {
            state.status = "idle";
        })
        builder.addCase(sendReminderForRequest.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(sendReminderForRequest.rejected, (state, action) => {
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
        builder.addCase(resetNewest.fulfilled, (state) => {
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
        builder.addCase(getThreeDays.fulfilled, (state, action) => {
            state.threeDays = action.payload;
            state.status = "idle";
        })
        builder.addCase(getThreeDays.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(getThreeDays.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
    }
})

export const { add, remove } = requestSlice.actions

export default requestSlice.reducer