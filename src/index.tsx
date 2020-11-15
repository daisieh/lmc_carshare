import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Button} from 'rsuite';
import "./styles.css";
import {MODE, Navigation} from "./Navigation";
import {signIn, SignInHandleRedirect, useIsValidMember, useSignedIn, useUser} from "./transpositFunctions";

/**
 * Sign-in page
 */
function SignIn() {
    return (
        <>
            <main className="container center sign-in">
                <Button appearance="ghost"
                    onClick={async e => {
                        e.preventDefault();
                        await signIn();
                    }}
                >
                    Sign In
                </Button>
            </main>
        </>
    );
}

/**
 * Sign-in protected index page
 */
function Index(props) {
    // Check if signed-in
    const isSignedIn = useSignedIn();
    const user = useUser(isSignedIn);
    const isValid = useIsValidMember(user);

    // If not signed-in, wait while rendering nothing
    if (!isSignedIn || !user) {
        return null;
    }
    // If signed-in, display the app
    console.log(props.match.path);
    let mode = MODE.BOOKING;
    if (props.match.path === "/requests") {
        mode = MODE.REQUESTS;
    } else if (props.match.path === "/my_car") {
        mode = MODE.MYCAR;
    } else if (props.match.path === "/cars") {
        mode = MODE.CARS;
    } else if (props.match.path === "/calendar") {
        mode = MODE.CALENDAR;
    }
    return (
            <Navigation mode={mode} user={user} isValid={isValid}/>
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
            <Route path="/bookings" exact component={Index}/>
            <Route path="/requests" exact component={Index}/>
            <Route path="/calendar" exact component={Index}/>
            <Route path="/my_car" exact component={Index}/>
            <Route path="/cars" exact component={Index}/>
        </Router>
    );
}

const rootElement = document.getElementById("root");
render(<App/>, rootElement);

