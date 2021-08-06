/**
 * MQTT message for tag proximity update
 */
export interface ProximityUpdate {
  strength: number;
  tag: string;
}

/**
 * Visible tag data
 */
export interface VisibleTag {
  id: string;
  strength: number;
  zeroedAt: number;
  removedAt: number;
}