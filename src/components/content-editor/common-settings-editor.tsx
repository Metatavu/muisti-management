import { ExhibitionDevice, ExhibitionPage, LayoutType, PageLayout } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/page-settings-editor";
import theme from "../../styles/theme";
import { Android as AndroidIcon, Html as HtmlIcon } from "@mui/icons-material/";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  pageData: ExhibitionPage;
  onDeviceChange: (deviceId: string) => void;
  onLayoutChange: (layoutId: string) => void;
  onNameChange: (text: string) => void;
}

/**
 * Component for common exhibition page settings editor
 */
const CommonSettingsEditor: React.FC<Props> = ({
  layouts,
  devices,
  pageData,
  classes,
  onDeviceChange,
  onLayoutChange,
  onNameChange
}) => {
  const pageLayout = layouts.find((layout) => layout.id === pageData.layoutId);

  /**
   * Renders layout select
   */
  const renderLayoutSelect = () => {
    const layoutSelectItems = [...layouts]
      .filter((layout) => pageLayout?.layoutType == layout.layoutType)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((layout) => (
        <MenuItem key={layout.id} value={layout.id}>
          {layout.name}
          {layout.layoutType === LayoutType.Android ? (
            <AndroidIcon sx={{ color: "#3DDC84", marginLeft: 1 }} />
          ) : (
            <HtmlIcon sx={{ marginLeft: 1 }} />
          )}
        </MenuItem>
      ));

    return (
      <div
        style={{
          marginTop: theme.spacing(2)
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="pageLayoutId">{strings.contentEditor.editor.layout}</InputLabel>
          <Select
            fullWidth
            label={strings.contentEditor.editor.layout}
            labelId="pageLayoutId"
            value={pageData.layoutId}
            onChange={(event) => onLayoutChange(event.target.value)}
          >
            {layoutSelectItems}
          </Select>
        </FormControl>
      </div>
    );
  };

  /**
   * Renders device select
   */
  const renderDeviceSelect = () => {
    const selectItems = devices.map((device) => {
      return (
        <MenuItem key={device.id!} value={device.id}>
          {device.name}
        </MenuItem>
      );
    });
    return (
      <FormControl fullWidth>
        <InputLabel id="pageDeviceId">{strings.contentEditor.editor.device}</InputLabel>
        <Select
          fullWidth
          label={strings.contentEditor.editor.device}
          labelId="pageDeviceId"
          name="deviceId"
          value={pageData.deviceId}
          onChange={(event) => onDeviceChange(event.target.value)}
        >
          {selectItems}
        </Select>
      </FormControl>
    );
  };

  return (
    <>
      <TextField
        fullWidth
        label={strings.contentEditor.editor.pageName}
        name="name"
        value={pageData.name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <div className={classes.selectFields}>
        {renderDeviceSelect()}
        {renderLayoutSelect()}
      </div>
    </>
  );
};

export default withStyles(styles)(CommonSettingsEditor);