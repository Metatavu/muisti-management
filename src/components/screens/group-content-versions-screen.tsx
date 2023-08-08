// TODO: This file can be removed once groupContentVersions are merged with contentVersions

// import Api from "../../api/api";
// import {
//   Exhibition,
//   ExhibitionDeviceGroup,
//   ExhibitionRoom,
//   GroupContentVersion,
//   GroupContentVersionStatus
// } from "../../generated/client";
// import { ContentVersion } from "../../generated/client/models/ContentVersion";
// import strings from "../../localization/strings";
// import { ReduxActions, ReduxState } from "../../store";
// import styles from "../../styles/exhibition-view";
// import theme from "../../styles/theme";
// import { AccessToken, ActionButton, BreadcrumbData, ConfirmDialogData } from "../../types";
// import CardItem from "../generic/card/card-item";
// import CardList from "../generic/card/card-list";
// import ConfirmDialog from "../generic/confirm-dialog";
// import GenericDialog from "../generic/generic-dialog";
// import GroupContentVersionsInfo from "../group-content-version/group-content-versions-info";
// import BasicLayout from "../layouts/basic-layout";
// import ElementSettingsPane from "../layouts/element-settings-pane";
// import {
//   CircularProgress,
//   Divider,
//   FormControl,
//   FormHelperText,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography
// } from "@mui/material";
// import { WithStyles } from "@mui/styles";
// import withStyles from "@mui/styles/withStyles";
// import { History } from "history";
// import produce from "immer";
// import { KeycloakInstance } from "keycloak-js";
// import * as React from "react";
// import { connect } from "react-redux";
// import { Dispatch } from "redux";

// /**
//  * Component props
//  */
// interface Props extends WithStyles<typeof styles> {
//   history: History;
//   keycloak: KeycloakInstance;
//   accessToken: AccessToken;
//   exhibitionId: string;
//   roomId: string;
//   contentVersionId: string;
// }

// /**
//  * Component state
//  */
// interface State {
//   loading: boolean;
//   exhibition?: Exhibition;
//   room?: ExhibitionRoom;
//   contentVersion?: ContentVersion;
//   groupContentVersions: GroupContentVersion[];
//   deviceGroups: ExhibitionDeviceGroup[];
//   addDialogOpen: boolean;
//   selectedGroupContentVersion?: GroupContentVersion;
//   deleteDialogOpen: boolean;
//   addNewGroupContentVersion: boolean;
//   dataChanged: boolean;
//   confirmDialogData: ConfirmDialogData;
// }

// /**
//  * Component for group content versions screen
//  */
// class GroupContentVersionsScreen extends React.Component<Props, State> {
//   /**
//    * Constructor
//    *
//    * @param props component properties
//    */
//   constructor(props: Props) {
//     super(props);
//     this.state = {
//       loading: false,
//       groupContentVersions: [],
//       deviceGroups: [],
//       addDialogOpen: false,
//       deleteDialogOpen: false,
//       addNewGroupContentVersion: false,
//       dataChanged: false,
//       confirmDialogData: {
//         title: strings.groupContentVersion.delete.deleteTitle,
//         text: strings.groupContentVersion.delete.deleteText,
//         cancelButtonText: strings.confirmDialog.cancel,
//         positiveButtonText: strings.confirmDialog.delete,
//         deletePossible: true,
//         onCancel: this.onCloseOrCancelClick,
//         onClose: this.onCloseOrCancelClick
//       }
//     };
//   }

//   /**
//    * Component did mount life cycle handler
//    */
//   public componentDidMount = async () => {
//     this.setState({ loading: true });
//     await this.fetchData();
//     this.setState({ loading: false });
//   };

//   /**
//    * Component render method
//    */
//   public render = () => {
//     const { classes, history, keycloak } = this.props;
//     const { contentVersion, selectedGroupContentVersion } = this.state;
//     const breadcrumbs = this.getBreadcrumbsData();
//     const actionBarButtons = this.getActionButtons();

//     if (this.state.loading) {
//       return (
//         <BasicLayout
//           keycloak={keycloak}
//           history={history}
//           title={contentVersion?.name || ""}
//           breadcrumbs={breadcrumbs}
//           actionBarButtons={actionBarButtons}
//         >
//           <div className={classes.loader}>
//             <CircularProgress size={50} color="secondary"></CircularProgress>
//           </div>
//         </BasicLayout>
//       );
//     }

//     return (
//       <BasicLayout
//         keycloak={keycloak}
//         history={history}
//         title={contentVersion?.name || ""}
//         breadcrumbs={breadcrumbs}
//         actionBarButtons={actionBarButtons}
//       >
//         {this.renderGroupContentVersionCardsList()}
//         {this.renderAddDialog()}
//         {this.renderConfirmDeleteDialog()}
//         <ElementSettingsPane
//           open={true}
//           title={strings.generic.properties}
//           width={selectedGroupContentVersion && contentVersion ? 320 : 0}
//         >
//           {selectedGroupContentVersion && contentVersion && (
//             <GroupContentVersionsInfo
//               contentVersion={contentVersion}
//               groupContentVersion={selectedGroupContentVersion}
//               onValueChange={this.onGroupContentValueChange}
//             />
//           )}
//         </ElementSettingsPane>
//       </BasicLayout>
//     );
//   };

//   /**
//    * Renders group content versions as card list
//    */
//   private renderGroupContentVersionCardsList = () => {
//     const {
//       groupContentVersions,
//       exhibition,
//       room,
//       contentVersion,
//       selectedGroupContentVersion,
//       deviceGroups
//     } = this.state;
//     const cards = groupContentVersions.map((groupContentVersion) => {
//       const groupContentVersionId = groupContentVersion.id;
//       if (!groupContentVersionId || !exhibition || !room || !contentVersion) {
//         return null;
//       }

//       const deviceGroupName =
//         deviceGroups.find((group) => group.id === groupContentVersion.deviceGroupId)?.name || "";

//       return (
//         <CardItem
//           key={groupContentVersionId}
//           title={groupContentVersion.name}
//           subtitle={contentVersion?.name}
//           context={
//             <div>
//               <Typography variant="body1">{`${room.name} /`}</Typography>
//               <Typography variant="body1">{deviceGroupName}</Typography>
//             </div>
//           }
//           onClick={() => this.onCardClick(groupContentVersion)}
//           menuOptions={this.getCardMenuOptions(groupContentVersion)}
//           selected={selectedGroupContentVersion?.id === groupContentVersion.id}
//           onActionClick={() => this.openTimeline(groupContentVersion)}
//         />
//       );
//     });

//     return <CardList title={strings.groupContentVersion.title}>{cards}</CardList>;
//   };

//   /**
//    * Renders add dialog
//    */
//   private renderAddDialog = () => {
//     return (
//       <GenericDialog
//         cancelButtonText={strings.genericDialog.cancel}
//         positiveButtonText={strings.genericDialog.add}
//         title={strings.groupContentVersion.addDialogTitle}
//         error={false}
//         onConfirm={this.onDialogSaveClick}
//         onCancel={this.onCloseOrCancelClick}
//         open={this.state.addDialogOpen}
//         onClose={this.onCloseOrCancelClick}
//       >
//         {this.renderDialogContent()}
//       </GenericDialog>
//     );
//   };

//   /**
//    * Renders delete confirmation dialog
//    */
//   private renderConfirmDeleteDialog = () => {
//     const { deleteDialogOpen, confirmDialogData } = this.state;

//     return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
//   };

//   /**
//    * Render dialog content
//    */
//   private renderDialogContent = () => {
//     const { selectedGroupContentVersion, deviceGroups, room } = this.state;
//     if (!room) {
//       return;
//     }

//     const deviceGroupSelectItems = deviceGroups
//       .filter((group) => group.roomId === room.id)
//       .map((group) => (
//         <MenuItem key={group.id} value={group.id}>
//           {group.name}
//         </MenuItem>
//       ));

//     return (
//       <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
//         <Grid item xs={12}>
//           <TextField
//             label={strings.groupContentVersion.name}
//             fullWidth
//             type="text"
//             name="name"
//             variant="outlined"
//             value={selectedGroupContentVersion ? selectedGroupContentVersion.name : ""}
//             onChange={this.onValueChange}
//           />
//           <Divider
//             variant="fullWidth"
//             color="rgba(0,0,0,0.1)"
//             style={{ marginTop: 19, width: "100%" }}
//           />
//         </Grid>
//         <Grid item xs={12}>
//           <FormControl>
//             <InputLabel>{strings.groupContentVersion.deviceGroup}</InputLabel>
//             <Select
//               fullWidth
//               label={strings.groupContentVersion.deviceGroup}
//               name="deviceGroupId"
//               value={selectedGroupContentVersion ? selectedGroupContentVersion.deviceGroupId : ""}
//               onChange={this.onValueChange}
//             >
//               {deviceGroupSelectItems}
//             </Select>
//             <FormHelperText>
//               {strings.helpTexts.groupContentVersions.selectDeviceGroupDescription}
//             </FormHelperText>
//           </FormControl>
//         </Grid>
//       </Grid>
//     );
//   };

//   /**
//    * Fetches component data
//    */
//   private fetchData = async () => {
//     const { accessToken, exhibitionId, roomId, contentVersionId } = this.props;

//     const exhibitionsApi = Api.getExhibitionsApi(accessToken);
//     const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
//     const contentVersionsApi = Api.getContentVersionsApi(accessToken);
//     const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
//     const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);

//     const [exhibition, room, contentVersion, groupContentVersions, deviceGroups] =
//       await Promise.all<
//         Exhibition,
//         ExhibitionRoom,
//         ContentVersion,
//         GroupContentVersion[],
//         ExhibitionDeviceGroup[]
//       >([
//         exhibitionsApi.findExhibition({ exhibitionId }),
//         exhibitionRoomsApi.findExhibitionRoom({ exhibitionId, roomId }),
//         contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId }),
//         groupContentVersionApi.listGroupContentVersions({ exhibitionId, contentVersionId }),
//         deviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId })
//       ]);

//     this.setState({ exhibition, room, contentVersion, groupContentVersions, deviceGroups });
//   };

//   /**
//    * Gets card menu options
//    *
//    * @param groupContentVersion selected group content version
//    * @returns card menu options as action button array
//    */
//   private getCardMenuOptions = (groupContentVersion: GroupContentVersion): ActionButton[] => {
//     return [
//       {
//         name: strings.exhibitions.cardMenu.delete,
//         action: () => this.onDeleteGroupContentVersionClick(groupContentVersion)
//       }
//     ];
//   };

//   /**
//    * Gets breadcrumbs data
//    *
//    * @returns array of breadcrumb data objects
//    */
//   private getBreadcrumbsData = (): BreadcrumbData[] => {
//     const { exhibitionId, roomId } = this.props;
//     const { exhibition, room, contentVersion } = this.state;
//     return [
//       { name: strings.exhibitions.listTitle, url: "/exhibitions" },
//       { name: exhibition?.name || "", url: `/exhibitions/${exhibitionId}/content` },
//       {
//         name: room?.name || "",
//         url: `/exhibitions/${exhibitionId}/content/floors/${room?.floorId}/rooms/${roomId}`
//       },
//       { name: contentVersion?.name || "" }
//     ];
//   };

//   /**
//    * Gets action buttons
//    *
//    * @returns array of action button objects
//    */
//   private getActionButtons = (): ActionButton[] => {
//     const { dataChanged } = this.state;
//     return [
//       {
//         name: strings.generic.save,
//         action: this.onSaveClick,
//         disabled: !dataChanged
//       },
//       {
//         name: strings.groupContentVersion.add,
//         action: this.onAddGroupContentVersionClick
//       }
//     ];
//   };

//   /**
//    * Event handler for delete group content version click
//    *
//    * @param groupContentVersion group content version to delete
//    */
//   private onDeleteGroupContentVersionClick = (groupContentVersion: GroupContentVersion) => {
//     const tempDeleteData = { ...this.state.confirmDialogData } as ConfirmDialogData;
//     tempDeleteData.onConfirm = () => this.deleteGroupContentVersion(groupContentVersion);
//     this.setState({
//       deleteDialogOpen: true,
//       selectedGroupContentVersion: groupContentVersion,
//       confirmDialogData: tempDeleteData
//     });
//   };

//   /**
//    * Deletes group content version
//    *
//    * @param groupContentVersion selected group content version
//    */
//   private deleteGroupContentVersion = (groupContentVersion: GroupContentVersion) => {
//     const { accessToken, exhibitionId } = this.props;
//     const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);

//     if (!groupContentVersion.id) {
//       return;
//     }

//     groupContentVersionApi.deleteGroupContentVersion({
//       exhibitionId: exhibitionId,
//       groupContentVersionId: groupContentVersion.id
//     });

//     this.setState({
//       deleteDialogOpen: false,
//       selectedGroupContentVersion: undefined,
//       groupContentVersions: this.state.groupContentVersions.filter(
//         (version) => version.id !== groupContentVersion.id
//       )
//     });
//   };

//   /**
//    * Event handler for value change
//    *
//    * @param event react change event
//    */
//   private onValueChange = (
//     event: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: any }>
//   ) => {
//     const { selectedGroupContentVersion } = this.state;
//     const key = event.target.name;
//     const value = event.target.value;
//     if (!key || value === undefined || !selectedGroupContentVersion) {
//       return;
//     }

//     this.setState({
//       selectedGroupContentVersion: { ...selectedGroupContentVersion, [key]: value }
//     });
//   };

//   /**
//    * Event handler for card click
//    *
//    * @param contentVersionId content version id
//    */
//   private onCardClick = (groupContentVersion: GroupContentVersion) => {
//     this.setState({
//       selectedGroupContentVersion: groupContentVersion
//     });
//   };

//   /**
//    * Opens timeline screen
//    *
//    * @param groupContentVersion selected group content version
//    */
//   private openTimeline = (groupContentVersion: GroupContentVersion) => {
//     const { history } = this.props;
//     history.push(
//       `${history.location.pathname}/groupContentVersions/${groupContentVersion.id}/timeline`
//     );
//   };

//   /**
//    * Event handler for group content value change
//    *
//    * @param groupContentVersion group content version
//    */
//   private onGroupContentValueChange = (groupContentVersion: GroupContentVersion) => {
//     const { groupContentVersions } = this.state;
//     const temp = [...groupContentVersions];

//     const index = groupContentVersions.findIndex(
//       (version) => version.id === groupContentVersion.id
//     );
//     if (index > -1) {
//       temp.splice(index, 1, groupContentVersion);
//     }
//     this.setState({
//       groupContentVersions: temp,
//       selectedGroupContentVersion: groupContentVersion,
//       dataChanged: true
//     });
//   };

//   /**
//    * Event handler for dialog save click
//    */
//   private onDialogSaveClick = async () => {
//     const { accessToken, exhibitionId } = this.props;
//     const { selectedGroupContentVersion } = this.state;

//     if (!selectedGroupContentVersion) {
//       return;
//     }

//     const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
//     const createdContentVersion = await groupContentVersionApi.createGroupContentVersion({
//       exhibitionId: exhibitionId,
//       groupContentVersion: selectedGroupContentVersion
//     });

//     const groupContentVersions = produce(this.state.groupContentVersions, (draft) => {
//       draft.push(createdContentVersion);
//     });

//     this.setState({
//       groupContentVersions,
//       addDialogOpen: false,
//       selectedGroupContentVersion: undefined,
//       dataChanged: false
//     });
//   };

//   /**
//    * Event handler for close of cancel click
//    */
//   private onCloseOrCancelClick = () => {
//     this.setState({
//       addDialogOpen: false,
//       deleteDialogOpen: false,
//       selectedGroupContentVersion: undefined
//     });
//   };

//   /**
//    * Event handler for add group content version click
//    */
//   private onAddGroupContentVersionClick = () => {
//     const { contentVersionId } = this.props;
//     const selectedGroupContentVersion: GroupContentVersion = {
//       name: "",
//       contentVersionId: contentVersionId,
//       deviceGroupId: "",
//       status: GroupContentVersionStatus.Notstarted
//     };

//     this.setState({
//       addDialogOpen: true,
//       selectedGroupContentVersion: selectedGroupContentVersion
//     });
//   };

//   /**
//    * Event handler for save click
//    */
//   private onSaveClick = async () => {
//     const { accessToken, exhibitionId } = this.props;
//     const { selectedGroupContentVersion } = this.state;
//     if (!selectedGroupContentVersion) {
//       return;
//     }

//     const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
//     const updatedGroupContentVersion = await groupContentVersionApi.updateGroupContentVersion({
//       exhibitionId: exhibitionId,
//       groupContentVersion: selectedGroupContentVersion,
//       groupContentVersionId: selectedGroupContentVersion.id!
//     });

//     this.setState({
//       addDialogOpen: false,
//       selectedGroupContentVersion: updatedGroupContentVersion,
//       dataChanged: false
//     });
//   };
// }

// /**
//  * Redux mapper for mapping store state to component props
//  *
//  * @param state store state
//  */
// function mapStateToProps(state: ReduxState) {
//   return {
//     keycloak: state.auth.keycloak as KeycloakInstance,
//     accessToken: state.auth.accessToken as AccessToken
//   };
// }

// /**
//  * Redux mapper for mapping component dispatches
//  *
//  * @param dispatch dispatch method
//  */
// function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
//   return {};
// }

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(styles)(GroupContentVersionsScreen));
