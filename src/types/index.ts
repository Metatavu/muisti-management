import { Exhibition, ExhibitionPageResource } from "../generated/client";

export type ExhibitionState = Exhibition;

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