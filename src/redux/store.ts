import {configureStore, Action} from "@reduxjs/toolkit";
import {featureSlice} from "./reducers/featureSlice";
import {carSlice} from "./reducers/carSlice";
import {requestSlice} from "./reducers/requestSlice";
// import {ThunkAction} from 'redux-thunk';

const store = configureStore({
    reducer: {
        allFeatures: featureSlice.reducer,
        cars: carSlice.reducer,
        requests: requestSlice.reducer
    }
});

// export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store