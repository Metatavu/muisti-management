import { Typography } from "@mui/material";
import theme from "../../../styles/theme";

/**
 * Components properties
 */
interface Props {
	subtitle: string;
}

/**
 * HTML Layout Drawer Panel subtitle
 */
const PanelSubtitle = ({ subtitle }: Props) => (
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

export default PanelSubtitle;