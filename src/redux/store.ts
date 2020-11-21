import {configureStore, Action} from "@reduxjs/toolkit";
import {featureSlice} from "./reducers/featureSlice";
import {carSlice} from "./reducers/carSlice";
import {requestSlice} from "./reducers/requestSlice";

const store = configureStore({
    reducer: {
        allFeatures: featureSlice.reducer,
        cars: carSlice.reducer,
        requests: requestSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export default store