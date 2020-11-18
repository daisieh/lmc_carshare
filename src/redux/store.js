import {configureStore} from "@reduxjs/toolkit";
import {featureSlice} from "./reducers/featureSlice";

const store = configureStore({
    reducer: {
        allFeatures: featureSlice.reducer
    }
});

export default store