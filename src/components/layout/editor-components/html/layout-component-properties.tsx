import { Box, Checkbox, Typography } from "@mui/material";
import strings from "../../../../localization/strings";
import { TreeObject } from "../../../../types";

/**
 * Component props
 */
interface Props {
	panelComponentData?: TreeObject;
}

/**
 * Renders layout component properties
 */
const LayoutComponentProperties = ({
  panelComponentData
}) => {
	return (
		<Box>
			<Typography>
				{strings.layout.htmlProperties.layoutProperties.justifyChildren}
			</Typography>
			<Checkbox />
		</Box>
	);
};

export default LayoutComponentProperties;