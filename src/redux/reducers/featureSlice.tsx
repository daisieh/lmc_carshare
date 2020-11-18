import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export const featureSlice = createSlice({
    name: 'features',
    initialState: {
        features: [
            "pet friendly",
            "child friendly",
            "eco friendly",
            "cargo",
            "camping"
        ]
    },
    reducers: {
        add: (state, action :PayloadAction<string>) => {
            state.features.push(action.payload);
        },
        remove: (state, action :PayloadAction<string>) => {
            let index = state.features.indexOf(action.payload);
            if (index >= 0) {
                state.features.splice(index, 1);
            }
        }
    }
})

export const { add, remove } = featureSlice.actions

export default featureSlice.reducer