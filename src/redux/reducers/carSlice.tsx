import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Car} from "../../types";

export const carSlice = createSlice({
    name: 'cars',
    initialState: [
            {
                "Timestamp": "20/01/2020 16:21:11",
                "Make": "Toyota",
                "Model": "Prius",
                "Color": "Blue",
                "Features": [
                    "pet friendly",
                    "child friendly",
                    "eco friendly"
                ],
                "Licence": "AL675T",
                "Email": "lmc.blue.prius.2009@gmail.com",
                "AlwaysAvailable": true,
                "Confirm": false,
                "Description": "Blue Toyota Prius AL675T"
            },
            {
                "Timestamp": "20/01/2020 16:20:52",
                "Make": "Nissan",
                "Model": "Leaf",
                "Color": "Orange",
                "Features": [
                    "child friendly",
                    "eco friendly"
                ],
                "Licence": "NLEAF",
                "Email": "lmc.orange.leaf.2017@gmail.com",
                "AlwaysAvailable": true,
                "Confirm": true,
                "Description": "Orange Nissan Leaf NLEAF"
            },
            {
                "Timestamp": "20/01/2020 16:24:21",
                "Make": "Honda",
                "Model": "Element",
                "Color": "Orange",
                "Features": [
                    "pet friendly",
                    "cargo",
                    "camping"
                ],
                "Licence": "ELEMENT",
                "Email": "mutantdaisies@gmail.com",
                "AlwaysAvailable": false,
                "Confirm": true,
                "Description": "Orange Honda Element ELEMENT"
            }
        ] as Car[]
    ,
    reducers: {
        add: (state, action :PayloadAction<Car>) => {
            state.push(action.payload);
        },
        remove: (state, action :PayloadAction<string>) => {
            let licenceMap = state.map(x => {return x.Licence;});
            let index = licenceMap.indexOf(action.payload);
            if (index >= 0) {
                state.splice(index, 1);
            }
        }
    }
})

export const { add, remove } = carSlice.actions

export default carSlice.reducer