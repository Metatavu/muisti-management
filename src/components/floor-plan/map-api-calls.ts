import { AccessToken } from "../../types";
import { ExhibitionRoom, ExhibitionFloor, ExhibitionDevice, ExhibitionDeviceGroup } from "../../generated/client";
import Api from "../../api/api";

/**
 * Utility TS class for handling all needed API calls for leaflet
 */

/**
 * Load rooms from API
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param selectedFloor selected floor object
 * @param selectedRoom selected room object
 */
// tslint:disable-next-line: max-line-length
export const loadRooms = async (accessToken: AccessToken, exhibitionId?: string, selectedFloor?: ExhibitionFloor, selectedRoom?: ExhibitionRoom): Promise<ExhibitionRoom[]> => {
  if (!accessToken || !exhibitionId || !selectedFloor || !selectedFloor.id) {
    return [];
  }

  const roomsApi = Api.getExhibitionRoomsApi(accessToken);
  let foundRooms: ExhibitionRoom[] = [];

  if (selectedRoom && selectedRoom.id) {
    const foundRoom = await roomsApi.findExhibitionRoom({
      exhibitionId: exhibitionId,
      roomId: selectedRoom.id
    });
    foundRooms.push(foundRoom);
  } else {
    foundRooms = await roomsApi.listExhibitionRooms({
      exhibitionId: exhibitionId,
      floorId: selectedFloor.id
    });
  }

  return foundRooms;
};

// tslint:disable-next-line: max-line-length
export const loadDevices = async (accessToken: AccessToken, exhibitionId?: string, selectedDeviceGroup?: ExhibitionDeviceGroup, selectedDevice?: ExhibitionDevice): Promise<ExhibitionDevice[]> => {
  if (!accessToken || !exhibitionId || !selectedDeviceGroup || !selectedDeviceGroup.id) {
    return [];
  }

  const devicesApi = Api.getExhibitionDevicesApi(accessToken);
  let foundDevices: ExhibitionDevice[] = [];

  if (selectedDevice && selectedDevice.id) {
    const foundDevice = await devicesApi.findExhibitionDevice({
      exhibitionId: exhibitionId,
      deviceId: selectedDevice.id
    });
    foundDevices.push(foundDevice);
  } else {
    foundDevices = await devicesApi.listExhibitionDevices({
      exhibitionId: exhibitionId,
      exhibitionGroupId: selectedDeviceGroup.id
    });
  }

  return foundDevices;
};

// tslint:disable-next-line: max-line-length
export const updateDevice = async (accessToken: AccessToken, exhibitionId?: string, selectedDevice?: ExhibitionDevice, latlng?: any): Promise<ExhibitionDevice | any> => {
  if (!accessToken || !exhibitionId || !selectedDevice || !selectedDevice.id || !latlng || !latlng.lat || !latlng.lng) {
    return;
  }

  const devicesApi = Api.getExhibitionDevicesApi(accessToken);
  const deviceToUpdate = { ...selectedDevice };
  deviceToUpdate.location = {
    x: latlng.lat,
    y: latlng.lng
  };

  const updatedDevice = devicesApi.updateExhibitionDevice({
    deviceId: selectedDevice.id,
    exhibitionDevice: deviceToUpdate,
    exhibitionId: exhibitionId
  });

  return updatedDevice;
};