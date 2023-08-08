// TODO: Can be deleted when groupContentVersion is merged with contentVersion

// import { GroupContentVersion } from "../../generated/client";
// import { ContentVersion } from "../../generated/client/models/ContentVersion";
// import strings from "../../localization/strings";
// import { ReduxActions, ReduxState } from "../../store";
// import styles from "../../styles/exhibition-view";
// import theme from "../../styles/theme";
// import { AccessToken } from "../../types";
// import { Grid, TextField, Typography } from "@mui/material";
// import { WithStyles } from "@mui/styles";
// import withStyles from "@mui/styles/withStyles";
// import { KeycloakInstance } from "keycloak-js";
// import * as React from "react";
// import { connect } from "react-redux";
// import { Dispatch } from "redux";

// /**
//  * Component props
//  */
// interface Props extends WithStyles<typeof styles> {
//   contentVersion: ContentVersion;
//   groupContentVersion: GroupContentVersion;

//   /**
//    * On value change handler
//    * @param updatedGroupContentVersion group content version
//    */
//   onValueChange: (updatedGroupContentVersion: GroupContentVersion) => void;
// }

// /**
//  * Component state
//  */
// interface State {
//   loading: boolean;
// }

// /**
//  * Component for group content versions info view
//  */
// class GroupContentVersionsInfo extends React.Component<Props, State> {
//   /**
//    * Constructor
//    *
//    * @param props component properties
//    */
//   constructor(props: Props) {
//     super(props);
//     this.state = {
//       loading: false
//     };
//   }

//   /**
//    * Component render method
//    */
//   public render = () => {
//     return <>{this.renderFields()}</>;
//   };

//   /**
//    * Render data fields
//    */
//   private renderFields = () => {
//     const { groupContentVersion } = this.props;

//     /** TODO: Add status functionality when feature is implemented */
//     // const statusSelectItems = Object.keys(GroupContentVersionStatus).map(key =>
//     //   <MenuItem key={ key } value={ key}>{ key }</MenuItem>
//     // );

//     return (
//       <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
//         <Grid item xs={12}>
//           <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">
//             {strings.groupContentVersion.name}
//           </Typography>
//           <TextField
//             fullWidth
//             type="text"
//             name="name"
//             value={groupContentVersion.name}
//             onChange={this.onValueChange}
//           />
//         </Grid>
//         {/* TODO: add the status functionality below when feature is implemented */}
//         {/* <Grid item xs={ 12 }>
//           <FormControl>
//             <InputLabel id={ strings.groupContentVersion.status }>
//               { strings.groupContentVersion.status }
//             </InputLabel>
//             <Select
//               label={ strings.groupContentVersion.status }
//               labelId={ strings.groupContentVersion.status }
//               name="status"
//               value={ groupContentVersion.status }
//               onChange={ this.onValueChange }
//               >
//               { statusSelectItems }
//             </Select>
//           </FormControl>
//           <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
//         </Grid> */}
//       </Grid>
//     );
//   };

//   /**
//    * Event handler for value change
//    *
//    * @param event react change event
//    */
//   private onValueChange = (
//     event: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: any }>
//   ) => {
//     const { onValueChange } = this.props;
//     const key = event.target.name;
//     const value = event.target.value;
//     if (!key || value === undefined) {
//       return;
//     }

//     const groupContentVersionToUpdate = { ...this.props.groupContentVersion, [key]: value };
//     onValueChange(groupContentVersionToUpdate);
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
// )(withStyles(styles)(GroupContentVersionsInfo));
