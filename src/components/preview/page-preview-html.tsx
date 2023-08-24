import { DeviceModel, ExhibitionPageResource, ScreenOrientation } from "../../generated/client";
import { replaceResources, wrapHtmlLayout } from "../layout/utils/tree-html-data-utils";
import { styled } from "@mui/styles";

/**
 * Components properties
 */
interface Props {
  screenOrientation: ScreenOrientation;
  layoutHtml: string;
  deviceModel: DeviceModel;
  resources: ExhibitionPageResource[];
  borderedElementId?: string;
}

/**
 * Styled Preview components properties
 */
interface PreviewProps {
  width: number;
  height: number;
}

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
  deviceModel,
  screenOrientation,
  layoutHtml,
  resources,
  borderedElementId
}: Props) => {
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
    const initialWidth = screenWidth ?? 1 * scale;
    const initialHeight = screenHeight ?? 1 * scale;

    let height = initialHeight;
    let width = initialWidth;

    if (screenOrientation && deviceOrientation && screenOrientation !== deviceOrientation) {
      height = initialWidth;
      width = initialHeight;
    }

    return {
      height,
      width
    };
  };

  /**
   * Adds borders to selected element
   *
   * @param html layout html
   * @returns layout html with borders added
   */
  const addBorders = (html: string): string => {
    if (borderedElementId) {
      const htmlDocument = new DOMParser().parseFromString(html, "text/html");

      const element = htmlDocument.getElementById(borderedElementId);

      if (element) {
        element.style["outline"] = "2px dashed #2196F3";
        element.style["outlineOffset"] = "-2px";
      }

      return htmlDocument.body.outerHTML;
    }

    return html;
  };

  return (
    <>
      <div style={{ position: "absolute", width: "100%", height: "100%", zIndex: 1 }} />
      <Preview
        srcDoc={wrapHtmlLayout(addBorders(replaceResources(layoutHtml, resources)))}
        {...getPreviewDimensions()}
      />
    </>
  );
};

export default PagePreviewHtml;
