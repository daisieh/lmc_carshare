import {Car, CarEvents, CarRequest} from "./types";
import * as React from "react";

interface User {
    "name": string,
    "email": string
}

interface AvailableCars {
    "start": string;
    "end": string;
    "cars": string[];
}

export interface TranspositResponse {
    error: string;
    response: any;
}

export async function listRequests() {
    let response = {
        error: "",
        response: fakeRequests as CarRequest[]
    };
    return Promise.resolve(response);
}

export async function listFeatures() {
    let response = {
        error: "",
        response: [] as string[]
    };
    response.response = [
        "pet friendly",
        "child friendly",
        "eco friendly",
        "cargo",
        "camping"
    ];
    return Promise.resolve(response);
}

export async function listAllCars() {
    let response = {
        error: "",
        response: fakeCars as Car[]
    };
    return Promise.resolve(response);
}

export async function getAvailableCars(pendingRequest :CarRequest) {
    let fakeResponse = {
        start: pendingRequest.start,
        end: pendingRequest.end,
        cars: [fakeCars[1].Licence]
    } as AvailableCars;
    let response = {
        error: "",
        response: fakeResponse.cars
    };
    return Promise.resolve(response);
}

export async function deleteRequests(eventIds :string[]) {
    let reqs = fakeRequests;
    let deleted = [] as CarRequest[];
    console.log(`deleteRequests ${eventIds}`);
    let eventMap = reqs.map(y => {return y.eventId;});
    eventIds.forEach(x => {
        let index = eventMap.indexOf(x);
        if (index >= 0) {
            deleted.push(fakeRequests[index] as CarRequest);
        }
    });
    let response = {
        error: "",
        response: deleted
    };
    return Promise.resolve(response);
}

export async function sendReminderToOwner(eventId: string) {
    let response = {
        error: "",
        response: null
    };
    return Promise.resolve(response);
}

export async function createBooking(pendingRequest: CarRequest) {
    let fakeReq =     {
        "threadId": "1759168e6f62e313",
        "vehicle": "NLEAF",
        "requester": "testy@test.com",
        "start": "2021-03-10T05:00:00-0800",
        "end": "2021-03-10T14:00:00-0800",
        "eventId": "o106pbpmlcap5t6a4oc16b335g",
        "confirmed": "TRUE"
    };
    let response = {
        error: "",
        response: fakeReq as CarRequest | null
    };
    return Promise.resolve(response);
}

export async function getThreeDaysEvents() {
    let response = {
        error: "",
        response: fakeCarEvent
    };
    return Promise.resolve(response);
}


/**
 * Hook to check that user is signed-in. Return true if they are.
 */
export function useSignedIn(): boolean {
    const [isSignedIn, setIsSignedIn] = React.useState<boolean>(false);
    React.useEffect(() => {
        setIsSignedIn(true);
    }, []);
    return isSignedIn;
}

/**
 * Hook to load the signed-in user.
 */
export function useUser(isSignedIn: boolean): User | null {
    const [user, setUser] = React.useState<User | null>(null);
    React.useEffect(() => {
        if (!isSignedIn) {
            return;
        }
    setUser({name: "Testy McTest", email: "test@test.com"})
    }, [isSignedIn]);
    return user;
}

export function useIsValidMember(user: User | null): number {
    const [isValid, setValid] = React.useState<number>(0);
    React.useEffect(() => {
        if (user) {
            setValid(1);
        }
    }, [user, isValid]);

    return isValid;
}

/**
 * Handle sign-in page
 */
export async function signIn() {
}

export function SignInHandleRedirect() {
    window.location.href = "/bookings";
    return null;
}

/**
 * Handle sign-out page
 */
export function SignOut() {
    return null;
}

const fakeRequests = [
    {
        "threadId": "175916c0d4bbe0ec",
        "vehicle": "AL675T",
        "requester": "pwcottle@gmail.com",
        "start": "2021-01-01T04:00:00-0800",
        "end": "2021-01-01T13:00:00-0800",
        "eventId": "qs7eb1proc33bgal7jrv431rak",
        "confirmed": "TRUE"
    },
    {
        "threadId": "1759168e6f62e313",
        "vehicle": "NLEAF",
        "requester": "pwcottle@gmail.com",
        "start": "2021-03-10T05:00:00-0800",
        "end": "2021-03-10T14:00:00-0800",
        "eventId": "o106pbpmlcap5t6a4oc16b335g",
        "confirmed": "TRUE"
    }
];

const fakeCars = [
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
];

const fakeCarEvent =
    {
        "start": "2020-11-20T00:00:00-08:00",
        "end": "2020-11-23T00:00:00-08:00",
        "cars": [
            "AL675T",
            "NLEAF",
            "ELEMENT"
        ],
        "interval": 900,
        "busy_segments": [
            ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,<-->,,,,,,,,,,,,,,,,",
            ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
            ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"
        ]
    };
