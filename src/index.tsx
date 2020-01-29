import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Transposit, User } from "transposit";
import "./styles.css";

const transposit = new Transposit(
  "https://lmc-carshare-89gbj.transposit.io"
);


interface SearchAvailabilityProps {
    passToParent: (startTime: string, endTime: string) => void;
}
interface SearchAvailabilityState {
    startFieldValue: string;
    endFieldValue: string;
}

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor (props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.passToParent.bind(this);
    }

    handleStartChange(event) {
        event.preventDefault();
        this.setState({startFieldValue: event.target.value})
    }
    handleEndChange(event) {
        event.preventDefault();
        this.setState({endFieldValue: event.target.value})
    }
    handleSubmit(event) {
        event.preventDefault();
        this.props.passToParent(this.state.startFieldValue, this.state.endFieldValue);
    }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Start time..." onChange={this.handleStartChange}/>
        <input type="text" placeholder="End time..." onChange={this.handleEndChange}/>
        <input type="submit" value="Search for available cars" />
      </form>
    );
  }
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

interface CarAvailableProps {
    startTime: string;
    endTime: string;
    user: {name: string; email: string;};
    cars: Car[];
    calSource: string;
    chosenCar: string;
}
interface CarAvailableState {
    startTime: string;
    endTime: string;
    user: {name: string; email: string;};
    cars: Car[];
    calSource: string;
    chosenCar: string;
}

class CarAvailablePicker extends React.Component<CarAvailableProps, CarAvailableState> {
    constructor (props) {
        super(props);
        this.state = { startTime: this.props.startTime, endTime: this.props.endTime, cars: this.props.cars, calSource: this.props.calSource, chosenCar: this.props.chosenCar, user: this.props.user};
        this.updateState = this.updateState.bind(this);
        this.bookCar = this.bookCar.bind(this);
        this.updateChosenCar = this.updateChosenCar.bind(this);
        this.successCallback = this.successCallback.bind(this);
        this.getChosenCar = this.getChosenCar.bind(this);
    }

    async updateState(startTime: string, endTime: string) {
        console.log(`looking for cars between ${startTime} ${endTime}`);
        let x = await transposit
            .run("get_cars_available_for_time", {start: startTime, end: endTime})
            .then(this.successCallback)
            .catch(response => {
                console.log(response);
            });
        this.setState({startTime: x.results[0].start, endTime: x.results[0].end, cars: x.results[0].cars as Car[], calSource: CALENDAR_SRC, chosenCar: ""});
        this.updateChosenCar("");
        console.log(x);
    }

    successCallback(results) {
        return results;
    }

    updateChosenCar(car: string) {
        this.setState({chosenCar: car});
    }

    getChosenCar() {
        return this.state.chosenCar;
    }

    async bookCar(event) {
        event.preventDefault();
        let x = await transposit
            .run("create_reservation", {start: this.state.startTime, end: this.state.endTime, requester: this.state.user.email, vehicle: this.state.chosenCar})
            .then(this.successCallback)
            .catch(response => {
                console.log(response);
            });
        if (x.results[0] != null) {
            this.setState({chosenCar: "", startTime: "", endTime: "", cars: []});
        }
        console.log(x);
        return x;
    }

    render() {
        console.log(`Update CarAvailablePicker render for ${this.state.chosenCar}`);
        let bookit = <div></div>;
        if (this.state.chosenCar !== "") {
            let carEmails = this.state.cars.map((x) => {
                return x.Email;
            });
            if (carEmails.length > 0) {
                let carIndex = carEmails.indexOf(this.state.chosenCar);
                let carDescription = this.state.cars[carIndex].Description;
                bookit = (
                    <div>
                        You're about to book {carDescription} from {this.state.startTime} to {this.state.endTime}...
                        <form onSubmit={this.bookCar}>
                            <input type="submit" value="Book it!"/>
                        </form>
                    </div>
                );
            }
            console.log(carEmails);
        }
    return (
      <div>
        <h2 className="greeting">Hello, {this.props.user.name}</h2>
        <SearchAvailabilityForm passToParent={this.updateState}/>
        <AvailableCars cars={this.state.cars} passToParent={this.updateChosenCar} getChosenCar={this.getChosenCar}/>
          {bookit}
        {/*<CalendarEmbed src={CALENDAR_SRC} />*/}
      </div>
    );
  };

}

interface AvailableCarsProps {
    cars: Car[];
    passToParent: (chosenCar: string) => void;
    getChosenCar: () => string;
}
interface AvailableCarsState {
}

class AvailableCars extends React.Component<AvailableCarsProps, AvailableCarsState> {
    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.props.passToParent.bind(this);
        this.props.getChosenCar.bind(this);
    }

    onClick(event) {
        let chosenCar = event.target.value;
        console.log(`chosenCar = ${chosenCar}`);
        this.setState( () => { this.props.passToParent(chosenCar); });
    }

    render() {
        const chosenCar = this.props.getChosenCar();
        console.log(`Update AvailableCars to ${chosenCar}`);
      let cars : {email: string; description: string}[] = [];
      for (let i in this.props.cars) {
          cars.push({email: this.props.cars[i].Email, description: this.props.cars[i].Description});
      }

      let rows = cars.map((car) => {
          let isChosenCar = (chosenCar === car.email);
          return (
          <div className="car_check">
              <label>
                  <input
                      type="radio"
                      name="car"
                      value={car.email}
                      checked={isChosenCar}
                      className="form-check-input"
                      onChange={this.onClick}
                  />
                  {car.description}
              </label>
          </div>
)
    });

    return (
        <form>
            {rows}
        </form>
    );
  }
}

interface CalendarEmbedProps {
    src: string;
}
interface CalendarEmbedState {
    src: string;
}

class CalendarEmbed extends React.Component<CalendarEmbedProps, CalendarEmbedState> {
    constructor (props) {
        super(props);
        this.state = { src: this.props.src };
    }

    render() {
        console.log("updating calendar");
        return (
            <div>
                <iframe src={this.state.src} width="720" height="400" frameBorder="0" scrolling="no"/>
            </div>
        );
    };

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

// function loadCalendarEvents(isSignedIn: boolean, thisDate: string) {
//   // Load calendar events
//   const [calendarEvents, setEvents] = React.useState<any[] | null>(null);
//
//   React.useEffect(() => {
//     if (!isSignedIn) {
//       return;
//     }
//     transposit
//       .run("load_todays_events", {date: thisDate})
//       .then(({ results }) => {
//         setEvents(results);
//       })
//       .catch(response => {
//         console.log(response);
//       });
//   }, [isSignedIn]);
//   return calendarEvents;
// }


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
      <CarAvailablePicker user={user} startTime={""} endTime={""} cars={[]} calSource={CALENDAR_SRC} chosenCar={""}/>
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

const CALENDAR_SRC = "https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=America%2FVancouver&amp;src=bG1jLmNhcnNoYXJlQGdtYWlsLmNvbQ&amp;color=%2322AA99";

const AVAILABLE_FEATURES =
[
  "pet friendly",
  "child friendly",
  "eco friendly"
];
