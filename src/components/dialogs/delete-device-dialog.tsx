import { Device } from "../../generated/client";
import strings from "../../localization/strings";
import GenericDialog from "../generic/generic-dialog";
import { TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";

/**
 * Components properties
 */
interface Props {
  deviceToDelete?: Device;
  onClose: () => void;
  onDelete: (device: Device) => Promise<void>;
}

/**
 * Delete Device Dialog component
 */
const DeleteDeviceDialog = ({ deviceToDelete, onClose, onDelete }: Props) => {
  const [confirmInput, setConfirmInput] = useState("");

  /**
   * Event handler for delete button click
   */
  const handleDelete = async () => {
    if (!deviceToDelete) return;
    await onDelete(deviceToDelete);
  };

  /**
   * Event handler for confirm name input
   */
  const handleConfirmInputChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    setConfirmInput(value);

  return (
    <GenericDialog
      title={strings.fleetManagement.deleteDialog.title}
      fullWidth
      open={!!deviceToDelete}
      onClose={onClose}
      onConfirm={handleDelete}
      positiveButtonText={strings.generic.delete}
      cancelButtonText={strings.generic.cancel}
      confirmDisabled={confirmInput !== deviceToDelete?.name}
      onCancel={onClose}
    >
      {strings.fleetManagement.deleteDialog.description}
      <TextField
        fullWidth
        placeholder={strings.fleetManagement.deleteDialog.confirmInputPlaceholder}
        value={confirmInput}
        onChange={handleConfirmInputChange}
      />
    </GenericDialog>
  );
};

export default DeleteDeviceDialog;
