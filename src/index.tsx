import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Transposit, User } from "transposit";
import "./styles.css";

const transposit = new Transposit(
  "https://lmc-carshare-89gbj.transposit.io"
);


interface SearchAvailabilityProps {
    startTime: string;
    endTime: string;
    passToParent: (startTime: string, endTime: string) => void;
    // callParentSearch: () => void;
}
interface SearchAvailabilityState {
    startTime: string;
    endTime: string;
    passToParent: (startTime: string, endTime: string) => void;
    // callParentSearch: () => void;
}

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor (props) {
        super(props);
        this.state = {
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            passToParent: this.props.passToParent.bind(this),
            // callParentSearch: this.props.callParentSearch.bind(this)
        };
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleStartChange(event) {
        event.preventDefault();
        this.setState({startTime: event.target.value})
    }
    handleEndChange(event) {
        event.preventDefault();
        this.setState({endTime: event.target.value})
    }
    handleSubmit(event) {
        console.log(`handling submit`);
        event.preventDefault();
        this.props.passToParent(this.state.startTime, this.state.endTime);
        // this.state.callParentSearch();
    }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Start time..." value={this.state.startTime} onChange={this.handleStartChange}/>
        <input type="text" placeholder="End time..." value={this.state.endTime} onChange={this.handleEndChange}/>
        <input type="submit" value="Search for available cars" />
      </form>
    );
  }
}

interface CarAvailableProps {
    startTime: string;
    endTime: string;
    user: {name: string;};
    cars: Car[];
}
interface CarAvailableState {
    startTime: string;
    endTime: string;
    cars: Car[];
}

class CarAvailablePicker extends React.Component<CarAvailableProps, CarAvailableState> {
    constructor (props) {
        super(props);
        this.state = { startTime: this.props.startTime, endTime: this.props.endTime, cars: this.props.cars};
        this.updateStateTimes = this.updateStateTimes.bind(this);
        this.successCallback = this.successCallback.bind(this);
        this.updateStateTimes(this.props.startTime, this.props.endTime);
    }

    async updateStateTimes(startTime: string, endTime: string) {
        this.setState( {startTime: startTime, endTime: endTime});
        console.log(`time is ${startTime} ${endTime}`);

        console.log(`updating search`);
        console.log(`looking for cars between ${startTime} ${endTime}`);
        let x = await transposit
            .run("get_cars_available_for_time", {start: startTime, end: endTime})
            .then(this.successCallback)
            .catch(response => {
                console.log(response);
            });
        console.log("transposit returned");
        console.log(x.results);
        this.setState({cars: x.results as Car[]});
        console.log(`state is now:`);
        console.log(this.state.cars);
    }

    successCallback(results) {
        console.log("transposit returned");
        // this.setState({cars: results as Car[]}, () => { console.log(this.state.cars); });
        return results;
    }

  render() {
        console.log("Update CarAvailablePicker render");
      let carList = this.state.cars.map((x) => { return <p>{x.Description}</p> });
      console.log(carList);
    return (
      <div>
        <h2 className="greeting">Hello, {this.props.user.name}</h2>
        <SearchAvailabilityForm startTime={this.state.startTime} endTime={this.state.endTime} passToParent={this.updateStateTimes}/>
        <AvailableCars cars={this.state.cars}/>
        <p>{this.state.startTime}</p>
          <div>{carList}</div>
      </div>
    );
  };

}

interface Car {
    "Timestamp": string;
    "Make": string;
    "Model": string;
    "Color": string;
    "Features": string[];
    "Email": string;
    "AlwaysAvailable": boolean;
    "Confirm": boolean;
    "Description": string;
}
interface AvailableCarsProps {
    cars: Car[];
    // updateAvailableCars: (cars: Car[]) => void;
}
interface AvailableCarsState {
    cars: Car[];
    // updateCars: (cars: Car[]) => void;
}

class AvailableCars extends React.Component<AvailableCarsProps, AvailableCarsState> {
    constructor (props) {
        super(props);
        this.state = {
            cars: this.props.cars
        };
    }

    render() {
        console.log("update AvailableCars render");
      let cars : {email: string; description: string}[] = [];
      for (let i in this.props.cars) {
          cars.push({email: this.props.cars[i].Email, description: this.props.cars[i].Description});
      }

      let rows = cars.map((car) => { return (
          <div className="car_check">
              <label>
                  <input
                      type="radio"
                      name="car"
                      value={car.email}
                      checked={false}
                      className="form-check-input"
                  />
                  {car.description}
              </label>
          </div>
)
    });

    return (
        <form>
            {rows}
            <input type="submit" value="Book this car" />
        </form>
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
  const cars = [];
  const startTime = '2020-01-20';
  const endTime = '2020-01-21';

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
      <CarAvailablePicker user={user} startTime={startTime} endTime={endTime} cars={cars} />
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

const CARS =
    [
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
