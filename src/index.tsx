import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import './custom-rw.scss';
import './custom-bootstrap.scss';
import './styles.css';
import 'react-widgets/dist/css/react-widgets.css';
import momentLocalizer from 'react-widgets-moment';
import Navigation from "./Navigation";
import {signIn, SignInHandleRedirect, useIsValidMember, useSignedIn, useUser} from "./transpositFunctions";
import store from './redux/store';
import {Provider, useDispatch} from 'react-redux'
import {loadRequests} from "./redux/reducers/requestSlice";
import {loadFeatures} from "./redux/reducers/featureSlice";
import {Pages} from "./types";
import {userSlice} from "./redux/reducers/userSlice";
import {loadCars} from "./redux/reducers/carSlice";
import moment from "moment";
import {Button, Container} from "react-bootstrap";

/**
 * Sign-in page
 */
function SignIn() {
    return (
        <>
            <div className="main-head">LMC Carshare</div>
            <Container className="not-valid">
            <Button
                onClick={async e => {
                    e.preventDefault();
                    await signIn();
                }}
            >
                Sign In
            </Button>
            </Container>
            <div className="user-foot"><a href="https://docs.google.com/document/d/1zllbnP-UxmN7UFXLjSo7TsCUkRMtyscnE5PTagYwexs/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Help</a></div>
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
    moment.locale('en')
    momentLocalizer()

    if (isValid === -1) {
        return (
            <div>
            <div className="main-head">LMC Carshare</div>
            <Container className="not-valid">
                {user.name}, your address {user.email} is
                not registered as a carshare member.
                Please contact the LMC Carshare team to register your account.
            </Container>
            </div>
        );
    }

    // load data store
    dispatch(loadRequests());
    dispatch(loadFeatures());
    dispatch(loadCars());
    dispatch(userSlice.actions.set(user));

    // If signed-in, display the app
    console.log(props.match.path);
    return (
        <Navigation mode={props.match.path}/>
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
