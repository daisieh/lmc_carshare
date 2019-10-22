import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Transposit, User } from "transposit";
import "./styles.css";

const transposit = new Transposit(
  "https://check-my-cal-ja22m.staging-transposit.com"
);

function useSignedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (!transposit.isSignedIn()) {
      window.location.href = "/signin";
      return;
    }
    setIsLoggedIn(true);
  }, []);
  return isLoggedIn;
}

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

function SignIn() {
  return (
    <button
      onClick={async e => {
        e.preventDefault();
        await transposit.signIn(
          `${window.location.origin}/signin/handle-redirect`
        );
      }}
    >
      Sign In
    </button>
  );
}

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

function Index() {
  const isSignedIn = useSignedIn();
  const user = useUser(isSignedIn);
  const [opResult, setOpResult] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    transposit
      .run("load_todays_events")
      .then(({ results }) => {
        setOpResult(JSON.stringify(results));
      })
      .catch(response => {
        console.log(response);
      });
  }, [isSignedIn]);

  if (!isSignedIn || !user) {
    return null;
  }

  return (
    <div className="App">
      <h1>Hello {JSON.stringify(user)}</h1>
      {opResult && <h2>{opResult}</h2>}
      <div>
        <a href={transposit.settingsUri()}>settings</a>
      </div>
      <div>
        <button
          onClick={() => transposit.signOut(`${window.location.origin}/signin`)}
        >
          logout
        </button>
      </div>
    </div>
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
