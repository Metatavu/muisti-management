/**
 * Enum listing different sort parameters for exhibitions
 */
export enum ExhibitionRecentSortBy {
  MODIFIED_AT = "MODIFIED_AT",
  CREATED_AT = "CREATED_AT"
}

/**
 * interface describing different sort parameters for exhibitions
 */
export interface ExhibitionRecentSortOption {
  name: string;
  value: ExhibitionRecentSortBy;
}
