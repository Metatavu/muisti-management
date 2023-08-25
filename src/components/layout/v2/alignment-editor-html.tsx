import { LayoutAlignment } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import LocalizationUtils from "../../../utils/localization-utils";
import {
  EastOutlined,
  FilterCenterFocusRounded,
  NorthEastOutlined,
  NorthOutlined,
  NorthWestOutlined,
  SouthEastOutlined,
  SouthOutlined,
  SouthWestOutlined,
  WestOutlined
} from "@mui/icons-material";
import { Icon, IconButton, Stack, Typography } from "@mui/material";
import { ElementType } from "react";

/**
 * Alignment icon row type
 */
type AlignmentIconRow = {
  icon: ElementType;
  name: LayoutAlignment;
};

/**
 * Components props
 */
interface Props {
  onChange: (name: string, value: string) => void;
  element: HTMLElement;
}

/**
 * HTML Component Alignment editor component
 */
const AlignmentEditorHtml = ({ onChange, element }: Props) => {
  const ALIGNMENT_MAP = HtmlComponentsUtils.ALIGNMENT_MAP;
  /**
   * Gets the alignment direction for the component
   */
  const getAlignmentDirection = () => element.style.flexDirection ?? "row";

  /**
   * Gets the current selected alignment/emphasis of component
   *
   * @returns current selected alignment/emphasis as {@link LayoutAlignment}
   */
  const getSelectedAlignment = () => {
    const direction = getAlignmentDirection();
    const justifyItems = element.style.justifyItems;
    const alignItems = element.style.alignItems;
    const justifyContent = element.style.justifyContent;
    const alignContent = element.style.alignContent;

    const alignment = Object.keys(ALIGNMENT_MAP).find((key) => {
      const alignment =
        ALIGNMENT_MAP[key as keyof typeof ALIGNMENT_MAP][direction as "row" | "column"];

      return (
        alignment["justify-items"] === justifyItems &&
        alignment["align-items"] === alignItems &&
        alignment["justify-content"] === justifyContent &&
        alignment["align-content"] === alignContent
      );
    });

    return alignment as LayoutAlignment;
  };

  const selected = getSelectedAlignment();

  const topRowIcons: AlignmentIconRow[] = [
    {
      icon: NorthWestOutlined,
      name: LayoutAlignment.NORTH_WEST
    },
    {
      icon: NorthOutlined,
      name: LayoutAlignment.NORTH
    },
    {
      icon: NorthEastOutlined,
      name: LayoutAlignment.NORTH_EAST
    }
  ];

  const middleRowIcons: AlignmentIconRow[] = [
    {
      icon: WestOutlined,
      name: LayoutAlignment.WEST
    },
    {
      icon: FilterCenterFocusRounded,
      name: LayoutAlignment.CENTER
    },
    {
      icon: EastOutlined,
      name: LayoutAlignment.EAST
    }
  ];

  const bottomRowIcons: AlignmentIconRow[] = [
    {
      icon: SouthWestOutlined,
      name: LayoutAlignment.SOUTH_WEST
    },
    {
      icon: SouthOutlined,
      name: LayoutAlignment.SOUTH
    },
    {
      icon: SouthEastOutlined,
      name: LayoutAlignment.SOUTH_EAST
    }
  ];

  /**
   * Renders an icon row
   */
  const renderIconRow = (row: AlignmentIconRow[]) => (
    <Stack direction="row" spacing={0.5}>
      {row.map((icon) => renderIcon(icon))}
    </Stack>
  );

  /**
   * Event handler
   */
  const onAlignmentChange = ({ currentTarget }: React.MouseEvent) => {
    const name = currentTarget.getAttribute("name");
    const direction = getAlignmentDirection();

    if (!name) return;

    const alignment =
      ALIGNMENT_MAP[name as keyof typeof ALIGNMENT_MAP][direction as "row" | "column"];

    onChange("align-content", alignment["align-content"]);
    onChange("justify-content", alignment["justify-content"]);
    onChange("align-items", alignment["align-items"]);
    onChange("justify-items", alignment["justify-items"]);
  };

  const renderIcon = (icon: AlignmentIconRow) => {
    const color = selected === icon.name ? "#ffffff" : "#2196F3";
    const backgroundColor = selected === icon.name ? "#2196F3" : undefined;

    return (
      <IconButton
        key={icon.name}
        name={icon.name}
        sx={{
          margin: 0,
          padding: 0,
          border: "1px solid #2196F3",
          borderRadius: "3px"
        }}
        onClick={onAlignmentChange}
      >
        <Icon
          component={icon.icon}
          fontSize="small"
          sx={{
            color: color,
            backgroundColor: backgroundColor
          }}
        />
      </IconButton>
    );
  };

  return (
    <Stack direction="row" justifyContent="space-between" paddingRight={2}>
      <Stack spacing={0.5}>
        {renderIconRow(topRowIcons)}
        {renderIconRow(middleRowIcons)}
        {renderIconRow(bottomRowIcons)}
      </Stack>
      <Typography
        variant="caption"
        fontWeight={500}
        fontSize="14px"
        justifySelf="flex-start"
        alignSelf="center"
        color="#2196F3"
      >
        {LocalizationUtils.getLocalizedLayoutAlignment(selected as LayoutAlignment)}
      </Typography>
    </Stack>
  );
};

export default AlignmentEditorHtml;
