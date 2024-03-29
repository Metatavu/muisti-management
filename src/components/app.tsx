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
import ReceptionScreen from "./screens/reception-screen";
import FloorPlansScreen from "./screens/floor-plans-screen";
import FloorPlanScreen from "./screens/floor-plan-screen";
import SubLayoutScreen from "./screens/sub-layout-screen";
import ContentEditorScreen from "./screens/content-editor-screen";
import VisitorVariablesScreen from "./screens/visitor-variables-screen";
import ManageVisitorSessionVariablesScreen from "./screens/manage-visitor-session-variables-screen";
import VisitorsManagementScreen from "./screens/visitors-management-screen";
import DiagnosticsScreen from "./screens/diagnostics-screen";

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
      <ThemeProvider theme={ theme }>
        <CssBaseline />
        <Provider store={ store }>
          <AccessTokenRefresh>
            <StoreInitializer>
              <BrowserRouter>
                <div className="App">
                  <Switch>
                    <Redirect
                      exact
                      from="/"
                      to="/exhibitions"
                    />
                    <Route
                      path="/exhibitions"
                      exact
                      render={({ history }) => (
                        <ExhibitionsScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/floorplan/floors/:floorId"
                      exact
                      render={({ history, match }) => (
                        <FloorPlanEditorView
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          exhibitionFloorId={ match.params.exhibitionFloorId }
                          readOnly
                        />
                      )}
                    />
                    <Route
                      path={[
                        "/exhibitions/:exhibitionId/content",
                        "/exhibitions/:exhibitionId/content/floors/:floorId"
                      ]}
                      exact
                      render={({ history, match }) => (
                        <RoomsScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId"
                      exact
                      render={({ history, match }) => (
                        <ContentVersionsScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          roomId={ match.params.roomId }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/floorplan/floors/:floorId/rooms/:roomId"
                      exact
                      render={({ history, match }) => (
                        <FloorPlanEditorView
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          exhibitionFloorId={ match.params.floorId }
                          roomId={ match.params.roomId }
                          readOnly
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId"
                      exact
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
                      path="/exhibitions/:exhibitionId/floorplan/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId"
                      exact
                      render={({ history, match }) => (
                        <FloorPlanEditorView
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                          exhibitionFloorId={ match.params.floorId }
                          roomId={ match.params.roomId }
                          contentVersionId={ match.params.contentVersionId }
                          readOnly
                        />
                      )}
                    />
                    <Route
                      path={[
                        "/exhibitions/:exhibitionId/content/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId/groupContentVersions/:groupContentVersionId/timeline",
                        "/exhibitions/:exhibitionId/floorplan/floors/:floorId/rooms/:roomId/contentVersions/:contentVersionId/groupContentVersions/:groupContentVersionId/timeline"
                      ]}
                      exact
                      render={({ history, match }) => (
                        <ContentEditorScreen
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
                      path="/layouts"
                      exact
                      render={({ history }) => (
                        <LayoutsScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/layouts/:layoutId"
                      exact
                      render={({ history, match }) => (
                        <LayoutScreen
                          history={ history }
                          layoutId={ match.params.layoutId }
                        />
                      )}
                    />
                    <Route
                      path="/layouts/sub/:subLayoutId"
                      exact
                      render={({ history, match }) => (
                        <SubLayoutScreen
                          history={ history }
                          subLayoutId={ match.params.subLayoutId }
                        />
                      )}
                    />
                    <Route
                      path="/deviceModels"
                      exact
                      render={({ history }) => (
                        <DeviceModelsScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/visitors"
                      exact
                      render={({ history, match }) => (
                        <VisitorsManagementScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/reception"
                      exact
                      render={({ history, match }) => (
                        <ReceptionScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/visitorVariables"
                      exact
                      render={({ history, match }) => (
                        <VisitorVariablesScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/resetVisitorVariables"
                      exact
                      render={({ history, match }) => (
                        <ManageVisitorSessionVariablesScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/exhibitions/:exhibitionId/diagnostics"
                      exact
                      render={({ history, match }) => (
                        <DiagnosticsScreen
                          history={ history }
                          exhibitionId={ match.params.exhibitionId }
                        />
                      )}
                    />
                    <Route
                      path="/floorPlans"
                      exact
                      render={({ history }) => (
                        <FloorPlansScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/floorPlans/:exhibitionId"
                      exact
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
                      path="/users"
                      exact
                      render={({ history }) => (
                        <UsersScreen
                          history={ history }
                        />
                      )}
                    />
                    <Route
                      path="/users/:userId"
                      exact
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