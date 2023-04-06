import * as React from 'react';
import { Box, Checkbox, TextField, Typography } from '@mui/material';
import { SketchPicker, SketchPickerProps } from 'react-color';
import strings from '../../../../localization/strings';

/**
 * Component props
 */
interface Props {
}

/**
 * Component for Generic Properties
 */
const GenericComponentProperties: React.FC<Props> = () => {

  return (
    <div>
        <Box>
          <Typography>
            { strings.layout.htmlProperties.genericProperties.element }
          </Typography>
          <TextField />
        </Box>
        <Box>
          <Typography>
            {/* Will come from the state/ styles */}
            Elementti nimi
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