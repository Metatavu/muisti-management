import React, { useState, FC } from 'react';
import { Box, Button, Checkbox, Divider, IconButton, MenuItem, Popover, Select, Stack, TextField, Typography } from '@mui/material';
import { ColorResult, SketchPicker, SketchPickerProps } from 'react-color';
import strings from '../../../../localization/strings';
import { ComponentType, TreeObject } from '../../../../types';
import theme from '../../../../styles/theme';
import { ExpandOutlined, FormatColorFillOutlined, HeightOutlined, LinkRounded, PaletteOutlined } from '@mui/icons-material';
import MarginPaddingEditorHtml from './margin-padding-editor-html';
import ProportionsEditorHtml from './proportions-editor-html';

const PropertyBox = ({ children }: { children: React.ReactNode }) => (
  <Box paddingX={ theme.spacing(2) }  paddingY={ theme.spacing(1) }>
    { children }
  </Box>
);

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Component for Generic Properties
 */
const GenericComponentProperties: FC<Props> = ({
  component,
  updateComponent
}) => {
  const [ popoverAnchorElement, setPopoverAnchorElement ] = useState<HTMLButtonElement>();

  if (!component) return null;

  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onPropertyChange = (name: string, value: string) => {
    component.element.style[name as any] = value;
    updateComponent(component);
  };

  /**
   * Event handler for name change events
   *
   * @param event event
   */
  const onNameChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    component.element.setAttribute("name", value);
    updateComponent(component);
  };

  /**
   * Renders panel subtitle
   *
   * @param subtitle subtitle
   */
  const renderPanelSubtitle = (subtitle: string) => (
    <Typography
      fontWeight={ 500 }
      fontSize="14px"
      marginBottom={ theme.spacing(1) }
      color="#000000"
      sx={{ opacity: 0.6 }}
    >
      { subtitle }
    </Typography>
  );

  return (
    <>
      <Stack spacing={ 2 } paddingLeft={ 0 } paddingRight={ 0 }>
          <PropertyBox>
              { renderPanelSubtitle(strings.layout.htmlProperties.genericProperties.element) }
              <TextField
                defaultValue={ component.type }
                variant="standard"
                select
                fullWidth
                sx={{ backgroundColor: "#F5F5F5" }}
                InputProps={{
                    disableUnderline: true,
                    sx: {  backgroundColor: "#F5F5F5" }
                }}
                SelectProps={{
                  sx: {
                    "& .MuiInputBase-input": {
                      color: "#2196F3",
                      height: "20px",
                      padding: 0,
                    },
                    height: "20px",
                    backgroundColor: "#F5F5F5"
                  }
                }}
              >
                { Object.values(ComponentType).map(type => (
                  <MenuItem key={ type } value={ type } sx={{ color: "#2196F3" }}>
                    { type }
                  </MenuItem>
                )) }
              </TextField>
            </PropertyBox>
          <Divider sx={{ color: "#F5F5F5" }}/>
          <PropertyBox>
            { renderPanelSubtitle(strings.layout.htmlProperties.genericProperties.elementName) }
            <TextField
              variant="standard"
              defaultValue={ component.name || "" }
              onChange={ onNameChange }
              inputProps={{
                sx:{ backgroundColor: "#fbfbfb" }
                }}
              placeholder={ strings.layout.htmlProperties.genericProperties.elementName }
            />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          { renderPanelSubtitle(strings.layout.htmlProperties.genericProperties.proportions) }
          <ProportionsEditorHtml
            value={ parseInt(component.element?.style?.width || "0").toString() }
            name="width"
            label={ strings.layout.htmlProperties.genericProperties.width }
            onChange={ onPropertyChange }
          />
          <ProportionsEditorHtml
            value={ parseInt(component.element?.style?.height || "0").toString() }
            name="height"
            label={ strings.layout.htmlProperties.genericProperties.height }
            onChange={ onPropertyChange }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          { renderPanelSubtitle(strings.layout.htmlProperties.genericProperties.margin) }
          <MarginPaddingEditorHtml
            type="margin"
            onChange={ onPropertyChange }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          { renderPanelSubtitle(strings.layout.htmlProperties.genericProperties.padding) }
          <MarginPaddingEditorHtml
            type="padding"
            onChange={ onPropertyChange }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <Stack
            direction="row"
            alignItems="center"
            spacing={ 1 }
          >
            <PaletteOutlined sx={{ opacity: 0.54 }}/>
            { renderPanelSubtitle(strings.layout.htmlProperties.genericProperties.color.label) }
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Button
              sx={{ color: "#2196F3" }}
              onClick={ ({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => setPopoverAnchorElement(currentTarget) }
            >
              { strings.layout.htmlProperties.genericProperties.color.button }
            </Button>
            <FormatColorFillOutlined sx={{ color: "#2196F3" }}/>
          </Stack>
        </PropertyBox>
      </Stack>
      <Popover
        open={ !!popoverAnchorElement }
        anchorEl={ popoverAnchorElement }
        onClose={ () => setPopoverAnchorElement(undefined) }
        anchorOrigin={{
          vertical: "center",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right"
        }}
      >

        <SketchPicker
          color={ component.element.style.backgroundColor }
          onChangeComplete={ (color: ColorResult) => onPropertyChange("background-color", color.hex) }
        />
      </Popover>
    </>
  );
}

export default GenericComponentProperties;