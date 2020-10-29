import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {DatePicker} from 'rsuite';
import {Button} from 'rsuite';
import {Transposit, User} from "transposit";
// import { Formik, Form, useField } from "formik";
// import * as Yup from "yup";
import "./styles.css";
import 'rsuite/dist/styles/rsuite-default.css';
import moment from "moment";

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);


interface SearchAvailabilityProps {
    submitTime: (startTime: string, endTime: string) => void;
}

interface SearchAvailabilityState {
    startFieldValue: Date;
    endFieldValue: Date;
}

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.submitTime.bind(this);
        let now = moment().add(1,'hour').startOf('hour');
        this.state = { startFieldValue: now.toDate(), endFieldValue: now.add(1,'hour').toDate()};
    }

    handleStartChange(event) {
        let time = moment();
        if (event) {
            time = moment(event.toString());
        }
        console.log('start change ' + time.toString());
        this.setState({startFieldValue: time.toDate(), endFieldValue: time.add(1,'hour').toDate()});
        this.props.submitTime("","");
    }

    handleEndChange(event) {
        let time = moment(event.toString());
        this.setState({endFieldValue: time.toDate()});
        this.props.submitTime("","");
    }

    handleSubmit(event) {
        console.log("handleSubmit " + this.state.startFieldValue.toString() + " " + this.state.endFieldValue.toString())
        this.props.submitTime(this.state.startFieldValue.toString(), this.state.endFieldValue.toString());
    }

    render() {
        return (
            <div>
                <DatePicker
                    format="YYYY-MM-DD HH:mm"
                    ranges={[
                        {
                            label: 'Now',
                            value: new Date()
                        }
                    ]}
                    onChange={this.handleStartChange}
                    value={this.state.startFieldValue}
                />
                <DatePicker
                    format="YYYY-MM-DD HH:mm"
                    ranges={[
                        {
                            label: 'Now',
                            value: new Date()
                        }
                    ]}
                    onChange={this.handleEndChange}
                    value={this.state.endFieldValue}
                />
                <Button onClick={this.handleSubmit}>Submit</Button>
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

    onClick(event) {
        let chosenCar = event.target.value;
        console.log(`chosenCar = ${chosenCar}`);
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
                console.log("AvailableCars has no cars");
                return (<div>No cars available at this time</div>);
            }
            let rows = this.props.cars.map((car) => {
                let isChosenCar = (email === car.Email);
                return (
                    <div className="car_check">
                        <label>
                            <input
                                type="radio"
                                name="car"
                                value={car.Email}
                                checked={isChosenCar}
                                className="form-check-input"
                                onChange={this.onClick}
                            />
                            {car.Description}
                        </label>
                    </div>
                )
            });

            return (
                <form>
                    {rows}
                </form>
            );
        } else {
            return ( <div></div>);
        }
    }
}

interface BookingStatusProps {
    reserveCar: () => void;
    getChosenCar: () => Car | null;
    startTime: string;
    endTime: string;
    startDisplayTime: string;
    endDisplayTime: string;
    bookingComplete: boolean;
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
        if (this.props.bookingComplete) {
            return (
                <div>
                    Check your email for a confirmation of your booking!
                </div>
            );
        } else if (this.props.getChosenCar() !== null) {
            let chosenCar = this.props.getChosenCar();
            let carDescription = "";
            if (chosenCar != null) {
                carDescription = chosenCar.Description;
            }
            let now = moment();
            if (moment(this.props.endTime).isBefore(now) || moment(this.props.startTime).isBefore(now)) {
                return (
                    <div>
                        Either {this.props.startDisplayTime} or {this.props.endDisplayTime} is in the past.
                    </div>
                )
            }
            return (
                <div>
                    You're about to book {carDescription} from {this.props.startDisplayTime} to {this.props.endDisplayTime}...
                    <Button onClick={this.handleSubmit}>Book it!</Button>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
}

interface CarAvailableProps {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
}

interface CarAvailableState {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
    bookingComplete: boolean;
    carsListed: boolean;
}

class CarAvailablePicker extends React.Component<CarAvailableProps, CarAvailableState> {
    constructor(props) {
        super(props);
        this.state = {
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            cars: this.props.cars,
            chosenCar: this.props.chosenCar,
            user: this.props.user,
            bookingComplete: false,
            carsListed: false
        };
        this.updateAvailableCars = this.updateAvailableCars.bind(this);
        this.bookCar = this.bookCar.bind(this);
        this.chooseCar = this.chooseCar.bind(this);
        this.successCallback = this.successCallback.bind(this);
        this.getChosenCar = this.getChosenCar.bind(this);
    }

    async updateAvailableCars(startTime: string, endTime: string) {
        if (startTime === "" && endTime === "") {
            console.log("reset");
            this.setState({
                startTime: startTime,
                endTime: endTime,
                cars: [],
                chosenCar: "",
                bookingComplete: false,
                carsListed: false
            });
            return;
        }
        console.log(`looking for cars between ${startTime} ${endTime}`);
        let x = await transposit
            .run("get_cars_available_for_time", {start: startTime, end: endTime})
            .then(this.successCallback)
            .catch(response => {
                console.log(response);
            });
        this.setState({
            startTime: x.results[0].start,
            endTime: x.results[0].end,
            cars: x.results[0].cars as Car[],
            chosenCar: "",
            carsListed: true
        });
        this.chooseCar("");
        console.log(x);
    }

    successCallback(results) {
        return results;
    }

    chooseCar(car: string) {
        this.setState({chosenCar: car});
    }

    getChosenCar() {
        let carEmails = this.state.cars.map((x) => {
            return x.Email;
        });
        if (carEmails.length > 0) {
            let carIndex = carEmails.indexOf(this.state.chosenCar);
            return this.state.cars[carIndex];
        }
        return null;
    }

    async bookCar() {
        let x = await transposit
            .run("create_reservation", {
                start: this.state.startTime,
                end: this.state.endTime,
                requester: this.state.user.email,
                vehicle: this.state.chosenCar
            })
            .then(this.successCallback)
            .catch(response => {
                console.log(response);
            });
        if (x.results[0] != null) {
            this.setState({chosenCar: "", startTime: "", endTime: "", cars: [], bookingComplete: true});
        }
        console.log(x);
        return x;
    }

    render() {
        console.log(`Update CarAvailablePicker render for ${this.state.chosenCar}`);
        return (
            <div>
                <h2 className="greeting">Hello, {this.props.user.name}</h2>
                <SearchAvailabilityForm submitTime={this.updateAvailableCars}/>
                <AvailableCars cars={this.state.cars} passToParent={this.chooseCar} getChosenCar={this.getChosenCar} carsListed={this.state.carsListed}/>
                <BookingStatus reserveCar={this.bookCar} getChosenCar={this.getChosenCar} bookingComplete={this.state.bookingComplete}
                               startTime={this.state.startTime} endTime={this.state.endTime}
                               startDisplayTime={this.state.startTime} endDisplayTime={this.state.endTime}
                />
            </div>
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
                <button
                    className="sign-in-button"
                    onClick={async e => {
                        e.preventDefault();
                        await transposit.signIn(
                            `${window.location.origin}/signin/handle-redirect`
                        );
                    }}
                >
                    Sign In
                </button>
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

    // If not signed-in, wait while rendering nothing
    if (!isSignedIn || !user) {
        return null;
    }

    // If signed-in, display the app
    return (
        <>
            <nav className="nav">
                <div className="nav-float-right">
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
            <header className="hero">
                <div className="container center">
                    <h1 className="hero-text">Request a car</h1>
                </div>
            </header>
            <main className="container main">
                <CarAvailablePicker user={user} startTime={""} endTime={""} cars={[]} chosenCar={""}/>
            </main>
        </>
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
