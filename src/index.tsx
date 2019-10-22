import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Transposit, User } from "transposit";
import "./styles.css";

const transposit = new Transposit(
  "https://check-my-cal-ja22m.staging-transposit.com"
);

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
          <h1 className="hero-text">Check my cal</h1>
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

  // Load calendar events
  const [calendarEvents, setEvents] = React.useState<any[] | null>(null);
  React.useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    transposit
      .run("load_todays_events")
      .then(({ results }) => {
        setEvents(results);
      })
      .catch(response => {
        console.log(response);
      });
  }, [isSignedIn]);

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
            href={"https://github.com/transposit/check_my_cal"}
          >
            View code
          </a>
          <a className="nav-item" href={transposit.settingsUri()}>
            Settings
          </a>
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
          <h1 className="hero-text">Check my cal</h1>
        </div>
      </header>
      <main className="container main">
        <h2 className="greeting">Hello, {user.name}</h2>
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
