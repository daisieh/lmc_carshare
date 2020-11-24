import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {listFeatures} from "../../transpositFunctions";

interface FeatureState {
    entries: string[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

export const loadFeatures = createAsyncThunk(
    'features/loadFeatures',
    async () => {
        const response = await listFeatures();
        return response.response;
    }
)

export const featureSlice = createSlice({
    name: 'features',
    initialState: {
        entries: ["foo"],
        status: "idle",
        error: ""
    } as FeatureState,
    reducers: {
        add: (state, action :PayloadAction<string>) => {
            state.entries.push(action.payload);
        },
        remove: (state, action :PayloadAction<string>) => {
            let index = state.entries.indexOf(action.payload);
            if (index >= 0) {
                state.entries.splice(index, 1);
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(loadFeatures.fulfilled, (state, action) => {
            state.entries = action.payload;
            state.status = "idle";
        })
        builder.addCase(loadFeatures.pending, (state) => {
            state.status = "loading";
        })
        builder.addCase(loadFeatures.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.toString();
        })
    }
})

export const { add, remove } = featureSlice.actions

export default featureSlice.reducer