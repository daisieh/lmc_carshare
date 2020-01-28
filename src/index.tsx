import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Transposit, User } from "transposit";
import "./styles.css";

const transposit = new Transposit(
  "https://lmc-carshare-89gbj.transposit.io"
);


interface SearchAvailabilityProps { value: string; }
interface SearchAvailabilityState { value: string; }

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
  render() {
    return (
      <form>
        <input type="text" placeholder="Start time..." />
        <input type="text" placeholder="End time..." />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

interface CarAvailableProps { user: {name: string;}; cars: []; }
interface CarAvailableState {}

class CarAvailablePicker extends React.Component<CarAvailableProps, CarAvailableState> {

  render() {
    return (
      <div>
        <h2 className="greeting">Hello, {this.props.user.name}</h2>
        <SearchAvailabilityForm value={'2020-01-23'} />
        <AvailableFeaturesTable products={CARS_NAMES} />
      </div>
    );
  };

}

interface AvailableFeaturesProps { products: string[]; }
interface AvailableFeaturesState {}

class AvailableFeaturesTable extends React.Component<AvailableFeaturesProps, AvailableFeaturesState> {
  render() {
    const rows : Element[] = [];
    
    rows.push(this.props.products.map((product) => { return (
      <tr>
        <td>{product}</td>
      </tr>)
    }));

    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

/*
        {calendarEvents ? (
          <div className="calendar">
            <h3 className="today">🗓️ Today</h3>
            {calendarEvents.length === 0 ? (
              <p>
                <em>No events today</em>
              </p>
            ) : (
              <ul>
                {calendarEvents.map((event, idx) => (
                  <li key={idx}>{event.summary}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="lds-circle">
            <div></div>
          </div>
        )}

*/

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

function loadCalendarEvents(isSignedIn: boolean, thisDate: string) {
  // Load calendar events
  const [calendarEvents, setEvents] = React.useState<any[] | null>(null);
  
  React.useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    transposit
      .run("load_todays_events", {date: thisDate})
      .then(({ results }) => {
        setEvents(results);
      })
      .catch(response => {
        console.log(response);
      });
  }, [isSignedIn]);
  return calendarEvents;
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
      ({ needsKeys }) => {
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

  // Load date
  const [thisDate, setThisDate] = React.useState<string>('2020-01-20');

  // hook for calendar events
  const calendarEvents = loadCalendarEvents(isSignedIn, thisDate);
  
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
            href="#"
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
      <CarAvailablePicker user={user} cars={CARS_NAMES} />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Route path="/signin" exact component={SignIn} />
      <Route
        path="/signin/handle-redirect"
        exact
        component={SignInHandleRedirect}
      />
      <Route path="/" exact component={Index} />
    </Router>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);

const CARS_NAMES = ["Toyota Prius", "Honda Element"];

const CARS = 
[
  {
    "Timestamp": "20/01/2020 16:20:52",
    "Make": "Nissan",
    "Model": "Leaf",
    "Color": "Orange",
    "Features": [
      "child friendly",
      "eco friendly"
    ],
    "Email": "lmc.orange.leaf.2017@gmail.com",
    "AlwaysAvailable": true,
    "Confirm": true,
    "Description": "Orange Nissan Leaf"
  },
  {
    "Timestamp": "20/01/2020 16:21:11",
    "Make": "Toyota",
    "Model": "Prius",
    "Color": "Blue",
    "Features": [
      "pet friendly",
      "child friendly",
      "eco friendly"
    ],
    "Email": "lmc.blue.prius.2009@gmail.com",
    "AlwaysAvailable": true,
    "Confirm": false,
    "Description": "Blue Toyota Prius"
  }
];

const AVAILABLE_FEATURES = 
[
  "pet friendly",
  "child friendly",
  "eco friendly"
];
