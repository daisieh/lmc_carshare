import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {DatePicker, Button, Radio, TagPicker, Loader, Modal} from 'rsuite';
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
    selectFeatures: (features: string[] | null) => void;
    startTimeValue: string;
    endTimeValue: string;
    carsListed: boolean;
    booking: Booking | null;
    availableFeatures: string[];
    selectedFeatures: string[];
}

interface SearchAvailabilityState {
}

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagPick = this.handleTagPick.bind(this);
        this.props.updateTime.bind(this);
        this.props.submitTimes.bind(this);
        this.props.selectFeatures.bind(this);
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

    handleTagPick(event) {
        this.props.selectFeatures(event as string[] | null);
    }

    render() {
        let disabled = this.props.carsListed || (this.props.booking !== null);
        let inThePast = "";
        if (moment(this.props.startTimeValue).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        let feat_array:{label: string, value: string}[] = this.props.availableFeatures.map(x => { return {"value": x, "label": x}; });

        return (
            <div className="search-form">
                <p className={disabled?"caption-disabled":"caption"}>Select the date and time you'd like to book.</p>
                <div className="date-select">
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleStartChange}
                        value={new Date(this.props.startTimeValue)}
                        disabled={disabled}
                    />
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleEndChange}
                        value={new Date(this.props.endTimeValue)}
                        disabled={disabled}
                    />
                </div>
                <p className={disabled?"caption-disabled":"caption"}>Only select cars with all of these features:</p>
                <div className="feature-select">
                    <TagPicker
                        className="selector"
                        size="sm"
                        style={{width: 300}}
                        data={feat_array}
                        value={this.props.selectedFeatures}
                        onChange={this.handleTagPick}
                        disabled={disabled}
                    />
                </div>
                <Button
                    appearance="ghost"
                    className="selector"
                    size="sm"
                    onClick={this.handleSubmit}
                    disabled={disabled}
                >
                    Look for cars
                </Button>
                <div className="error">{inThePast}</div>
            </div>
        );
    }
}

interface AvailableCarsProps {
    cars: Car[];
    chooseCar: (chosenCar: string) => void;
    getChosenCar: () => Car | null;
    reserveCar: () => void;
    carsListed: boolean;
}

class AvailableCars extends React.Component<AvailableCarsProps, {}> {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.props.chooseCar.bind(this);
        this.props.getChosenCar.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.reserveCar.bind(this);
    }

    onClick(value, checked, event) {
        this.setState(() => {
            this.props.chooseCar(value);
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.reserveCar();
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
                return (
                    <div className="available-form">
                        No cars available at this time
                    </div>
                );
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
                <div className="available-form">
                    <p>Cars available for booking:</p>
                    {rows}
                    <br/>
                    <Button
                        appearance="ghost"
                        size="sm"
                        onClick={this.handleSubmit}
                        disabled={chosenCar == null}
                    >
                        Book it!
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="available-form">
                </div>);
        }
    }
}

interface BookingStatusProps {
    booking: Booking | null;
    resetBooking: () => void;
}

interface BookingStatusState {
    show: boolean
}

class BookingStatus extends React.Component<BookingStatusProps, BookingStatusState> {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
        this.props.resetBooking.bind(this);
        this.close = this.close.bind(this);
    }

    close() {
        this.props.resetBooking();
    }

    render() {
        let message = "";
        if (this.props.booking) {
            if (this.props.booking.confirmed) {
                message = "Check your email for a confirmation of your booking!";
            } else {
                message = "The car's owner has been notified. You will receive an email if they have approved your request.";
            }
        }
        return (
            <div className="modal-container">
                <Modal show={message !== ""} onHide={this.close}>
                    <Modal.Header>
                        <Modal.Title>Booking request sent!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close} appearance="primary">
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

interface CarshareBookerProps {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
    availableFeatures: string[];
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
    selectedFeatures: string[];
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
            errorMessage: "",
            selectedFeatures: []
        };
        this.updateAvailableCars = this.updateAvailableCars.bind(this);
        this.updateTimes = this.updateTimes.bind(this);
        this.bookCar = this.bookCar.bind(this);
        this.chooseCar = this.chooseCar.bind(this);
        this.selectFeatures = this.selectFeatures.bind(this);
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
        let filtered_cars = [];
        console.log("features are " + this.state.selectedFeatures.toString());
        this.chooseCar("");
        filtered_cars = results.results[0].cars.filter(x => {
            let res = true;
            for (let i in this.state.selectedFeatures) {
                console.log("comparing " + this.state.selectedFeatures[i] + " to " + x.Features.toString() + ": " + x.Features.indexOf(this.state.selectedFeatures[i]));
                if (x.Features.indexOf(this.state.selectedFeatures[i]) < 0) {
                    res = false;
                }
            }
            return res;
        });
        this.setState({
            cars: filtered_cars as Car[],
            chosenCar: "",
            carsListed: true
        });
        return filtered_cars;
    }

    carBookedSuccess(results) {
        this.setState({chosenCar: "", cars: [], carsListed: false, booking: results.results[0] as Booking});
        console.log(results);
        return results;
    }

    chooseCar(car: string) {
        this.setState({chosenCar: car});
    }

    selectFeatures(features: string[] | null) {
        if (features) {
            console.log("selecting features " + features.toString());
            this.setState({selectedFeatures: features});
        } else {
            console.log("no features");
            this.setState({selectedFeatures: []});
        }
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
                errorMessage: "",
                selectedFeatures: []
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
        return (
            <div>
                <h2 className="title">Book a car</h2>
                <SearchAvailabilityForm updateTime={this.updateTimes} submitTimes={this.updateAvailableCars} selectFeatures={this.selectFeatures}
                                        startTimeValue={this.state.startTime} endTimeValue={this.state.endTime} selectedFeatures={this.state.selectedFeatures}
                                        carsListed={this.state.carsListed} booking={this.state.booking} availableFeatures={this.props.availableFeatures}/>
                <AvailableCars cars={this.state.cars} chooseCar={this.chooseCar} getChosenCar={this.getChosenCar} reserveCar={this.bookCar} carsListed={this.state.carsListed}/>
                <BookingStatus booking={this.state.booking} resetBooking={this.resetPicker}/>
                <div className="error">{this.state.errorMessage}</div>
                <Button appearance="ghost" className="reset-button" size="sm" onClick={this.resetPicker}>Reset booking</Button>
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
    isValid: number;
    features: string[];
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
        let main =
            <main className="container main">
                <Loader size="lg" center content="Loading" vertical/>
            </main>
        if (this.props.user) {
            if (this.props.isValid === -1) {
                main = <main className="container main">
                    <div>
                        {this.props.user.name}, your address {this.props.user.email} is
                        not registered as a carshare member.
                        Please contact the LMC Carshare team to register your account.
                    </div>
                </main>
            } else if (this.props.isValid === 1) {
                main =
                    <main className="container main">
                        <CarshareBooker user={this.props.user} startTime={""} endTime={""} cars={[]} chosenCar={""} availableFeatures={this.props.features}/>
                    </main>
            }
        }

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
                {main}
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
            return;
        }
        transposit
            .loadUser()
            .then(u => setUser(u))
            .catch(response => console.log(response));
    }, [isSignedIn]);
    return user;
}

function useIsValidMember(user: User | null): number {
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
                    setValid(-1);
                });
        }
    }, [user, isValid]);

    return isValid;
}

function useListFeatures(user: User | null): string[] {
    const [features, setFeatures] = React.useState<string[]>([]);
    React.useEffect(() => {
            transposit
                .run("list_features", {})
                .then(x => {
                    if (x.results) {
                        setFeatures(x.results as string[]);
                    }
                })
                .catch(response => {
                });
    }, [user]);

    return features;
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
                <Button appearance="ghost"
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
    const isValid = useIsValidMember(user);
    const features = useListFeatures(user);

    // If not signed-in, wait while rendering nothing
    if (!isSignedIn || !user) {
        return null;
    }
    // If signed-in, display the app
    return (
            <Navigation user={user} isValid={isValid} features={features}/>
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