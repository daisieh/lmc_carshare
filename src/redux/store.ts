import {configureStore} from "@reduxjs/toolkit";
import {featureSlice} from "./reducers/featureSlice";
import {carSlice} from "./reducers/carSlice";
import {requestSlice} from "./reducers/requestSlice";
import {userSlice} from "./reducers/userSlice";

const store = configureStore({
    reducer: {
        allFeatures: featureSlice.reducer,
        cars: carSlice.reducer,
        requests: requestSlice.reducer,
        user: userSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export default store

export type AppDispatch = typeof store.dispatch;
