import { ReactNode } from "react";
import { Box } from "@mui/material";
import theme from "../../../styles/theme";

/**
 * Component for editor panel Property Box
 */
const PropertyBox = ({ children }: { children: ReactNode }) => (
  <Box paddingX={theme.spacing(2)} paddingY={theme.spacing(1)}>
    {children}
  </Box>
);

export default PropertyBox;
