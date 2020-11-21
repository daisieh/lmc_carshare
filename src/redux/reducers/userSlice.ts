import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from "../../types";

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: {} as User
    },
    reducers: {
        set: (state, action :PayloadAction<User>) => {
            state.user = action.payload;
        }
    }
})

export const { set } = userSlice.actions

export default userSlice.reducer