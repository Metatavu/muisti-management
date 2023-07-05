import { Config } from "../../constants/configuration";
import strings from "../../localization/strings";
import { Mqtt } from "../../mqtt";
import logo from "../../resources/gfx/muisti-logo.png";
import styles from "../../styles/components/generic/tag-listener";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  mqtt: Mqtt;
  antenna: string;
  threshold: number;
  hide: boolean;
  onTagRegister: (tag: string) => void;
}

interface MqttProximityUpdate {
  tag: string;
  strength: number;
}

const config = Config.getConfig();

/**
 * React component for listening RFID tags
 */
class TagListener extends React.Component<Props> {
  /**
   * Component did mount life cycle event
   */
  public componentDidMount = () => {
    const { mqtt, antenna } = this.props;

    const basePath = `${config.mqttConfig.prefix}${antenna}`;
    mqtt.subscribe(basePath, this.onMqttProximityUpdate);
    mqtt.subscribe(`${basePath}/`, this.onMqttProximityUpdate);
  };

  /**
   * Component will unmount life cycle event
   */
  public componentWillUnmount = () => {
    const { mqtt, antenna } = this.props;

    const basePath = `${config.mqttConfig.prefix}${antenna}`;
    mqtt.unsubscribe(basePath, this.onMqttProximityUpdate);
    mqtt.unsubscribe(`${basePath}/`, this.onMqttProximityUpdate);
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, hide } = this.props;

    if (hide) {
      return null;
    }

    return (
      <div className={classes.container}>
        <div className={classes.logoContainer}>
          <img alt="Muisti logo" src={logo} />
        </div>
        <div className={classes.formContainer}>
          <Typography className={classes.text} variant="h3">
            {strings.reception.registerTag}
          </Typography>
        </div>
      </div>
    );
  };

  /**
   * Handler for MQTT proximity updates
   *
   * @param message message
   */
  private onMqttProximityUpdate = (message: MqttProximityUpdate) => {
    const { threshold, onTagRegister } = this.props;

    if (message.strength > threshold) {
      onTagRegister(message.tag);
    }
  };
}

export default withStyles(styles)(TagListener);
