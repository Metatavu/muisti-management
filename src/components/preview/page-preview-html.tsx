import { Typography, styled } from "@mui/material";
import PanZoom from "../generic/pan-zoom";
import { treeObjectToHtmlElement, wrapTemplate } from "../layout/utils/tree-html-data-utils";
import Fraction from "fraction.js";
import { DeviceModel, PageLayout } from "../../generated/client";
import { TreeObject } from "../../types";

/**
 * Components properties
 */
interface Props {
  deviceModels: DeviceModel[];
  layout: PageLayout;
  treeObjects: TreeObject[];
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
const PagePreviewHtml = ({
  deviceModels,
  layout,
  treeObjects,
  selectedComponentId
}: Props) => {
  if (deviceModels.length === 0) return null;
  
  const deviceModel = deviceModels.find(model => model.id === layout.modelId);

  if (!deviceModel) return null;
  
  const { dimensions: { screenHeight, screenWidth } } = deviceModel;
  
  /**
   * Gets preview dimensions
   */
  const getPreviewDimensions = () => {
    const scale = 1;
    const { screenOrientation } = layout;
    const { screenOrientation: deviceOrientation } = deviceModel;
  
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
        minScale={ 0.1 }
        contentWidth={ screenWidth }
        contentHeight={ screenHeight }
        defaultPositionX={ 100 }
        defaultPositionY={ 100 }
      >
          <Typography
            sx={{
              position: "absolute",
              top: -20,
              opacity: 0.6
            }}
          >
            { deviceModel.model } / { screenHeight }x{ screenWidth } / { new Fraction((screenHeight ?? 0) / (screenWidth ?? 0)).toFraction().replace("/", ":") }
          </Typography>
          <Preview
            srcDoc={ wrapTemplate(treeObjects?.map(treeObject => treeObjectToHtmlElement(treeObject, selectedComponentId))[0]?.outerHTML) }
            { ...getPreviewDimensions() }
            />
      </PanZoom>
    </PreviewContainer>
  );
};

export default PagePreviewHtml;