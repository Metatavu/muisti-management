/**
 * Available page layout view properties width values
 */
export enum LayoutWidthValues {
  MatchParent = "match_parent",
  WrapContent = "wrap_content"
}

/**
 * Available page layout view properties height values
 */
export enum LayoutHeightValues {
  MatchParent = "match_parent",
  WrapContent = "wrap_content"
}

/**
 * Available page layout view properties layout_gravity values
 * These are predefined to make things easier when handling value
 * changes in gravity-editor.tsx
 */
export enum LayoutGravityValuePairs {
  LeftTop = "left|top",
  Top = "top",
  RightTop = "right|top",
  LeftCenter = "left|center",
  Center = "center",
  RightCenter = "right|center",
  LeftBottom = "left|bottom",
  Bottom = "bottom",
  RightBottom = "right|bottom"
}

/**
 * Available text view text style values
 */
export enum TextViewTextStyleValues {
  Normal = "normal",
  Bold = "bold"
}

/**
 * Available text view text align values
 */
export enum TextViewTextAlignValues {
  Inherit = "inherit",
  Gravity = "gravity",
  TextStart = "text_start",
  TextEnd = "text_end",
  Center = "center",
  ViewStart = "view_start",
  ViewEnd = "view_end"
}

/**
 * Available linear layout orientation values
 */
export enum LinearLayoutOrientationValues {
  Horizontal = "horizontal",
  Vertical = "vertical"
}

/**
 * Tab layout mode values
 */
export enum TabModeValues {
  Scrollable = "scrollable",
  Fixed = "fixed"
}

/**
 * Tab gravity values
 */
export enum TabGravityValues {
  Center = "center",
  Fill = "fill"
}

/**
 * Selected tab indicator gravity values
 */
export enum SelectedTabIndicatorGravityValues {
  Bottom = "bottom",
  Center = "center",
  Top = "top",
  Stretch = "stretch"
}
