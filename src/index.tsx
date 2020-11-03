import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {DatePicker, Button, Radio} from 'rsuite';
import {Transposit, User} from "transposit";
// import { Formik, Form, useField } from "formik";
// import * as Yup from "yup";
import "./styles.css";
import moment from "moment";

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface SearchAvailabilityProps {
    updateTime: (startTime: string, endTime: string) => void;
    submitTimes: () => void;
    startTimeValue: string;
    endTimeValue: string;
    carsListed: boolean;
    booking: Booking | null;
}

interface SearchAvailabilityState {
}

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.updateTime.bind(this);
        this.props.submitTimes.bind(this);
        this.props.updateTime("", "");
    }

    handleStartChange(event) {
        if (event) {
            this.props.updateTime(moment(event.toString()).format(), "");
        } else {
            this.props.updateTime("", "");
        }
    }

    handleEndChange(event) {
        if (event) {
            this.props.updateTime("", moment(event.toString()).format());
        } else {
            this.props.updateTime("", "");
        }
    }

    handleSubmit(event) {
        this.props.submitTimes();
    }

    render() {
        let disabled = this.props.carsListed || (this.props.booking !== null);
        let inThePast = "";
        if (moment(this.props.startTimeValue).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        return (
            <div>
                <DatePicker
                    size="sm"
                    format="YYYY-MM-DD HH:mm"
                    onChange={this.handleStartChange}
                    value={new Date(this.props.startTimeValue)}
                    disabled={disabled}
                />
                <DatePicker
                    size="sm"
                    format="YYYY-MM-DD HH:mm"
                    onChange={this.handleEndChange}
                    value={new Date(this.props.endTimeValue)}
                    disabled={disabled}
                />
                <Button size="sm" onClick={this.handleSubmit} disabled={disabled}>
                    Submit
                </Button>
                <div className="error">{inThePast}</div>
            </div>
        );
    }
}

interface AvailableCarsProps {
    cars: Car[];
    passToParent: (chosenCar: string) => void;
    getChosenCar: () => Car | null;
    carsListed: boolean;
}

class AvailableCars extends React.Component<AvailableCarsProps, {}> {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.props.passToParent.bind(this);
        this.props.getChosenCar.bind(this);
    }

    onClick(value, checked, event) {
        let chosenCar = value;
        this.setState(() => {
            this.props.passToParent(chosenCar);
        });
    }

    render() {
        if (this.props.carsListed) {
            let chosenCar = this.props.getChosenCar();
            let email = "";
            if (chosenCar != null) {
                email = chosenCar.Email;
            }
            console.log(`there are ${this.props.cars.length} cars, chosen car is ${email}`);
            if (this.props.cars.length === 0) {
                return (<div>No cars available at this time</div>);
            }
            let rows = this.props.cars.map((car) => {
                let isChosenCar = (email === car.Email);
                let needsConfirm = car.Confirm ? "(requires approval)" : "";
                return (
                        <Radio checked={isChosenCar} onChange={this.onClick} value={car.Email}>
                            {car.Description} {needsConfirm}
                        </Radio>
                )
            });

            return (
                <div>
                    {rows}
                </div>
            );
        } else {
            return ( <div></div>);
        }
    }
}

interface BookingStatusProps {
    reserveCar: () => void;
    getChosenCar: () => Car | null;
    startDisplayTime: string;
    endDisplayTime: string;
    booking: Booking | null;
}

class BookingStatus extends React.Component<BookingStatusProps, {}> {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.reserveCar.bind(this);
        this.props.getChosenCar.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.reserveCar();
    }

    render() {
        if (this.props.booking) {
            if (this.props.booking.confirmed) {
                return (
                    <div>
                        <p>Check your email for a confirmation of your booking!</p>
                    </div>
                );
            } else {
                return (
                    <div>
                        <p>The car's owner has been notified. You will receive an email if they have approved your request.</p>
                    </div>
                );
            }
       } else if (this.props.getChosenCar() !== null) {
            let chosenCar = this.props.getChosenCar();
            let carDescription = "";
            if (chosenCar != null) {
                carDescription = chosenCar.Description;
            }
            return (
                <div>
                    <p>Would you like to book {carDescription} from {this.props.startDisplayTime} to {this.props.endDisplayTime}?</p>
                    <Button size="sm" onClick={this.handleSubmit}>Book it!</Button>
                </div>
            );
        } else {
            return (
                <div>
                </div>
            );
        }
    }
}

interface CarshareBookerProps {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
}

interface CarshareBookerState {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
    booking: Booking | null;
    carsListed: boolean;
    errorMessage: string;
}

class CarshareBooker extends React.Component<CarshareBookerProps, CarshareBookerState> {
    constructor(props) {
        super(props);
        this.state = {
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            cars: this.props.cars,
            chosenCar: this.props.chosenCar,
            user: this.props.user,
            booking: null,
            carsListed: false,
            errorMessage: ""
        };
        this.updateAvailableCars = this.updateAvailableCars.bind(this);
        this.updateTimes = this.updateTimes.bind(this);
        this.bookCar = this.bookCar.bind(this);
        this.chooseCar = this.chooseCar.bind(this);
        this.carsAvailableSuccess = this.carsAvailableSuccess.bind(this);
        this.carBookedSuccess = this.carBookedSuccess.bind(this);
        this.getChosenCar = this.getChosenCar.bind(this);
        this.resetPicker = this.resetPicker.bind(this);
        this.updateTimes("","");
    }

    updateTimes(startTime: string, endTime: string) {
        let start = moment().add(1,'hour').startOf('hour');
        let end = start.clone().add(1,'hour');
        if (startTime === "" && endTime === "") {
            console.log(`reset to ${start.format()} and ${end.format()}`);
            this.setState({
                startTime: start.format(),
                endTime: end.format(),
            });
            return;
        } else if (endTime !== "") {
            end = moment(endTime);
            // set start to at least an hour before
            if (start.add(1, "hour").isAfter(end)) {
                start = end.clone().subtract(1, "hour");
            }
        } else if (startTime !== "") {
            start = moment(startTime);
            // set end to at least an hour after
            if (end.subtract(1,"hour").isBefore(start)) {
                end = start.clone().add(1, "hour");
            }
        }
        this.setState({
            startTime: start.format(),
            endTime: end.format()
        });
        this.chooseCar("");
    }

    async updateAvailableCars() {
        let startTime = this.state.startTime;
        let endTime = this.state.endTime;
        console.log(`looking for cars between ${startTime} and ${endTime}`);
        await transposit
            .run("get_cars_available_for_time", {start: startTime, end: endTime})
            .then(this.carsAvailableSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString()});
            });
    }

    carsAvailableSuccess(results) {
        console.log(results.results[0]);
        this.setState({
            cars: results.results[0].cars as Car[],
            chosenCar: "",
            carsListed: true
        });
        this.chooseCar("");
        return results;
    }

    carBookedSuccess(results) {
        this.setState({chosenCar: "", cars: [], carsListed: false, booking: results.results[0] as Booking});
        console.log(results);
        return results;
    }

    chooseCar(car: string) {
        this.setState({chosenCar: car});
    }

    getChosenCar() {
        if (this.state.cars.length > 0) {
            let carEmails = this.state.cars.map((x) => {
                return x.Email;
            });
            let carIndex = carEmails.indexOf(this.state.chosenCar);
            if (carIndex < 0) {
                return null;
            }
            return this.state.cars[carIndex];
        }
        return null;
    }

    resetPicker() {
        this.setState({
                cars: [],
                chosenCar: "",
                booking: null,
                carsListed: false,
                errorMessage: ""
            }
        );
        this.updateTimes("","");
    }

    async bookCar() {
        console.log("book car");
        await transposit
            .run("create_reservation", {
                start: this.state.startTime,
                end: this.state.endTime,
                requester: this.state.user.email,
                vehicle: this.state.chosenCar
            })
            .then(this.carBookedSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString()});
            });
    }

    render() {
        let startDisplayTime = moment(this.state.startTime).format("YYYY-MM-DD HH:mm");
        let endDisplayTime = moment(this.state.endTime).format("YYYY-MM-DD HH:mm");
        return (
            <div>
                <SearchAvailabilityForm updateTime={this.updateTimes} submitTimes={this.updateAvailableCars}
                                        startTimeValue={this.state.startTime} endTimeValue={this.state.endTime}
                                        carsListed={this.state.carsListed} booking={this.state.booking}/>
                <AvailableCars cars={this.state.cars} passToParent={this.chooseCar} getChosenCar={this.getChosenCar} carsListed={this.state.carsListed}/>
                <BookingStatus reserveCar={this.bookCar} getChosenCar={this.getChosenCar} booking={this.state.booking}
                               startDisplayTime={startDisplayTime} endDisplayTime={endDisplayTime}
                />
                <div className="error">{this.state.errorMessage}</div>
                <Button size="sm" onClick={this.resetPicker}>Reset</Button>
            </div>
        );
    };

}

enum MODE {
    "BOOKING",
    "CAR",
    "SIGNIN"
}

interface NavigationProps {
    user: { name: string; email: string; };
    isValid: boolean;
}

interface NavigationState {
    user: { name: string; email: string; };
    car: Car | null;
    mode: MODE;
}

class Navigation extends React.Component<NavigationProps, NavigationState> {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            car: null,
            mode: MODE.BOOKING
        };
    };

    render() {
        // let main =
        //     <main className="container main">
        //         <CarshareBooker user={this.props.user} startTime={""} endTime={""} cars={[]} chosenCar={""}/>
        //     </main>

        return (
            <>
                <nav className="nav">
                    <div className="nav-float-right">
                        <p className="nav-item">{this.props.user.name}</p>
                        <a
                            className="nav-item"
                            href="#top"
                            onClick={event => {
                                event.preventDefault();
                                transposit.signOut(`${window.location.origin}/signin`);
                            }}
                        >
                            Sign out
                        </a>
                    </div>
                </nav>
                <main className="container main">
                    <CarshareBooker user={this.props.user} startTime={""} endTime={""} cars={[]} chosenCar={""}/>
                </main>
            </>
        );
    };
}

/**
 * Hook to check that user is signed-in. Return true if they are.
 */
function useSignedIn(): boolean {
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
function useUser(isSignedIn: boolean): User | null {
    const [user, setUser] = React.useState<User | null>(null);
    React.useEffect(() => {
        if (!isSignedIn) {
            console.log("!isSignedIn");
            return;
        }
        transposit
            .loadUser()
            .then(u => setUser(u))
            .catch(response => console.log(response));
    }, [isSignedIn]);
    return user;
}

function isValidMember(user: User | null): boolean {
    const [isValid, setValid] = React.useState<boolean>(false);
    React.useEffect(() => {
        if (user) {
            transposit
                .run("is_valid_member", {email: user.email})
                .then(x => {
                    console.log("is_valid is " + x.results.toString());
                    if (x.results[0]) {
                        setValid(true);
                    } else {
                        setValid(false);
                    }
                })
                .catch(response => {
                    console.log(response);
                    setValid(false);
                });
        }
    }, [user]);

    return isValid;
}

/**
 * Sign-in page
 */
function SignIn() {
    return (
        <>
            <header className="hero">
                <div className="container center">
                    <h1 className="hero-text">Request a car</h1>
                </div>
            </header>
            <main className="container center sign-in">
                <Button
                    onClick={async e => {
                        e.preventDefault();
                        await transposit.signIn(
                            `${window.location.origin}/signin/handle-redirect`
                        );
                    }}
                >
                    Sign In
                </Button>
            </main>
        </>
    );
}

/**
 * Handle sign-in page
 */
function SignInHandleRedirect() {
    React.useEffect(() => {
        transposit.handleSignIn().then(
            ({needsKeys}) => {
                if (needsKeys) {
                    window.location.href = transposit.settingsUri(window.location.origin);
                } else {
                    window.location.href = "/";
                }
            },
            () => {
                window.location.href = "/signin";
            }
        );
    }, []);
    return null;
}

/**
 * Sign-in protected index page
 */
function Index() {
    // Check if signed-in
    const isSignedIn = useSignedIn();
    const user = useUser(isSignedIn);
    const isValid = isValidMember(user);

    // If not signed-in, wait while rendering nothing
    if (!isSignedIn || !user) {
        console.log("not signed in");
        return (
            <div>
                <p>This Google account is not affiliated with any known carshare accounts.</p>
                <a href="/signin">Sign in again</a>
            </div>
        )
    }
    console.log("signed in");
    // If signed-in, display the app
    return (
            <Navigation user={user} isValid={isValid}/>
    );
}

function App() {
    return (
        <Router>
            <Route path="/signin" exact component={SignIn}/>
            <Route
                path="/signin/handle-redirect"
                exact
                component={SignInHandleRedirect}
            />
            <Route path="/" exact component={Index}/>
        </Router>
    );
}

const rootElement = document.getElementById("root");
render(<App/>, rootElement);

interface Car {
    "Timestamp": string;
    "Make": string;
    "Model": string;
    "Color": string;
    "Features": string[];
    "Email": string;
    "Licence": string;
    "AlwaysAvailable": boolean;
    "Confirm": boolean;
    "Description": string;
}

interface Booking {
    "threadId": string,
    "requester": string,
    "eventId": string,
    "start": string,
    "end": string,
    "confirmed": boolean,
    "vehicle": string
}