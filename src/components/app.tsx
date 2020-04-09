import * as React from "react";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { ReduxState, ReduxActions, rootReducer } from "../store";

import { ThemeProvider } from "@material-ui/styles";
import muistiTheme from "../styles/theme";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { CssBaseline, responsiveFontSizes } from "@material-ui/core";
import strings from "../localization/strings";
import AccessTokenRefresh from "./generic/access-token-refresh";
import StoreInitializer from "./generic/store-initializer";
import DashboardOverviewView from "./dashboard/dashboard-overview-view";
import DashboardRecentView from "./dashboard/dashboard-recent-view";
import DashboardDraftsView from "./dashboard/dashboard-drafts-view";
import DashboardArchivedView from "./dashboard/dashboard-archived-view";
import DashboardSettingsView from "./dashboard/dashboard-settings-view";
import DashboardUsersView from "./dashboard/dashboard-users-view";
import DashboardDevicesView from "./dashboard/dashboard-devices-view";
import DashboardLayoutsView from "./dashboard/dashboard-layouts-view";
import ExhibitionViewV3 from "./exhibition-v3/exhibition-view-v3";
import LayoutEditorView from "./layout/layout-editor-view";
import moment from "moment";
import "moment/locale/fi";
import "moment/locale/en-gb";

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
   * Component did mount life cycle component
   */
  public componentDidMount = () => {
    moment.locale(strings.getLanguage());
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <AccessTokenRefresh>
            <StoreInitializer>
              <BrowserRouter>
                <div className="App">
                  <Switch>
                    <Redirect exact from="/" to="/dashboard/overview" />
                    <Route
                      path="/dashboard/overview"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardOverviewView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/recent"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardRecentView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/drafts"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardDraftsView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/archived"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardArchivedView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/settings"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardSettingsView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/users"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardUsersView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/devices"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardDevicesView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/layouts"
                      exact={true}
                      render={ ({ history }) => (
                        <DashboardLayoutsView history={ history } />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId"
                      exact={true}
                      render={ ({ match, history }) => (
                        <ExhibitionViewV3 exhibitionId={ match.params.exhibitionId } history={ history } />
                      )}
                    />
                    <Route
                      path="/layouts/:layoutId"
                      exact={true}
                      render={ ({ match, history }) => (
                        <LayoutEditorView history={ history } layoutId={ match.params.layoutId } />
                      )}
                    />
                  </Switch>
                </div>
              </BrowserRouter>
            </StoreInitializer>
          </AccessTokenRefresh>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;