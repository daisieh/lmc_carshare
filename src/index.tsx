import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Transposit } from "transposit";
import "./styles.css";

const transposit = new Transposit(
  "https://check-my-cal-ja22m.staging-transposit.com"
);

function SignIn() {
  return (
    <a
      href={transposit.startLoginUri(
        `${window.location.origin}/signin/handle-redirect`
      )}
    >
      Sign in
    </a>
  );
}

function SignInHandleRedirect() {
  React.useEffect(() => {
    try {
      transposit.handleLogin(({ needsKeys }) => {
        if (needsKeys) {
          window.location.href = transposit.settingsUri(window.location.origin);
        } else {
          window.location.href = "/";
        }
      });
    } catch (err) {
      console.log(err);
      window.location.href = "/signin";
    }
  }, []);

  return null;
}

function Index() {
  const [result, setResult] = React.useState<string | null>(null);
  React.useEffect(() => {
    transposit
      .runOperation("load_todays_events")
      .then(response => {
        if (response.status !== "SUCCESS") {
          throw response;
        }
        setResult(JSON.stringify(response.result.results));
      })
      .catch(response => {
        console.log(response);
      });
  }, []);

  if (!transposit.isLoggedIn()) {
    window.location.href = "/signin";
    return null;
  }

  return (
    <div className="App">
      <h1>Hello {transposit.getUserEmail()}</h1>
      {result && <h2>{result}</h2>}
      <div>
        <a href={transposit.settingsUri()}>settings</a>
      </div>
      <div>
        <button
          onClick={() => transposit.logOut(`${window.location.origin}/signin`)}
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
