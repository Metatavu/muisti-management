// eslint-disable-next-line max-len
import { ExhibitionPageResource, DeviceModelCapabilities, ExhibitionPage, Exhibition, ContentVersion, ExhibitionFloor, ExhibitionRoom, ExhibitionDevice, ExhibitionDeviceGroup, RfidAntenna, GroupContentVersion, PageLayout, VisitorVariable, Visitor, VisitorSession } from "../generated/client";
import { DeviceModelDimensionsData, DeviceModelDisplayMetricsData } from "./device-model-string-data";

/**
 * Interface describing an access token
 */
export interface AccessToken {
  token: string;
  userId: string;
};

/**
 * Map of resources with id as a key
 */
export type ResourceMap = { [key: string]: ExhibitionPageResource };

/**
 * JSON Lint parse error hash object
 */
export interface JsonLintParseErrorHash {
  loc: {
    "first_line": number;
    "first_column": number;
    "last_line": number;
    "last_column": number;
  };
};

/**
 * Union type for device model data sub properties
 */
export type DeviceModelDataProperty = DeviceModelDimensionsData | DeviceModelDisplayMetricsData | DeviceModelCapabilities;

/**
 * Union type for keys of device model data sub properties
 */
export type DeviceModelDataSubPropertyKey = keyof DeviceModelDimensionsData | keyof DeviceModelDisplayMetricsData | keyof DeviceModelCapabilities;

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
};

/**
 * Interface for a single physical event trigger button
 */
export interface PhysicalButtonData {
  name: string;
  value: PhysicalButton;
};

/**
 * Interface describing exhibition element in exhibition editor
 */
export interface ExhibitionElement {
  data: Exhibition | ContentVersion | ExhibitionFloor | ExhibitionRoom | ExhibitionDevice | ExhibitionPage;
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
  text: string;
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
 *
 * Note: Types described in objects all have name as a parameter
 */
export interface DeleteDataHolder {
  objects: (Exhibition | ContentVersion | ExhibitionFloor | GroupContentVersion | ExhibitionRoom | ExhibitionDeviceGroup | ExhibitionDevice | RfidAntenna | ExhibitionPage | PageLayout | Visitor | VisitorSession | VisitorVariable)[];
  localizedMessage: string;
}