import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Button, Loader, Nav, Navbar} from 'rsuite';
import {Transposit, User} from "transposit";
// import { Formik, Form, useField } from "formik";
// import * as Yup from "yup";
import "./styles.css";
import {CarshareBooker, Car} from "./carbooker"

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

enum MODE {
    "BOOKING",
    "REQUESTS",
    "CAR"
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
        this.selectTab = this.selectTab.bind(this);
        this.state = {
            user: this.props.user,
            car: null,
            mode: MODE.BOOKING
        };
    };

    selectTab(eventKey, event) {
        this.setState({mode: eventKey});
    }

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
                if (this.state.mode === MODE.BOOKING) {
                    main =
                        <main className="container main">
                            <CarshareBooker user={this.props.user} startTime={""} endTime={""} cars={[]} chosenCar={""}
                                            availableFeatures={this.props.features}/>
                        </main>
                } else if (this.state.mode === MODE.REQUESTS) {
                    main = <main className="container main">requests</main>
                } else if (this.state.mode === MODE.CAR) {
                    main = <main className="container main">car</main>
                }
            }
        }

        return (
            <>
                {/*<nav>*/}
                    <Navbar className="navbar">
                        <Navbar.Header className="navbar-welcome">
                            Welcome, {this.props.user.name}
                        </Navbar.Header>
                        <Navbar.Body>
                            <Nav appearance="tabs" onSelect={this.selectTab}>
                                <Nav.Item eventKey={MODE.BOOKING} active={this.state.mode === MODE.BOOKING}>Book Car</Nav.Item>
                                <Nav.Item eventKey={MODE.REQUESTS} active={this.state.mode === MODE.REQUESTS}>Requests</Nav.Item>
                                <Nav.Item eventKey={MODE.CAR} active={this.state.mode === MODE.CAR}>My Car</Nav.Item>
                            </Nav>
                            <Nav pullRight>
                                <Nav.Item onClick={event => {
                                    event.preventDefault();
                                    transposit.signOut(`${window.location.origin}/signin`);
                                }}>Sign Out</Nav.Item>
                            </Nav>
                        </Navbar.Body>
                    </Navbar>
                {/*</nav>*/}
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
                    console.log(response.toString());
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
                    console.log(response.toString());
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

