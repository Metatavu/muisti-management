import * as React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { SketchPickerProps } from 'react-color';
import { CheckBox } from '@mui/icons-material';


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
            Elementti
          </Typography>
          <TextField />
        </Box>
        <Box>
          <Typography>
            Elementti nimi
          </Typography>
          <TextField />
        </Box>
        <Box>
          <Typography>
            Mittasuhteet
          </Typography>
          <Typography>
            Width
          </Typography>
          <TextField
            type="number"
          />
          <Typography>
            Height
          </Typography>
          <TextField
            type="number"
          />
        </Box>
        <Box>
          <Typography>
            Elevation
          </Typography>
          <TextField
            type="number"
          />
        </Box>
        <Box>
          {/* TODO: color picker, or image, so a switch to change between */}
          <Typography>
            Color
          </Typography>
          <SketchPicker />
        </Box>
        <Box>
          <Typography>
            Margin
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
            Padding
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
              Justify self
            </Typography>
            <CheckBox />
          </Box>
        </Box>
    </div>
  );
}

export default GenericComponentProperties;