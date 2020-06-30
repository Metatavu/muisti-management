import * as React from "react";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { ReduxState, ReduxActions, rootReducer } from "../store";
import * as immer from "immer";

import { ThemeProvider } from "@material-ui/styles";
import muistiTheme from "../styles/theme";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { CssBaseline, responsiveFontSizes } from "@material-ui/core";
import strings from "../localization/strings";
import AccessTokenRefresh from "./containers/access-token-refresh";
import StoreInitializer from "./containers/store-initializer";
import DashboardOverviewView from "./dashboard/dashboard-overview-view";
import DashboardRecentView from "./dashboard/dashboard-recent-view";
import DashboardDraftsView from "./dashboard/dashboard-drafts-view";
import DashboardArchivedView from "./dashboard/dashboard-archived-view";
import DashboardSettingsView from "./dashboard/dashboard-settings-view";
import DashboardUsersView from "./dashboard/dashboard-users-view";
import DashboardDevicesView from "./dashboard/dashboard-devices-view";
import DashboardFloorPlansView from "./dashboard/dashboard-floor-plans-view";
import FloorPlanEditorView from "./floor-plan/floor-plan-editor-view";
import moment from "moment";
import "moment/locale/fi";
import "moment/locale/en-gb";

import ExhibitionsScreen from "./screens/exhibitions-screen";
import RoomsScreen from "./screens/rooms-screen";
import ContentVersionsScreen from "./screens/content-versions-screen";
import GroupContentVersionsScreen from "./screens/group-content-versions-screen";
import LayoutsScreen from "./screens/layouts-screen";
import LayoutScreen from "./screens/layout-screen";
import DeviceModelsScreen from "./screens/device-models-screen";
import FloorPlansScreen from "./screens/floor-plans-screen";
import FloorPlanScreen from "./screens/floor-plan-screen";
import TimelineScreen from "./screens/timeline-screen";

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
    immer.enableAllPlugins();
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
                    <Redirect exact from="/" to="/v4/exhibitions" />
                    <Route
                      path="/dashboard/overview"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardOverviewView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/recent"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardRecentView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/drafts"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardDraftsView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/archived"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardArchivedView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/settings"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardSettingsView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/users"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardUsersView history={ history } />
                      )}
                    />
                    <Route
                      path="/dashboard/devices"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardDevicesView history={ history } />
                      )}
                    />
                    {/* Remove this once the V4 floorplan view is done! */}
                    <Route
                      path="/dashboard/floorplans"
                      exact={ true }
                      render={ ({ history }) => (
                        <DashboardFloorPlansView history={ history } />
                      )}
                    />
                    <Route
                      path="/v4/exhibitions"
                      exact={ true }
                      render={({ history }) => (
                        <ExhibitionsScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/v4/exhibitions/:exhibitionId/floorplan"
                      exact={ true }
                      render={({ history, match }) => (
                        <FloorPlanEditorView
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          exhibitionFloorId={ match.params.exhibitionFloorId }
                          readOnly={ true }
                        />
                      )}
                    />
                    <Route
                      path={[
                        "/v4/exhibitions/:exhibitionId/content",
                        "/v4/exhibitions/:exhibitionId/content/floors/:floorId"
                      ]}
                      exact={ true }
                      render={({ history, match }) => (
                        <RoomsScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/v4/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId"
                      exact={ true }
                      render={({ history, match }) => (
                        <ContentVersionsScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          roomId={ match.params.roomId }
                        />
                      )}
                    />
                    <Route
                      path="/v4/exhibitions/:exhibitionId/floorplan/floors/:floorId/rooms/:roomId"
                      exact={ true }
                      render={({ history, match }) => (
                        <FloorPlanEditorView
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          exhibitionFloorId={ match.params.floorId }
                          roomId={ match.params.roomId }
                          contentVersionId={ match.params.versionId }
                          readOnly={ true }
                        />
                      )}
                    />
                    <Route
                      path="/v4/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId"
                      exact={ true }
                      render={({ history, match }) => (
                        <GroupContentVersionsScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          roomId={ match.params.roomId }
                          contentVersionId={ match.params.contentVersionId }
                        />
                      )}
                    />
                    <Route
                      path="/v4/exhibitions/:exhibitionId/floorplan/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId"
                      exact={ true }
                      render={({ history, match }) => (
                        <FloorPlanEditorView
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          exhibitionFloorId={ match.params.floorId }
                          roomId={ match.params.roomId }
                          contentVersionId={ match.params.contentVersionId }
                          readOnly={ true }
                        />
                      )}
                    />
                    <Route
                      path={[
                        "/v4/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId/groupContentVersions/:groupContentVersionId/timeline",
                        "/v4/exhibitions/:exhibitionId/floorplan/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId/groupContentVersions/:groupContentVersionId/timeline"
                      ]}
                      exact={ true }
                      render={({ history, match }) => (
                        <TimelineScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          floorId={ match.params.floorId }
                          roomId={ match.params.roomId }
                          contentVersionId={ match.params.contentVersionId }
                          groupContentVersionId={ match.params.groupContentVersionId }
                        />
                      )}
                    />
                    <Route
                      path="/v4/layouts"
                      exact={ true }
                      render={({ history }) => (
                        <LayoutsScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/v4/layouts/:layoutId"
                      exact={ true }
                      render={({ history, match }) => (
                        <LayoutScreen
                          history={ history }
                          layoutId={ match.params.layoutId }
                        />
                      )}
                    />
                    <Route
                      path="/v4/deviceModels"
                      exact={ true }
                      render={({ history }) => (
                        <DeviceModelsScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/v4/floorPlans"
                      exact={ true }
                      render={({ history }) => (
                        <FloorPlansScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/v4/floorPlans/:exhibitionId"
                      exact={ true }
                      render={({ history, match }) => (
                        <FloorPlanScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    {
                      /**
                       * TODO:
                       * Remove commenting below when all views are done
                       */
                    }
                    {/* <Route
                      path="/v4/users"
                      exact={ true }
                      render={({ history }) => (
                        <UsersScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/v4/users/:userId"
                      exact={ true }
                      render={({ history, match }) => (
                        <UserScreen
                          history={ history }
                          userId={ match.params.userId }
                        />
                      )}
                    /> */}
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