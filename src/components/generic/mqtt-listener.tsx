import * as React from "react";
import mqtt, { Mqtt } from "../../mqtt";

/**
 * Interface representing component properties
 */
interface Props {
  children: React.FunctionComponent<Mqtt>;
  onError: (error: Error) => void;
}

/**
 * Interface representing component state
 */
interface State {
  connected: boolean;
}

/**
 * React component handling MQTT client connection
 */
export default class MqttListener extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      connected: false
    };
  }

  /**
   * Component did mount life cycle event
   */
  public componentDidMount = async () => {
    this.setState({
      connected: false
    });

    try {
      await mqtt.connect();

      this.setState({
        connected: true
      });
    } catch (e) {
      this.props.onError(e);
    }
  }

  /**
   * Component will unmount life cycle event
   */
  public componentWillUnmount = () => {
    this.setState({
      connected: false
    });

    mqtt.disconnect();
  }

  /**
   * Component render method
   */
  public render = () => {
    if (this.state.connected) {
      return this.props.children(mqtt);
    }

    return null;
  }
}
