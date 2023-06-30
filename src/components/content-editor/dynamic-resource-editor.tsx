import {
  DynamicPageResource,
  DynamicPageResourceDataSource,
  DynamicPageResourceSubstitute,
  DynamicPageResourceSwitch,
  DynamicPageResourceSwitchWhen,
  DynamicPageResourceType,
  ExhibitionPageResourceType,
  VisitorVariable
} from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/components/content-editor/resource-editor";
import { AccessToken } from "../../types";
import HelpDialog from "../generic/help-dialog";
import DynamicResourceSwitchWhenList from "./dynamic-resource-switch-when-list";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import produce from "immer";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  data: DynamicPageResource;
  visitorVariables: VisitorVariable[];
  resourceType: ExhibitionPageResourceType;
  onUpdate: (dynamicResourceData: DynamicPageResource) => void;
}

/**
 * Component for dynamic resource editor
 *
 * @param props component props
 */
const DynamicResourceEditor: React.FC<Props> = (props: Props) => {
  return props.data.type === DynamicPageResourceType.Switch
    ? renderSwitchEditor(props.data.params as DynamicPageResourceSwitch, props)
    : renderSubstituteEditor(props.data.params as DynamicPageResourceSubstitute, props);
};

/**
 * Renders switch editor
 *
 * @param dataParams switch data params
 * @param props component props
 */
const renderSwitchEditor = (dataParams: DynamicPageResourceSwitch, props: Props) => {
  const { accessToken, data, visitorVariables, resourceType, onUpdate } = props;

  return (
    <>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          fullWidth
          label={strings.exhibition.resources.dynamic.key}
          name="key"
          select
          value={dataParams.key}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onUpdate(
              getUpdatedData(data, getUpdatedSwitchParams(dataParams, "key", event.target.value))
            )
          }
        >
          {visitorVariables.map((variable) => (
            <MenuItem key={variable.id} value={variable.name}>
              {variable.name}
            </MenuItem>
          ))}
        </TextField>
        <HelpDialog title={strings.exhibition.resources.dynamic.key}>
          <Typography>{strings.helpDialogs.contentEditor.resources.dynamicDescription}</Typography>
        </HelpDialog>
      </Box>
      <DynamicResourceSwitchWhenList
        accessToken={accessToken}
        resourceType={resourceType}
        whenList={dataParams.when ?? []}
        visitorVariable={visitorVariables.find((variable) => variable.name === dataParams.key)}
        onUpdate={(whenList: DynamicPageResourceSwitchWhen[]) => {
          onUpdate(getUpdatedData(data, getUpdatedSwitchParams(dataParams, "when", whenList)));
        }}
      />
    </>
  );
};

/**
 * Renders substitute editor
 *
 * @param dataParams substitute data params
 * @param props component props
 *
 * TODO: needs implementation
 */
const renderSubstituteEditor = (dataParams: DynamicPageResourceSubstitute, props: Props) => {
  return <Typography>{strings.comingSoon}</Typography>;
};

/**
 * Returns updated switch params
 *
 * @param dataParams switch data params
 * @param key params property key
 * @param value params property value
 * @returns updated dynamic page resource switch object
 */
const getUpdatedSwitchParams = (
  dataParams: DynamicPageResourceSwitch,
  key: keyof DynamicPageResourceSwitch,
  value: string | DynamicPageResourceSwitchWhen[]
): DynamicPageResourceSwitch => {
  const updatedParams = produce(dataParams, (draft) => {
    switch (key) {
      case "when":
        draft.when = value as DynamicPageResourceSwitchWhen[];
        break;
      case "dataSource":
        draft.dataSource = value as DynamicPageResourceDataSource;
        break;
      case "key":
        draft.key = value as string;
        break;
      default:
        break;
    }
  });

  return updatedParams;
};

/**
 * Updates dynamic resource data
 *
 * @param data dynamic resource data
 * @param params updated resource data params
 * @returns updated dynamic resource data
 */
const getUpdatedData = (
  data: DynamicPageResource,
  params: DynamicPageResourceSwitch | DynamicPageResourceSubstitute
): DynamicPageResource => {
  return produce(data, (draft) => {
    draft.params = params;
  });
};

export default withStyles(styles)(DynamicResourceEditor);
