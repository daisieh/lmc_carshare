const initialState = {
    cars: [
        {
            "Timestamp": "",
            "Make": "Toyota",
            "Model": "Matrix",
            "Color": "Grey",
            "Features": [],
            "Email": "matrix@gmail.com",
            "Licence": "FFF888",
            "AlwaysAvailable": true,
            "Confirm": true,
            "Description": "Grey Toyota Matrix FFF888"
        }
    ],
    requests: [],
    allFeatures: [
        "pet friendly",
        "child friendly",
        "eco friendly",
        "cargo",
        "camping"
    ]
}



// Use the initialState as a default value
export default function appReducer(state = initialState, action) {
    // The reducer normally looks at the action type field to decide what happens
    switch (action.type) {
        // Do something here based on the different types of actions
        default:
            // If this reducer doesn't recognize the action type, or doesn't
            // care about this specific action, return the existing state unchanged
            return state
    }
}