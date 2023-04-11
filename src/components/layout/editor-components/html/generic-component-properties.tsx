import { useState, FC, useEffect } from 'react';
import { Box, Checkbox, TextField, Typography } from '@mui/material';
import { SketchPicker, SketchPickerProps } from 'react-color';
import strings from '../../../../localization/strings';
import { TreeObject } from '../../../../types';
import { PageLayout } from '../../../../generated/client';

/**
 * Component props
 */
interface Props {
  panelComponentData: TreeObject;
  onStylesChange: (htmlData: string) => void;
}

/**
 * Component for Generic Properties
 */
const GenericComponentProperties: FC<Props> = ({
  panelComponentData,
  onStylesChange
}) => {
  const [ htmlData, setHtmlData ] = useState(panelComponentData);

  const onPropertyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log("name is, value is ", name, value);

    setHtmlData({
      ...htmlData,
      style: {
        ...htmlData?.style,
      [name]: value
      }
    });

    // TODO:
    // Need to parse the Tree Object back into the element and html string.

    // onStylesChange({
    //   ...htmlData?.style,
    //   [name]: value
    // });
  }



  return (
    <div>
        <Box>
          <Typography>
            { strings.layout.htmlProperties.genericProperties.element }
          </Typography>
          <TextField
            value={ htmlData?.type }
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