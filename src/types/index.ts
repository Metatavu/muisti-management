import {
  ContentVersion,
  DeviceModelCapabilities,
  Exhibition,
  ExhibitionDevice,
  ExhibitionDeviceGroup,
  ExhibitionFloor,
  ExhibitionPage,
  ExhibitionPageResource,
  ExhibitionRoom,
  PageLayout,
  RfidAntenna,
  Visitor,
  VisitorSession,
  VisitorVariable
} from "../generated/client";
import {
  DeviceModelDimensionsData,
  DeviceModelDisplayMetricsData
} from "./device-model-string-data";
import { ChangeEventHandler } from "react";

/**
 * Interface describing an access token
 */
export interface AccessToken {
  token: string;
  userId: string;
}

/**
 * Map of resources with id as a key
 */
export type ResourceMap = { [key: string]: ExhibitionPageResource };

/**
 * JSON Lint parse error hash object
 */
export interface JsonLintParseErrorHash {
  loc: {
    first_line: number;
    first_column: number;
    last_line: number;
    last_column: number;
  };
}

/**
 * Union type for device model data sub properties
 */
export type DeviceModelDataProperty =
  | DeviceModelDimensionsData
  | DeviceModelDisplayMetricsData
  | DeviceModelCapabilities;

/**
 * Union type for keys of device model data sub properties
 */
export type DeviceModelDataSubPropertyKey =
  | keyof DeviceModelDimensionsData
  | keyof DeviceModelDisplayMetricsData
  | keyof DeviceModelCapabilities;

/**
 * Enum for physical event trigger button values
 */
export enum PhysicalButton {
  BUTTON_1 = "F1",
  BUTTON_2 = "F2",
  BUTTON_3 = "F3",
  BUTTON_4 = "F4",
  BUTTON_5 = "F5",
  BUTTON_6 = "F6",
  BUTTON_7 = "F7",
  BUTTON_8 = "F8",
  BUTTON_9 = "F9"
}

/**
 * Interface for a single physical event trigger button
 */
export interface PhysicalButtonData {
  name: string;
  value: PhysicalButton;
}

/**
 * Interface describing exhibition element in exhibition editor
 */
export interface ExhibitionElement {
  data:
    | Exhibition
    | ContentVersion
    | ExhibitionFloor
    | ExhibitionRoom
    | ExhibitionDevice
    | ExhibitionPage;
  type: ExhibitionElementType;
}

/**
 * Enum for different exhibition element types
 */
export enum ExhibitionElementType {
  EXHIBITION = "EXHIBITION",
  CONTENT_VERSION = "CONTENT_VERSION",
  FLOOR = "FLOOR",
  ROOM = "ROOM",
  DEVICE = "DEVICE",
  PAGE = "PAGE"
}

/**
 * Interface describing generic action button
 */
export interface ActionButton {
  name: string;
  disabled?: boolean;
  action: () => void;
  selectAction?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  options?: LocalOptions[];
  value?: LanguageOptions;
}

/**
 * Interface describing locale options for select
 */
export interface LocalOptions {
  value: string;
  label: string;
}

/**
 * Interface describing breadcrumb data
 */
export interface BreadcrumbData {
  name: string;
  url?: string;
}

/**
 * Language codes (ISO 639-1)
 */
export enum LanguageOptions {
  FI = "FI",
  EN = "EN",
  SV = "SV",
  RU = "RU"
}

/**
 * Enum for media types
 */
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  MEDIA = "media"
}

/**
 * Enum for layout editor view
 */
export enum LayoutEditorView {
  VISUAL = "VISUAL",
  CODE = "CODE"
}

/**
 * CSS property value pairs
 */
export interface CSSPropertyValuePairs {
  key: string;
  value: string | number;
}

/**
 * Interface describing preview device data
 */
export interface PreviewDeviceData {
  device: ExhibitionDevice;
  page?: ExhibitionPage;
}

/**
 * Interface describing multi-lingual content version.
 * What it really does is it just holds all content versions that have the same name but different language.
 */
export interface MultiLingualContentVersion {
  languageVersions: ContentVersion[];
}

/**
 * Interface describing confirm dialog data
 */
export interface ConfirmDialogData {
  deletePossible: boolean;
  title: string;
  text: string | string[];
  positiveButtonText: string;
  cancelButtonText: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm?: () => void;
  contentTitle?: string;
  contentSpecificMessages?: ContentSpecificDeleteMessage[];
}

/**
 * Interface describing content specific delete message with list of names
 */
export interface ContentSpecificDeleteMessage {
  localizedMessage: string;
  names: string[];
}

/**
 * Interface describing delete data holder.
 */
export interface DeleteDataHolder {
  objects: (
    | Exhibition
    | ContentVersion
    | ExhibitionFloor
    | ExhibitionRoom
    | ExhibitionDeviceGroup
    | ExhibitionDevice
    | RfidAntenna
    | ExhibitionPage
    | PageLayout
    | Visitor
    | VisitorSession
    | VisitorVariable
  )[];
  localizedMessage: string;
}

/**
 * Interface describing static application configuration
 */
export interface StaticConfig {
  keycloakConfig: KeycloakConfig;
  apiBasePath: string;
  cdnBasePath: string;
  userContentUploadUrl: string;
  mqttConfig: MQTTConfig;
  diagnostics: DiagnosticsConfig;
}

/**
 * Interface describing keycloak configuration
 */
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

/**
 * Interface describing mqtt configuration
 */
export interface MQTTConfig {
  urls: string[];
  prefix: string;
  userName: string;
  password: string;
  newVisitorAntenna: string;
  resetVisitorVariableAntenna: string;
  visitorManagementAntennas: string[];
  sessionTime: number;
}

/**
 * Interface describing diagnostics configuration
 */
export interface DiagnosticsConfig {
  tagZeroDelay: number;
  tagRemoveDelay: number;
}

/**
 * Tree Object type
 */
export type TreeObject = {
  type: HtmlComponentType;
  path: string;
  name?: string;
  id: string;
  resourceId?: string;
  children: TreeObject[];
  element: HTMLElement;
};

/**
 * Component Type enum
 */
export enum HtmlComponentType {
  LAYOUT = "layout",
  BUTTON = "button",
  IMAGE = "image",
  TEXT = "text",
  TABS = "tabs",
  TAB = "tab",
  VIDEO = "video",
  IMAGE_BUTTON = "image-button"
}

/**
 * Layout alignment enum
 */
export enum LayoutAlignment {
  NORTH_WEST = "nw",
  NORTH = "n",
  NORTH_EAST = "ne",
  WEST = "w",
  CENTER = "c",
  EAST = "e",
  SOUTH_WEST = "sw",
  SOUTH = "s",
  SOUTH_EAST = "se"
}

/**
 * Text component HTML element types enum
 */
export enum HtmlTextComponentType {
  H1 = "H1",
  H2 = "H2",
  H3 = "H3",
  H4 = "H4",
  H5 = "H5",
  H6 = "H6",
  P = "P",
  BUTTON = "BUTTON"
}

/**
 * Grouped inputs type enum
 */
export enum GroupedInputsType {
  MARGIN = "margin",
  PADDING = "padding",
  BORDER_RADIUS = "border-radius"
}

/**
 * Navigation button interface
 */
export interface NavigationButton {
  postfix: string;
  label: string;
}

// Required for Leaflet to work.
// Older version of Leaflet declares it as global variable but newer version no longer does
// https://github.com/Leaflet/Leaflet.draw/issues/1026#issuecomment-986702652
declare global {
  interface Window {
    type: boolean;
  }
}
