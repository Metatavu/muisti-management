import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { CssBaseline, responsiveFontSizes } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import muistiTheme from "../styles/theme";
import ExhibitionsView from "./exhibitions/exhibitions-view";
import AccessTokenRefresh from "./generic/access-token-refresh";
import { Provider } from "react-redux";
import { StoreState } from "../types";
import { createStore } from 'redux';
import { AppAction } from "../actions";
import { reducer } from "../reducers";

const initalStoreState: StoreState = {
};

const store = createStore<StoreState, AppAction, any, any>(reducer as any, initalStoreState);

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
                    <ExhibitionsView history={history} />
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