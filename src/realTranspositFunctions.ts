import {Transposit, User} from "transposit";
import {Car, CarEvents, CarRequest} from "./types";
import * as React from "react";

export const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface AvailableCars {
    "start": string;
    "end": string;
    "cars": Car[];
}

export async function getAvailableCars(pendingRequest :CarRequest) {
    let response = {
        error: "",
        response: [] as Car[]
    };
    await transposit
        .run("get_cars_available_for_time", {
            start: pendingRequest.start,
            end: pendingRequest.end
        })
        .then(results => {
            let selectedFeatures = pendingRequest.features;
            let raw_cars = results.results[0] as AvailableCars;
            response.response = raw_cars.cars.filter(x => {
                let res = true;
                for (let i in selectedFeatures) {
                    if (x.Features.indexOf(selectedFeatures[i]) < 0) {
                        res = false;
                    }
                }
                return res;
            });
            return response;
        })
        .catch(response => {
            response.error = response.toString();
            return response;
        });
}

export async function deleteRequests(eventIds :string[]) {
    let response = {
        error: "",
        response: [] as CarRequest[]
    };
    transposit
        .run("delete_requests", {
            eventIds: eventIds.toString()
        })
        .then(x => {
            response.response = x.results as CarRequest[];
            return response;
        })
        .catch(response => {
            response.error = response.toString();
            return response;
        });
}

export async function sendReminderToOwner(eventId: string) {
    let response = {
        error: "",
        response: ""
    };
    await transposit
        .run("send_reminder", {
            eventId: eventId
        })
        .then(x => {
            console.log(x);
            response.response = x.toString();
            return response;
        })
        .catch(response => {
            response.error = response.toString();
            return response;
        });
}

export async function createBooking(pendingRequest: CarRequest) {
    let response = {
        error: "",
        response: null as CarRequest | null
    };
    await transposit
        .run("create_reservation", {
            start: pendingRequest.start,
            end: pendingRequest.end,
            requester: pendingRequest.requester,
            vehicle: pendingRequest.vehicle
        })
        .then(results => {
            response.response = results.results[0] as CarRequest;
            return response;
        })
        .catch(results => {
            response.error = results.toString();
            return response;
        });
}

export async function listFeatures() {
    let response = {
        error: "",
        response: [] as string[]
    };
    await transposit
        .run("list_features", {})
        .then(x => {
            console.log("features listed");
            response.response = x.results as string[];
            return response;
        })
        .catch(x => {
            console.log("features error");
            response.error = x.toString();
            return response;
        });
}

export async function listAllCars() {
    let response = {
        error: "",
        response: [] as Car[]
    };
    await transposit
        .run("list_cars", {})
        .then(x => {
            response.response = Object.keys(x.results[0]).map(key => x.results[0][key]) as Car[];
            return response;
        })
        .catch(x => {
            response.error = x.toString();
            return response;
        });
    return response;
}

export async function getThreeDaysEvents(start: string, interval: number) {
    let response = {
        error: "",
        response: null as CarEvents | null
    };
    await transposit
        .run("three_day_array", {start: start, interval: interval.toString()})
        .then(x => {
            response.response = x.results[0] as CarEvents
            return response;
        })
        .catch(x => {
            response.error = x.toString();
            return response;
        });
}

export async function listRequests() {
    let response = {
        error: "",
        response: [] as CarRequest[]
    };
    transposit
        .run("list_requests", {})
        .then(results => {
            // shift off the labels
            results.results.shift();
            response.response = results.results as CarRequest[];
            return response;
        })
        .catch(x => {
            response.error = x.toString();
            return response;
        });
}


/**
 * Hook to check that user is signed-in. Return true if they are.
 */
export function useSignedIn(): boolean {
    const [isSignedIn, setIsSignedIn] = React.useState<boolean>(false);
    React.useEffect(() => {
        if (!transposit.isSignedIn()) {
            window.location.href = "/signin";
            return;
        }
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
        transposit
            .loadUser()
            .then(u => setUser(u))
            .catch(response => console.log(response));
    }, [isSignedIn]);
    return user;
}

export function useIsValidMember(user: User | null): number {
    const [isValid, setValid] = React.useState<number>(0);
    React.useEffect(() => {
        if (user) {
            transposit
                .run("is_valid_member", {email: user.email})
                .then(x => {
                    if (x.results[0]) {
                        setValid(1);
                    } else {
                        setValid(-1);
                    }
                })
                .catch(response => {
                    console.log(response.toString());
                    setValid(-1);
                });
        }
    }, [user, isValid]);

    return isValid;
}

/**
 * Handle sign-in page
 */
export async function signIn() {
    await transposit.signIn(
        `${window.location.origin}/signin/handle-redirect`
    );
}

export function SignInHandleRedirect() {
    transposit.handleSignIn().then(
        () => {
            window.location.href = "/bookings";
        },
        () => {
            window.location.href = "/signin";
        }
    );
    return null;
}

/**
 * Handle sign-out page
 */
export function SignOut() {
    transposit.signOut(`${window.location.origin}/signin`);
    return null;
}