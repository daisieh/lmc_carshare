import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {Button} from 'rsuite';
import "./styles.css";
import {Navigation, Pages} from "./Navigation";
import {signIn, SignInHandleRedirect, useIsValidMember, useSignedIn, useUser} from "./fakeTranspositFunctions";
import store from './redux/store';
import {Provider, useDispatch} from 'react-redux'
import {loadRequests} from "./redux/reducers/requestSlice";

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
    const dispatch = useDispatch();

    // If not signed-in, wait while rendering nothing
    if (!isSignedIn || !user) {
        return null;
    }

    if (isValid === -1) {
        return (<main className="container main">
            <div>
                {user.name}, your address {user.email} is
                not registered as a carshare member.
                Please contact the LMC Carshare team to register your account.
            </div>
        </main>);
    }

    // load data store
    dispatch(loadRequests());
    // If signed-in, display the app
    console.log(props.match.path);
    return (
        <Navigation mode={props.match.path} user={user}/>
    );
}

function App() {
    let routes = Object.keys(Pages).map(x => {return (<Route key={x} path={x} exact component={Index}/>)});
    return (
        <Router>
            <Switch>
                <Route path="/signin" exact component={SignIn}/>
                <Route
                    path="/signin/handle-redirect"
                    exact
                    component={SignInHandleRedirect}
                />
                {routes}
                <Redirect exact to="/bookings" from="/"/>
            </Switch>
        </Router>
    );
}

const rootElement = document.getElementById("root");
render(<Provider store={store}><App/></Provider>, rootElement);
