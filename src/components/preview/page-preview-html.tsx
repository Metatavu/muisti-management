import {
  DeviceModelDisplayMetrics,
  ExhibitionPageResource,
  ScreenOrientation
} from "../../generated/client";
import { replaceResources, wrapHtmlLayout } from "../layout/utils/tree-html-data-utils";
import { styled } from "@mui/styles";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";

/**
 * Components properties
 */
interface Props {
  displayMetrics: DeviceModelDisplayMetrics;
  deviceOrientation: ScreenOrientation;
  screenOrientation: ScreenOrientation;
  layoutHtml: string;
  resources: ExhibitionPageResource[];
  borderedElementId?: string;
  setOnsaveCallback?: Dispatch<SetStateAction<() => { [key: string]: number }>>;
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
  displayMetrics,
  deviceOrientation,
  screenOrientation,
  layoutHtml,
  resources,
  borderedElementId,
  setOnsaveCallback
}: Props) => {
  const previewRef = useRef<HTMLIFrameElement>(null);

  /**
   * On save callback for layout screen
   * Device application needs to know the max display width of text elements and it is calculated from the preview iframe.
   *
   * @returns new widths of elements
   */
  const onSaveCallback = () => {
    const contentDocument = previewRef.current?.contentDocument;
    const newWidths: { [id: string]: number } = {};

    const elements = contentDocument?.querySelectorAll("[id]") ?? [];
    elements.forEach((element) => {
      newWidths[element.id] = element.clientWidth;
    });

    return newWidths;
  };

  useEffect(() => {
    setOnsaveCallback?.(() => onSaveCallback);
  }, []);

  /**
   * Gets preview dimensions
   */
  const getPreviewDimensions = () => {
    const scale = 1;
    const initialWidth = displayMetrics.widthPixels ?? 1 * scale;
    const initialHeight = displayMetrics.heightPixels ?? 1 * scale;

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
        ref={previewRef}
        srcDoc={wrapHtmlLayout(addBorders(replaceResources(layoutHtml, resources)))}
        {...getPreviewDimensions()}
      />
    </>
  );
};

export default PagePreviewHtml;
