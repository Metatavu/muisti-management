import { DeviceModel, ExhibitionPageResource, ScreenOrientation } from "../../../generated/client";
import strings from "../../../localization/strings";
import PanZoom from "../../generic/pan-zoom";
import PagePreviewHtml from "../../preview/page-preview-html";
import { FormControlLabel, Switch, Typography } from "@mui/material";
import { styled } from "@mui/styles";
import Fraction from "fraction.js";
import { Dispatch, SetStateAction, useState } from "react";

/**
 * Components properties
 */
interface Props {
  screenOrientation: ScreenOrientation;
  layoutHtml: string;
  deviceModel: DeviceModel;
  resources: ExhibitionPageResource[];
  selectedComponentId?: string;
  setOnSaveCallback?: Dispatch<SetStateAction<() => { [key: string]: number }>>;
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
 * HTML Layouts Page Preview Component
 */
const LayoutPreviewHtml = ({
  deviceModel,
  screenOrientation,
  layoutHtml,
  resources,
  selectedComponentId,
  setOnSaveCallback
}: Props) => {
  const [showElementBorders, setShowElementBorders] = useState(false);

  if (!deviceModel) return null;

  const {
    dimensions: { screenHeight, screenWidth },
    displayMetrics,
    screenOrientation: deviceOrientation
  } = deviceModel;

  return (
    <PreviewContainer>
      <PanZoom
        minScale={0.1}
        fitContent={true}
        contentWidth={screenWidth}
        contentHeight={screenHeight}
        defaultPositionX={150}
        defaultPositionY={150}
        defaultScale={1}
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
        <PagePreviewHtml
          displayMetrics={displayMetrics}
          deviceOrientation={deviceOrientation}
          screenOrientation={screenOrientation}
          layoutHtml={layoutHtml}
          resources={resources}
          borderedElementId={showElementBorders ? selectedComponentId : undefined}
          setOnsaveCallback={setOnSaveCallback}
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

export default LayoutPreviewHtml;
