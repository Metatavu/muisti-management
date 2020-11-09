import * as React from "react";
import { Mqtt } from "../../mqtt";

/**
 * Interface representing component properties
 */
interface Props {
  mqtt: Mqtt;
  antenna: string;
  threshold: number;
  children: React.FunctionComponent<string>;
}

/**
 * Interface representing component state
 */
interface State {
  tag: string;
}

interface MqttProximityUpdate {
  tag: string;
  strength: number;
}

const MQTT_PREFIX = process.env.REACT_APP_MQTT_PREFIX || "";

/**
 * React component for listening RFID tags
 */
export default class TagListener extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      tag: ""
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
  public render() {
    return this.state.tag;
  }

  /**
   * Handler for MQTT proximity updates
   * 
   * @param message message
   */
  private onMqttProximityUpdate = (message: MqttProximityUpdate) => {
    if (message.strength > this.props.threshold) {
      this.setState({
        tag: message.tag
      });
    }
  }
}
