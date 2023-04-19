import { useState } from "react";
import { PageLayoutViewHtml, SubLayout } from "../../generated/client";
import strings from "../../localization/strings";
import GenericDialog from "../generic/generic-dialog";
import { MenuItem, Stack, FormControl, InputLabel, Select, FormHelperText, Typography, Box, TextField, SelectChangeEvent } from "@mui/material";
import theme from "../../styles/theme";
import { HtmlComponentType } from "../../types";
import LanguageUtils from "../../utils/language-utils";
import HtmlComponentsUtils from "../../utils/html-components-utils";

/**
 * Components properties
 */
interface Props {
  open: boolean;
  subLayouts: SubLayout[];
  siblingPath?: string;
  onConfirm: (componentData: string, siblingPath: string) => void;
  onClose: () => void;
}

/**
 * Add New Element Dialog component
 */
const AddNewElementDialog = ({
  open,
  subLayouts,
  siblingPath,
  onConfirm,
  onClose
}: Props) => {
  const [ newComponentName, setNewComponentName ] = useState<string>();
  const [ newComponentType, setNewComponentType ] = useState<HtmlComponentType>();
  const [ selectedSubLayoutId, setSelectedSubLayoutId ] = useState<string>();
  
  /**
   * Event handler for dialog confirm click
   */
  const onConfirmClick = () => {
    if (!siblingPath) return;
    
    if (selectedSubLayoutId) {
      const foundSublayout = subLayouts.find(subLayout => subLayout.id === selectedSubLayoutId);
      
      if (!foundSublayout) return;
      
      onConfirm((foundSublayout.data as PageLayoutViewHtml).html, siblingPath);
    } else if (newComponentType) {
      onConfirm(HtmlComponentsUtils.getSerializedHtmlElement(newComponentType, newComponentName), siblingPath); 
    }
    
    onCloseOrCancelClick();
  };
  
  /**
   * Event handler for dialog close click
   */
  const onCloseOrCancelClick = () => {
    setNewComponentName(undefined);
    setNewComponentType(undefined);
    setSelectedSubLayoutId(undefined);
    onClose();
  };
  
  /**
   * Event handler for component type select change event
   */
  const onComponentTypeChange = ({ target: { value } }: SelectChangeEvent<HtmlComponentType>) => setNewComponentType(value as HtmlComponentType);

  /**
   * Event handler for sublayout select change event
   */
  const onSubLayoutChange = ({ target: { value } }: SelectChangeEvent<string>) => setSelectedSubLayoutId(value);
  
  /**
   * Event handler for component name text field change event
   */
  const onNewLayoutNameChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setNewComponentName(value);
  
  /**
   * Renders input label
   * 
   * @param label label
   */
  const renderInputLabel = (label: string) => (
    <InputLabel sx={{ marginBottom: theme.spacing(2) }}>
      { label }
    </InputLabel>
  );
  
  /**
   * Renders Component types menu items
   */
  const renderComponentTypesMenuItems = () => (
    Object.values(HtmlComponentType).map(type => {
      return (
        <MenuItem
          key={ type }
          value={ type }
        >
          { LanguageUtils.getLocalizedComponentType(type) }
        </MenuItem>
      );
    })
  );
  
  /**
   * Renders sublayouts menu items
   */
  const renderSubLayoutsMenuItems = () => (
    subLayouts.map(subLayout => {
      return (
        <MenuItem
          key={ subLayout.id }
          value={ subLayout.id }
        >
          { subLayout.name }
        </MenuItem>
      );
    })
  );

   /**
   * Render help text according to selected component
   */
   const renderHelpTextBySelectedComponent = (componentType?: HtmlComponentType): string => {
    switch(true) {
      case componentType === HtmlComponentType.BUTTON:
        return strings.helpTexts.layoutEditorHtml.buttonDescription;
      case componentType === HtmlComponentType.TEXT:
        return strings.helpTexts.layoutEditorHtml.textViewDescription;
      case componentType === HtmlComponentType.IMAGE:
        return strings.helpTexts.layoutEditorHtml.imageViewDescription;
      case componentType === HtmlComponentType.LAYOUT:
        return strings.helpTexts.layoutEditorHtml.layoutDescription;
      case componentType === HtmlComponentType.TAB:
        return strings.helpTexts.layoutEditorHtml.tabViewDescription;
      case componentType === HtmlComponentType.TABS:
        return strings.helpTexts.layoutEditorHtml.tabsViewDescription;
      default:
        return "";
    }
  }
  
  /**
   * Render add layout component dialog
   */
  const renderDialogContent = () => (
    <Stack spacing={ 2 } sx={{ minWidth: 300 }}>
      <FormControl variant="outlined">
          { renderInputLabel(strings.layoutEditor.addLayoutViewDialog.widget) }
          <Select
            label={ strings.layoutEditor.addLayoutViewDialog.widget }
            value={ newComponentType ?? "" }
            onChange={ onComponentTypeChange }>
            { renderComponentTypesMenuItems() }
          </Select>
          <FormHelperText>
            { renderHelpTextBySelectedComponent(newComponentType) }
          </FormHelperText>
        </FormControl>
        <Box mt={ 2 }>
          <TextField
            sx={{ marginTop: theme.spacing(2) }}
            label={ strings.layoutEditor.addLayoutViewDialog.name }
            value={ newComponentName }
            onChange={ onNewLayoutNameChange }
          />
        </Box>
    </Stack>
  );
  
  return (
    <GenericDialog
      cancelButtonText={ strings.layoutEditor.addLayoutViewDialog.cancel }
      positiveButtonText={ strings.layoutEditor.addLayoutViewDialog.confirm }
      title={ strings.layoutEditor.addLayoutViewDialog.title }
      error={ false }
      onConfirm={ onConfirmClick }
      onCancel={ onClose }
      open={ open }
      onClose={ onCloseOrCancelClick }
    >
      { renderDialogContent() }
    </GenericDialog>
    
  );
};

export default AddNewElementDialog;