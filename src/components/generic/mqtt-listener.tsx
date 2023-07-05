import mqtt, { Mqtt } from "../../mqtt";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props {
  onError: (error: Error) => void;
  children: React.FunctionComponent<Mqtt>;
}

/**
 * React component handling MQTT client connection
 */
export const MqttListener: React.FC<Props> = ({ onError, children }) => {
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        await mqtt.connect();
      } catch (error) {
        onError(error);
      }

      setConnected(true);
    })();
  }, [onError]);

  /**
   * Component render
   */
  return connected ? children(mqtt) : null;
};
