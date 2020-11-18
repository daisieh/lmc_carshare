import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {CarRequest} from "../../types";

export const requestSlice = createSlice({
    name: 'requests',
    initialState: [
        {
            "threadId": "175916c0d4bbe0ec",
            "vehicle": "AL675T",
            "requester": "pwcottle@gmail.com",
            "start": "2021-01-01T04:00:00-0800",
            "end": "2021-01-01T13:00:00-0800",
            "eventId": "qs7eb1proc33bgal7jrv431rak",
            "confirmed": "TRUE"
        },
        {
            "threadId": "1759168e6f62e313",
            "vehicle": "NLEAF",
            "requester": "pwcottle@gmail.com",
            "start": "2021-03-10T05:00:00-0800",
            "end": "2021-03-10T14:00:00-0800",
            "eventId": "o106pbpmlcap5t6a4oc16b335g",
            "confirmed": "TRUE"
        }
    ] as CarRequest[],
    reducers: {
        add: (state, action :PayloadAction<CarRequest>) => {
            state.push(action.payload);
        },
        remove: (state, action :PayloadAction<string>) => {
            let eventMap = state.map(x => {return x.eventId;});
            console.log(`removing ${action.payload} from ${eventMap}`);
            let index = eventMap.indexOf(action.payload);
            if (index >= 0) {
                state.splice(index, 1);
            }
        }
    }
})

export const { add, remove } = requestSlice.actions

export default requestSlice.reducer