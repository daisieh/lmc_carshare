import moment from "moment";
import {Transposit, User} from "transposit";
import {Car, CarEvents, CarRequest} from "./CarshareBooker";
import * as React from "react";

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

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
    transposit
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
        })
        .catch(response => {
            response.error = response.toString();
        });
    return response;
}

export function deleteRequests(eventIds :string[]) :TranspositResponse {
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
        })
        .catch(response => {
            response.error = response.toString();
        });
    return response;
}

export function sendReminderToOwner(eventId: string) :TranspositResponse {
    let response = {
        error: "",
        response: null
    };
    transposit
        .run("send_reminder", {
            eventId: eventId
        })
        .then(x => {
            console.log(x);
        })
        .catch(response => {
            response.error = response.toString();
        });
    return response;
}

export function createBooking(pendingRequest: CarRequest) :TranspositResponse {
    let response = {
        error: "",
        response: null as CarRequest | null
    };
    transposit
        .run("create_reservation", {
            start: pendingRequest.start,
            end: pendingRequest.end,
            requester: pendingRequest.requester,
            vehicle: pendingRequest.vehicle
        })
        .then(results => {
            response.response = results.results[0] as CarRequest;
        })
        .catch(results => {
            response.error = results.toString();
        });
    return response;
}

export function listFeatures() :TranspositResponse {
    let response = {
        error: "",
        response: [] as string[]
    };
    transposit
        .run("list_features", {})
        .then(x => {
            response.response = x.results as string[];
        })
        .catch(x => {
            response.error = x.toString();
        });
    return response;
}

export function listAllCars() :TranspositResponse {
    let response = {
        error: "",
        response: [] as Car[]
    };
    transposit
        .run("list_cars", {})
        .then(x => {
            response.response = Object.keys(x.results[0]).map(key => x.results[0][key]) as Car[];
        })
        .catch(x => {
            response.error = x.toString();
        });
    return response;
}

export function getThreeDaysEvents() :TranspositResponse {
    let response = {
        error: "",
        response: null as CarEvents | null
    };
    transposit
        .run("three_day_array", {start: moment().format(), interval: '900'})
        .then(x => {
            response.response = x.results[0] as CarEvents
        })
        .catch(x => {
            response.error = x.toString();
        });
    return response;
}

export function listRequests(user: User): TranspositResponse {
    let response = {
        error: "",
        response: [] as CarRequest[]
    };
    transposit
        .run("list_requests", {})
        .then(results => {
            // shift off the labels
            results.results.shift();
            let requests = results.results as CarRequest[];
            // if there's a user, filter to that user and only to future times.
            // if user is null, return all requests
            response.response = requests.filter(x => {
                if (user) {
                    if (x.requester === user.email) {
                        if (moment(x.end).isSameOrAfter(moment())) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return true;
                }
            });
            response.response.map(x => {
                x.start = moment(x.start).format("YYYY-MM-DD HH:mm");
                x.end = moment(x.end).format("YYYY-MM-DD HH:mm");
                return x;
            })
        })
        .catch(x => {
            response.error = x.toString();
        });
    return response;
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