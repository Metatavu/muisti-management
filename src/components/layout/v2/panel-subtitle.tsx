import { Typography, TypographyProps } from "@mui/material";
import theme from "../../../styles/theme";

/**
 * Components properties
 */
type Props = TypographyProps & {
	subtitle: string;
}

/**
 * HTML Layout Drawer Panel subtitle
 */
const PanelSubtitle = ({ subtitle, ...rest }: Props) => (
	<Typography
		{ ...rest }
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