import { Box, Checkbox, Typography } from "@mui/material";
import strings from "../../../../localization/strings";

/**
 * Renders layout component properties
 */
const LayoutComponentProperties = () => {
	return (
		<Box>
			<Typography>
				{ strings.layout.htmlProperties.layoutProperties.justifyChildren }
			</Typography>
			<Checkbox />
		</Box>
	);
};

export default LayoutComponentProperties;