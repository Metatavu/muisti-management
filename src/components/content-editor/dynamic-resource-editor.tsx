import * as React from "react";
import { DynamicPageResource, DynamicPageResourceType, DynamicPageResourceSwitch, DynamicPageResourceSwitchWhen, DynamicPageResourceSubstitute, ExhibitionPageResourceType, DynamicPageResourceDataSource } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, Typography } from "@material-ui/core";
import styles from "../../styles/components/content-editor/resource-editor";
import produce from "immer";
import { AccessToken } from "../../types";
import DynamicResourceSwitchWhenList from "./dynamic-resource-switch-when-list";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  data: DynamicPageResource;
  resourceType: ExhibitionPageResourceType;
  onUpdate: (dynamicResourceData: DynamicPageResource) => void;
}

/**
 * Component for dynamic resource editor
 * 
 * @param props component props
 */
const DynamicResourceEditor: React.FC<Props> = (props: Props) => {
  return (props.data.type === DynamicPageResourceType.Switch ?
    renderSwitchEditor(props.data.params as DynamicPageResourceSwitch, props) :
    renderSubstituteEditor(props.data.params as DynamicPageResourceSubstitute, props)
  );
}

/**
 * Renders switch editor
 * 
 * @param dataParams switch data params
 * @param props component props
 */
const renderSwitchEditor = (dataParams: DynamicPageResourceSwitch, props: Props) => {
  const {
    accessToken,
    classes,
    data,
    resourceType,
    onUpdate
  } = props;

  return (
    <>
      <TextField
        className={ classes.field }
        fullWidth
        label={ strings.exhibition.resources.dynamic.key }
        name="key"
        value={ dataParams.key }
        onChange={ (event: React.ChangeEvent<HTMLInputElement>) =>
          onUpdate(getUpdatedData(data, getUpdatedSwitchParams(dataParams, "key", event.target.value)))
        }
      />
      <DynamicResourceSwitchWhenList
        accessToken={ accessToken }
        resourceType={ resourceType }
        whenList={ dataParams.when ?? [] }
        onUpdate={ (whenList: DynamicPageResourceSwitchWhen[]) => {
          onUpdate(getUpdatedData(data, getUpdatedSwitchParams(dataParams, "when", whenList)))
        }}
      />
    </>
  );
}

/**
 * Renders substitute editor
 * 
 * @param dataParams substitute data params
 * @param props component props
 * 
 * TODO: needs implementation
 */
const renderSubstituteEditor = (dataParams: DynamicPageResourceSubstitute, props: Props) => {
  return <Typography>{ strings.comingSoon }</Typography>;
}

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
  const updatedParams = produce(dataParams, draft => {
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
}

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
  return produce(data, draft => {
    draft.params = params;
  });
}

export default withStyles(styles)(DynamicResourceEditor);