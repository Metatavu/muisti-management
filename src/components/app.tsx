import * as React from "react";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { ReduxState, ReduxActions, rootReducer } from "../store";

import { ThemeProvider } from "@material-ui/styles";
import muistiTheme from "../styles/theme";
import { BrowserRouter, Route } from "react-router-dom";
import { CssBaseline, responsiveFontSizes } from "@material-ui/core";
import ExhibitionsView from "./exhibitions/exhibitions-view";
import AccessTokenRefresh from "./generic/access-token-refresh";
import ExhibitionView from "./exhibition/exhibition-view";

const store = createStore<ReduxState, ReduxActions, any, any>(rootReducer);

/**
 * Interface representing component properties
 */
interface Props {
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Material UI's automated responsive font sizes
 */
const theme = responsiveFontSizes(muistiTheme);

/**
 * App component
 */
class App extends React.Component<Props, State> {

  /**
   * Component render method
   */
  public render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <AccessTokenRefresh>
            <BrowserRouter>
              <div className="App">
                <Route
                  path="/"
                  exact={true}
                  render={ ({ history }) => (
                    <ExhibitionsView history={ history } />
                  )}
                />
                <Route
                  path="/exhibitions/:exhibitionId"
                  exact={true}
                  render={ ({ history }) => (
                    <ExhibitionView history={ history } />
                  )}
                />
              </div>
            </BrowserRouter>
          </AccessTokenRefresh>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;