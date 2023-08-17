import { DeviceModel, ExhibitionPageResource, PageLayout, PageLayoutViewHtml, ScreenOrientation } from "../../generated/client";
import strings from "../../localization/strings";
import PanZoom from "../generic/pan-zoom";
import { replaceResources, wrapHtmlLayout } from "../layout/utils/tree-html-data-utils";
import { FormControlLabel, Switch, Typography } from "@mui/material";
import { styled } from "@mui/styles";
import Fraction from "fraction.js";
import { useState } from "react";

/**
 * Components properties
 */
interface Props {
  screenOrientation: ScreenOrientation;
  layoutHtml: string;
  deviceModel: DeviceModel;
  resources: ExhibitionPageResource[];
  selectedComponentId?: string;
}

/**
 * Styled Preview components properties
 */
interface PreviewProps {
  width: number;
  height: number;
}

/**
 * Preview Container styled component
 */
const PreviewContainer = styled("div")(() => ({
  display: "flex",
  width: "100%",
  minHeight: "100%",
  justifyContent: "center",
  alignContent: "center",
  position: "relative",
  backgroundColor: "#EFF0F1"
}));

/**
 * Preview styled component
 */
const Preview = styled("iframe")(({ width, height }: PreviewProps) => ({
  position: "relative",
  borderRadius: 3,
  border: "none",
  boxSizing: "content-box",
  backgroundColor: "#ffffff",
  overflow: "auto",
  transition: "border-color 0.2s ease-out",
  width: width,
  height: height,
  minWidth: width,
  minHeight: height,
  maxWidth: width,
  maxHeight: height
}));

/**
 * HTML Layouts Page Preview Component
 */
const PagePreviewHtml = ({ deviceModel, screenOrientation, layoutHtml, resources, selectedComponentId }: Props) => {
  const [showElementBorders, setShowElementBorders] = useState(false);

  if (!deviceModel) return null;

  const {
    dimensions: { screenHeight, screenWidth }
  } = deviceModel;

  /**
   * Gets preview dimensions
   */
  const getPreviewDimensions = () => {
    const scale = 1;
    const deviceOrientation = deviceModel.screenOrientation;

    let height = screenHeight ?? 1 * scale;
    let width = screenWidth ?? 1 * scale;

    if (screenOrientation && deviceOrientation && screenOrientation !== deviceOrientation) {
      height = width;
      width = height;
    }

    return {
      height,
      width
    };
  };

  return (
    <PreviewContainer>
      <PanZoom
        minScale={0.1}
        fitContent={true}
        contentWidth={screenWidth}
        contentHeight={screenHeight}
        defaultPositionX={150}
        defaultPositionY={150}
      >
        <Typography
          sx={{
            position: "absolute",
            top: -20,
            opacity: 0.6
          }}
        >
          {deviceModel.model} / {screenHeight}x{screenWidth} /{" "}
          {new Fraction((screenHeight ?? 0) / (screenWidth ?? 0)).toFraction().replace("/", ":")}
        </Typography>
        <Preview
          srcDoc={ wrapHtmlLayout(replaceResources(layoutHtml, resources)) }
          {...getPreviewDimensions()}
        />
      </PanZoom>
      <FormControlLabel
        sx={{
          position: "absolute",
          bottom: 10
        }}
        label={strings.layoutEditorV2.preview.showElementBorders}
        onChange={() => setShowElementBorders(!showElementBorders)}
        value={showElementBorders}
        control={<Switch checked={showElementBorders} color="secondary" />}
      />
    </PreviewContainer>
  );
};

export default PagePreviewHtml;
