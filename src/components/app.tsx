import strings from "../localization/strings";
import { ReduxActions, ReduxState, rootReducer } from "../store";
import muistiTheme from "../styles/theme";
import AccessTokenRefresh from "./containers/access-token-refresh";
import StoreInitializer from "./containers/store-initializer";
import ContentEditorScreen from "./screens/content-editor-screen";
import ContentVersionsScreen from "./screens/content-versions-screen";
import DeviceModelsScreen from "./screens/device-models-screen";
import DiagnosticsScreen from "./screens/diagnostics-screen";
import ExhibitionsScreen from "./screens/exhibitions-screen";
import FleetManagementScreen from "./screens/fleet-management-screen";
import FloorPlanScreen from "./screens/floor-plan-screen";
import FloorPlansScreen from "./screens/floor-plans-screen";
import LayoutScreenAndroid from "./screens/layout-screen-android";
import LayoutScreenHTML from "./screens/layout-screen-html";
import LayoutsScreen from "./screens/layouts-screen";
import ManageVisitorSessionVariablesScreen from "./screens/manage-visitor-session-variables-screen";
import ReceptionScreen from "./screens/reception-screen";
import RoomsScreen from "./screens/rooms-screen";
import SubLayoutScreen from "./screens/sub-layout-screen";
import VisitorVariablesScreen from "./screens/visitor-variables-screen";
import VisitorsManagementScreen from "./screens/visitors-management-screen";
import { CssBaseline, responsiveFontSizes } from "@mui/material";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import * as immer from "immer";
import moment from "moment";
import "moment/dist/locale/en-gb";
import "moment/dist/locale/fi";
import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { createStore } from "redux";

declare module "@mui/styles/defaultTheme" {}

const store = createStore<ReduxState, ReduxActions, any, any>(rootReducer);

/**
 * Material UI's automated responsive font sizes
 */
const theme = responsiveFontSizes(muistiTheme);

/**
 * App component
 */
class App extends React.Component<{}, {}> {
  /**
   * Component did mount life cycle component
   */
  public componentDidMount = () => {
    strings.setLanguage("fi");
    moment.locale(strings.getLanguage());
    immer.enableAllPlugins();
  };

  /**
   * Component render method
   */
  public render() {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fi">
            <Provider store={store}>
              <AccessTokenRefresh>
                <StoreInitializer>
                  <BrowserRouter>
                    <div className="App">
                      <Switch>
                        <Redirect exact from="/" to="/exhibitions" />
                        <Route
                          path="/fleetManagement"
                          exact
                          render={({ history }) => <FleetManagementScreen history={history} />}
                        />
                        <Route
                          path="/exhibitions"
                          exact
                          render={({ history }) => <ExhibitionsScreen history={history} />}
                        />
                        <Route
                          path={[
                            "/exhibitions/:exhibitionId/content",
                            "/exhibitions/:exhibitionId/content/floors/:floorId"
                          ]}
                          exact
                          render={({ history, match }) => (
                            <RoomsScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                        <Route
                          path="/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId"
                          exact
                          render={({ history, match }) => (
                            <ContentVersionsScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                              roomId={match.params.roomId}
                            />
                          )}
                        />
                        <Route
                          path={[
                            "/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId/timeline"
                          ]}
                          exact
                          render={({ history, match }) => (
                            <ContentEditorScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                              floorId={match.params.floorId}
                              roomId={match.params.roomId}
                              contentVersionId={match.params.contentVersionId}
                            />
                          )}
                        />
                        <Route
                          path="/layouts"
                          exact
                          render={({ history }) => <LayoutsScreen history={history} />}
                        />
                        <Route
                          path="/layouts/HTML/:layoutId"
                          exact
                          render={({ history, match }) => (
                            <LayoutScreenHTML history={history} layoutId={match.params.layoutId} />
                          )}
                        />
                        <Route
                          path="/layouts/ANDROID/:layoutId"
                          exact
                          render={({ history, match }) => (
                            <LayoutScreenAndroid
                              history={history}
                              layoutId={match.params.layoutId}
                            />
                          )}
                        />
                        <Route
                          path="/layouts/sub/:subLayoutId"
                          exact
                          render={({ history, match }) => (
                            <SubLayoutScreen
                              history={history}
                              subLayoutId={match.params.subLayoutId}
                            />
                          )}
                        />
                        <Route
                          path="/deviceModels"
                          exact
                          render={({ history }) => <DeviceModelsScreen history={history} />}
                        />
                        <Route
                          path="/exhibitions/:exhibitionId/visitors"
                          exact
                          render={({ history, match }) => (
                            <VisitorsManagementScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                        <Route
                          path="/exhibitions/:exhibitionId/reception"
                          exact
                          render={({ history, match }) => (
                            <ReceptionScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                        <Route
                          path="/exhibitions/:exhibitionId/visitorVariables"
                          exact
                          render={({ history, match }) => (
                            <VisitorVariablesScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                        <Route
                          path="/exhibitions/:exhibitionId/resetVisitorVariables"
                          exact
                          render={({ history, match }) => (
                            <ManageVisitorSessionVariablesScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                        <Route
                          path="/exhibitions/:exhibitionId/diagnostics"
                          exact
                          render={({ history, match }) => (
                            <DiagnosticsScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                        <Route
                          path="/floorPlans"
                          exact
                          render={({ history }) => <FloorPlansScreen history={history} />}
                        />
                        <Route
                          path="/floorPlans/:exhibitionId"
                          exact
                          render={({ history, match }) => (
                            <FloorPlanScreen
                              history={history}
                              exhibitionId={match.params.exhibitionId}
                            />
                          )}
                        />
                      </Switch>
                    </div>
                  </BrowserRouter>
                </StoreInitializer>
              </AccessTokenRefresh>
            </Provider>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }
}

export default App;
