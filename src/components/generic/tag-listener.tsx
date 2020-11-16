import { WithStyles, withStyles, Typography } from "@material-ui/core";
import * as React from "react";
import strings from "../../localization/strings";
import { Mqtt } from "../../mqtt";
import styles from "../../styles/components/generic/tag-listener";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  mqtt: Mqtt;
  antenna: string;
  threshold: number;
  onTagRegister: (tag: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

interface MqttProximityUpdate {
  tag: string;
  strength: number;
}

const MQTT_PREFIX = process.env.REACT_APP_MQTT_PREFIX || "";

/**
 * React component for listening RFID tags
 */
class TagListener extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Component did mount life cycle event
   */
  public componentDidMount = async () => {
    this.props.mqtt.subscribe(`${MQTT_PREFIX}${this.props.antenna}/`, this.onMqttProximityUpdate);
  }

  /**
   * Component will unmount life cycle event
   */
  public componentWillUnmount() {
    this.props.mqtt.unsubscribe(`${MQTT_PREFIX}${this.props.antenna}/`, this.onMqttProximityUpdate);
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes } = this.props;

    return (
      <div
        className={ classes.container }
      >
        <Typography
          className={ classes.text }
          variant="h3"
        >
          { strings.reception.registerTag }
        </Typography>
      </div>
    );
  }

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
  }
}

export default withStyles(styles)(TagListener);