import { LayoutAlignment } from "../../../types";
import LocalizationUtils from "../../../utils/localization-utils";
import { Icon } from "@material-ui/core";
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
import { IconButton, Stack, Typography } from "@mui/material";
import { ElementType, useState } from "react";

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
}

// TODO: Not yet implemented as a controlled componenet
/**
 * HTML Component Alignment editor component
 */
const AlignmentEditorHtml = ({ onChange }: Props) => {
  const [selected, setSelected] = useState<LayoutAlignment>();

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

    if (!name) return;

    setSelected(name as LayoutAlignment);

    switch (name) {
      case "nw": {
        onChange("align-content", "flex-start");
        onChange("justify-content", "flex-start");
        break;
      }
      case "n": {
        onChange("align-content", "center");
        onChange("justify-content", "flex-start");
        break;
      }
      case "ne": {
        onChange("align-content", "flex-end");
        onChange("justify-content", "flex-start");
        break;
      }
      case "w": {
        onChange("align-content", "flex-start");
        onChange("justify-content", "center");
        break;
      }
      case "c": {
        onChange("align-content", "center");
        onChange("justify-content", "center");
        break;
      }
      case "e": {
        onChange("align-content", "flex-end");
        onChange("justify-content", "center");
        break;
      }
      case "sw": {
        onChange("align-content", "flex-start");
        onChange("justify-content", "flex-end");
        break;
      }
      case "s": {
        onChange("align-content", "center");
        onChange("justify-content", "flex-end");
        break;
      }
      case "se": {
        onChange("align-content", "flex-end");
        onChange("justify-content", "flex-end");
        break;
      }
    }
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
