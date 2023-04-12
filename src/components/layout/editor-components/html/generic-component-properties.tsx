import { useState, FC, useEffect } from 'react';
import { Box, Checkbox, TextField, Typography } from '@mui/material';
import { SketchPicker, SketchPickerProps } from 'react-color';
import strings from '../../../../localization/strings';
import { TreeObject } from '../../../../types';

/**
 * Component props
 */
interface Props {
  panelComponentData: TreeObject;
  setPanelComponentData: React.Dispatch<React.SetStateAction<TreeObject | undefined>>;
  onStylesChange: (htmlData: string) => void;
  domArray: Element[];
}

/**
 * Component for Generic Properties
 */
const GenericComponentProperties: FC<Props> = ({
  panelComponentData,
  setPanelComponentData,
  onStylesChange,
  domArray
}) => {
  const [ htmlElementProperties, setHtmlElementProperties ] = useState<TreeObject | undefined>();

  /**
   * Resets settings when selected element changes.
   */
  useEffect(() => {
    setHtmlElementProperties(panelComponentData);
  }, [panelComponentData]);


  if (!htmlElementProperties) return null;


  //TODO: Lift function to layoutscreenhtml, should fire on save?
  /**
   * Updates Dom Array with property changes
   */
  const convertDomArrayToString = () => {
      // Reinsert the updated panelComponentData into the dom array, via id, as child?.
    // updateDomArray()

    const s = new XMLSerializer();
    const string = s.serializeToString(domArray[0]);
    // This adds a xmlns attribute to the first element.
    // console.log("dom array string?", string);

    // onStylesChange({
    //   ...htmlData?.style,
    //   [name]: value
    // });
  };

  const onPropertyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;

    setHtmlElementProperties({
      ...htmlElementProperties,
      element: {
        ...htmlElementProperties.element,
        style: {
          ...htmlElementProperties.element.style,
          [name]: value
        }
      }
    });


  }



  // TODO: Need to set all values from the component state
  return (
    <div>
        <Box>
          <Typography>
            { strings.layout.htmlProperties.genericProperties.element }
          </Typography>
          <TextField
            value={ panelComponentData?.type }
          />
        </Box>
        <Box>
          <Typography>
            { strings.layout.htmlProperties.genericProperties.elementName }
          </Typography>
          <TextField />
        </Box>
        <Box>
          <Typography>
          { strings.layout.htmlProperties.genericProperties.proportions }
          </Typography>
          <Typography>
          { strings.layout.htmlProperties.genericProperties.width }
          </Typography>
          <TextField
            type="number"
            name="width"
            value={ htmlElementProperties.element.style.width }
            onChange={ onPropertyChange }
          />
          <Typography>
          { strings.layout.htmlProperties.genericProperties.height }
          </Typography>
          <TextField
            type="number"
          />
        </Box>
        <Box>
          <Typography>
          { strings.layout.htmlProperties.genericProperties.elevation }
          </Typography>
          <TextField
            type="number"
          />
        </Box>
        <Box>
          {/* TODO: color picker, or image, so a switch to change between */}
          <Typography>
          { strings.layout.htmlProperties.genericProperties.color }
          </Typography>
          <SketchPicker />
        </Box>
        <Box>
          <Typography>
          { strings.layout.htmlProperties.genericProperties.margin }
          </Typography>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 200
            }}
          >
            <TextField
              type="number"
              style={{ width: 34 }}
            />
            <TextField
              type="number"
              style={{ width: 34 }}
            />
            <TextField
              type="number"
              style={{ width: 34 }}
            />
            <TextField
              type="number"
              style={{ width: 34 }}
            />
          </Box>
        </Box>
        <Box>
          <Typography>
          { strings.layout.htmlProperties.genericProperties.padding }
          </Typography>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 200
            }}
          >
            <TextField
              type="number"
              style={{ width: 34 }}
            />
            <TextField
              type="number"
              style={{ width: 34 }}
            />
            <TextField
              type="number"
              style={{ width: 34 }}
            />
            <TextField
              type="number"
              style={{ width: 34 }}
            />
          </Box>
          <Box>
            <Typography>
            { strings.layout.htmlProperties.genericProperties.justifySelf }
            </Typography>
            <Checkbox />
          </Box>
        </Box>
    </div>
  );
}

export default GenericComponentProperties;