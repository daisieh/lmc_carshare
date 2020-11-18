import { createSlice } from '@reduxjs/toolkit'

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
        add: (state, action) => {
            state.value.push(action.payload);
        },
        remove: (state, action) => {
            let index = state.value.indexOf(action.payload);
            if (index >= 0) {
                state.value.splice(index, 1);
            }
        }
    }
})

export const { add, remove } = featureSlice.actions

export default featureSlice.reducer