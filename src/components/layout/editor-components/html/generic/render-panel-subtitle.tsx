import { Typography } from "@mui/material";
import theme from "../../../../../styles/theme";

/**
 * Renders editor panel subtitle
 *
 * @param subtitle subtitle
 */
const renderPanelSubtitle = (subtitle: string) => (
	<Typography
		fontWeight={500}
		fontSize="14px"
		marginBottom={theme.spacing(1)}
		color="#000000"
		sx={{ opacity: 0.6 }}
	>
		{subtitle}
	</Typography>
);

export default renderPanelSubtitle;