import { AccessToken } from "../../types";
import { ExhibitionRoom, ExhibitionFloor, ExhibitionDevice, ExhibitionDeviceGroup } from "../../generated/client";
import Api from "../../api/api";

/**
 * Utility TS class for handling all needed API calls for leaflet
 */

 /**
  * Create floor handler
  *
  * @param accessToken keycloak access token access token
  * @param exhibitionId exhibition id exhibition id
  * @param exhibitionFloor
  */
// tslint:disable-next-line: max-line-length
export const createFloor = async (accessToken: AccessToken, exhibitionId: string, exhibitionFloor: ExhibitionFloor): Promise<ExhibitionFloor> => {
  const floorsApi = Api.getExhibitionFloorsApi(accessToken);
  const createdFloor = floorsApi.createExhibitionFloor({
    exhibitionId: exhibitionId,
    exhibitionFloor: exhibitionFloor
  });
  return createdFloor;
};

/**
 * Delete floor handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param floorId floor id
 */
export const deleteFloor = async (accessToken: AccessToken, exhibitionId: string, floorId: string) => {
  const floorsApi = Api.getExhibitionFloorsApi(accessToken);
  floorsApi.deleteExhibitionFloor({
    exhibitionId: exhibitionId,
    floorId: floorId
  });
};

/**
 * Update floor handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param floorToUpdate floor to update
 * @param floorId floor id
 */
// tslint:disable-next-line: max-line-length
export const updateFloor = async (accessToken: AccessToken, exhibitionId: string, floorToUpdate: ExhibitionFloor, floorId: string): Promise<ExhibitionFloor> => {
  const floorsApi = Api.getExhibitionFloorsApi(accessToken);
  const updatedFloor = floorsApi.updateExhibitionFloor({
    exhibitionId: exhibitionId,
    exhibitionFloor: floorToUpdate,
    floorId: floorId
  });

  return updatedFloor;
};

/**
 * Create room handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param roomToCreate room to create
 */
export const createRoom = async (accessToken: AccessToken, exhibitionId: string, roomToCreate: ExhibitionRoom): Promise<ExhibitionRoom> => {
  const roomsApi = Api.getExhibitionRoomsApi(accessToken);
  const newRoom = roomsApi.createExhibitionRoom({
    exhibitionId: exhibitionId,
    exhibitionRoom: roomToCreate
  });
  return newRoom;
};

/**
 * Update room handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param roomToUpdate room to update
 * @param roomId room id
 */
export const updateRoom = async (accessToken: AccessToken, exhibitionId: string, roomToUpdate: ExhibitionRoom, roomId: string): Promise<ExhibitionRoom> => {
  const roomsApi = Api.getExhibitionRoomsApi(accessToken);
  const updatedRoom = roomsApi.updateExhibitionRoom({
    exhibitionId: exhibitionId,
    exhibitionRoom: roomToUpdate,
    roomId: roomId
  });
  return updatedRoom;
};

/**
 * Delete room handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param roomId room id
 */
export const deleteRoom = async (accessToken: AccessToken, exhibitionId: string, roomId: string) => {
  const roomsApi = Api.getExhibitionRoomsApi(accessToken);
  roomsApi.deleteExhibitionRoom({
    exhibitionId: exhibitionId,
    roomId: roomId
  });
};

/**
 * Load rooms from API handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id exhibition id
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

/**
 * Create device group handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param deviceGroupToCreate device group to create
 */
// tslint:disable-next-line: max-line-length
export const createDeviceGroup = async (accessToken: AccessToken, exhibitionId: string, deviceGroupToCreate: ExhibitionDeviceGroup): Promise<ExhibitionDeviceGroup> => {
  const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
  const newGroup = deviceGroupsApi.createExhibitionDeviceGroup({
    exhibitionId: exhibitionId,
    exhibitionDeviceGroup: deviceGroupToCreate
  });

  return newGroup;
};

/**
 * Update device group handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param deviceGroupToUpdate device group to update
 * @param deviceGroupId group id
 */
// tslint:disable-next-line: max-line-length
export const updateDeviceGroup = async (accessToken: AccessToken, exhibitionId: string, deviceGroupToUpdate: ExhibitionDeviceGroup, deviceGroupId: string): Promise<ExhibitionDeviceGroup> => {
  const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
  const updatedGroup = deviceGroupsApi.updateExhibitionDeviceGroup({
    exhibitionId: exhibitionId,
    exhibitionDeviceGroup: deviceGroupToUpdate,
    deviceGroupId: deviceGroupId
  });

  return updatedGroup;
};

/**
 * Delete device group handler
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param deviceGroupId device group id
 */
export const deleteDeviceGroup = async (accessToken: AccessToken, exhibitionId: string, deviceGroupId: string) => {
  const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
  deviceGroupsApi.deleteExhibitionDeviceGroup({
    exhibitionId: exhibitionId,
    deviceGroupId: deviceGroupId
  });
};

/**
 * Create device handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param deviceToCreate device to create
 */
// tslint:disable-next-line: max-line-length
export const createDevice = async (accessToken: AccessToken, exhibitionId: string, deviceToCreate: ExhibitionDevice): Promise<ExhibitionDevice> => {
  const devicesApi = Api.getExhibitionDevicesApi(accessToken);
  const createdDevice = devicesApi.createExhibitionDevice({
    exhibitionId: exhibitionId,
    exhibitionDevice: deviceToCreate
  });

  return createdDevice;
};

/**
 * Update device handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param deviceToUpdate device to update
 * @param deviceId device id
 */
// tslint:disable-next-line: max-line-length
export const updateDevice = async (accessToken: AccessToken, exhibitionId: string, deviceToUpdate: ExhibitionDevice, deviceId: string): Promise<ExhibitionDevice> => {
  const devicesApi = Api.getExhibitionDevicesApi(accessToken);
  const updatedDevice = devicesApi.updateExhibitionDevice({
    deviceId: deviceId,
    exhibitionDevice: deviceToUpdate,
    exhibitionId: exhibitionId
  });

  return updatedDevice;
};

/**
 * Delete device handler
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param deviceId device id
 */
export const deleteDevice = async (accessToken: AccessToken, exhibitionId: string, deviceId: string) => {
  const devicesApi = Api.getExhibitionDevicesApi(accessToken);
  devicesApi.deleteExhibitionDevice({
    exhibitionId: exhibitionId,
    deviceId: deviceId
  });
};

/**
 * Load device from API
 *
 * @param accessToken keycloak access token
 * @param exhibitionId exhibition id
 * @param selectedDeviceGroup selected device group
 * @param selectedDevice selected device
 */
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