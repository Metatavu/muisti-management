import { Tooltip, TooltipProps } from "@mui/material";
import { ReactNode } from "react";

/**
 * Components properties
 */
type Props = TooltipProps & {
  children: ReactNode;
  enabled: boolean;
};

/**
 * Conditional Tooltip component
 */
const ConditionalTooltip = ({ children, enabled, ...rest }: Props) => {
  if (!enabled) return children;

  return (
    <Tooltip {...rest}>
      <span>{children}</span>
    </Tooltip>
  );
};

export default ConditionalTooltip;
