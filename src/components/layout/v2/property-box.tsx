import theme from "../../../styles/theme";
import { Box } from "@mui/material";
import { ReactNode } from "react";

/**
 * Component for editor panel Property Box
 */
const PropertyBox = ({ children }: { children: ReactNode }) => (
  <Box paddingX={theme.spacing(2)} paddingY={theme.spacing(1.5)}>
    {children}
  </Box>
);

export default PropertyBox;
