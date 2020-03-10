import { Exhibition } from "../generated/client";

export type ExhibitionState = Exhibition;

/**
 * Interface describing an access token
 */
export interface AccessToken {
    token: string;
    userId: string;
  }