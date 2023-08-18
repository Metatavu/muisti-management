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
const PagePreviewHtml = ({ deviceModel, screenOrientation, layoutHtml, resources, borderedElementId }: Props) => {
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
  }

  return (
    <Preview
      srcDoc={wrapHtmlLayout(addBorders(replaceResources(layoutHtml, resources)))}
      {...getPreviewDimensions()}
    />
  );
};

export default PagePreviewHtml;
