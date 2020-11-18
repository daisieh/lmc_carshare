import {Car, CarEvents, CarRequest} from "./types";
import * as React from "react";

interface User {
    "name": string,
    "email": string
}

interface AvailableCars {
    "start": string;
    "end": string;
    "cars": Car[];
}

interface TranspositResponse {
    error: string;
    response: any;
}

export function getAvailableCars(pendingRequest :CarRequest) :TranspositResponse {
    let response = {
        error: "",
        response: [] as Car[]
    };
    return response;
}

export function deleteRequests(eventIds :string[]) :TranspositResponse {
    let response = {
        error: "",
        response: [] as CarRequest[]
    };
    return response;
}

export function sendReminderToOwner(eventId: string) :TranspositResponse {
    let response = {
        error: "",
        response: null
    };
    return response;
}

export function createBooking(pendingRequest: CarRequest) :TranspositResponse {
    let response = {
        error: "",
        response: null as CarRequest | null
    };
    return response;
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
    return response;
}

export function useListFeatures(user: User | null): string[] {
    const [features, setFeatures] = React.useState<string[]>([]);
    React.useEffect(() => {
        listFeatures().then(x => {
            setFeatures((x.response));
        });
    }, [user]);
    return features;
}


export function listAllCars() :TranspositResponse {
    let response = {
        error: "",
        response: [] as Car[]
    };
    return response;
}

export function getThreeDaysEvents() :TranspositResponse {
    let response = {
        error: "",
        response: null as CarEvents | null
    };
    return response;
}

export function listRequests(user: User): TranspositResponse {
    let response = {
        error: "",
        response: [] as CarRequest[]
    };
    return response;
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