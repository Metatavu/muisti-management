/**
 * Available page layout view properties width values
 */
export enum LayoutWidthValues {
  MatchParent = "match_parent",
  WrapContent = "wrap_content",
  FillParent = "fill_parent",
}

/**
 * Available page layout view properties height values
 */
export enum LayoutHeightValues {
  MatchParent = "match_parent",
  WrapContent = "wrap_content",
  FillParent = "fill_parent"
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