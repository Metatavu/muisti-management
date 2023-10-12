import strings from "../../../localization/strings";
import { HtmlComponentType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import ConditionalTooltip from "../../generic/v2/conditional-tooltip";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import { ExpandOutlined, HeightOutlined } from "@mui/icons-material";
import { MenuItem, Stack, Typography } from "@mui/material";
import { ChangeEvent, useState } from "react";

/**
 * Components properties
 */
interface Props {
  component: TreeObject;
  value: string;
  name: "width" | "height";
  label: string;
  onChange: (name: string, value: string) => void;
}

/**
 * HTML Component proportions editor
 */
const ProportionsEditorHtml = ({ component, value, name, label, onChange }: Props) => {
  /**
   * Gets element proportion type
   *
   * @param proportion proportion
   */
  const getElementProportionType = (proportion: "width" | "height") => {
    if (component.type === HtmlComponentType.VIDEO) return "px";
    const styles = HtmlComponentsUtils.parseStyles(component.element);
    const elementDimension = styles[proportion];

    if (elementDimension?.endsWith("%")) return "%";
    if (elementDimension?.endsWith("px")) return "px";
    return "px";
  };

  const [proportionType, setProportionType] = useState<"%" | "px">(getElementProportionType(name));

  const onSettingsChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const styles = HtmlComponentsUtils.parseStyles(component.element);
    const val = styles[name];
    const numberVal = parseInt(val);
    setProportionType(value as "px" | "%");

    onChange(name, `${numberVal}${value}`);
  };
  /**
   * Event handler for input change events
   *
   * @param event event
   */
  const onValueChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    const val = `${value}${proportionType}`;

    onChange(name, val);
  };

  /**
   * Renders icon
   */
  const renderIcon = () => {
    const iconStyles = {
      color: "#2196F3",
      border: "1px solid #2196F3",
      borderRadius: "5px"
    };
    switch (name) {
      case "width":
        return (
          <HeightOutlined
            sx={{
              transform: "rotate(90deg)",
              ...iconStyles
            }}
          />
        );
      case "height":
        return <ExpandOutlined sx={{ ...iconStyles }} />;
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" fontWeight={500} fontSize="12px">
        {label}
      </Typography>
      <TextField name={name} value={value} number onChange={onValueChange} />
      <ConditionalTooltip
        enabled={component.type === HtmlComponentType.VIDEO}
        title={strings.layoutEditorV2.genericProperties.videoProportionsTooltip}
      >
        <SelectBox
          value={getElementProportionType(name)}
          disabled={component.type === HtmlComponentType.VIDEO}
          onChange={onSettingsChange}
        >
          <MenuItem value="px" sx={{ color: "#2196F3" }}>
            px
          </MenuItem>
          <MenuItem value="%" sx={{ color: "#2196F3" }}>
            %
          </MenuItem>
        </SelectBox>
      </ConditionalTooltip>
      {renderIcon()}
    </Stack>
  );
};

export default ProportionsEditorHtml;
