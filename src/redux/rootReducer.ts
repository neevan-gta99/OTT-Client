// rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userAuthReducer from '../redux/features/userAuthSlice.ts'

const rootReducer = combineReducers({
    userAuth: userAuthReducer,
});

export default rootReducer;
