/* eslint-disable new-parens */
import * as mqtt from "mqtt";
import { IClientOptions } from "mqtt";

/**
 * Message subscribe callback handler
 */
export type OnMessageCallback = (message: any) => void;


/**
 * Class that handles MQTT connection
 */
export class Mqtt {

  private client: mqtt.MqttClient | null;
  private subscribers: Map<string, OnMessageCallback[]>;
  private connecting: boolean;

  /**
   * Constructor
   */
  constructor () {
    this.client = null;
    this.connecting = false;
    this.subscribers = new Map();
  }

  /**
   * Publishes a message
   *
   * @param topic topic
   * @param message message
   * @returns promise for sent package
   */
  public publish(topic: string, message: any): Promise<mqtt.Packet> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        throw new Error("No client");
      }

      this.client.publish(topic, JSON.stringify(message), (error?: Error, packet?: mqtt.Packet) => {
        if (error) {
          reject(error);
        } else {
          resolve(packet);
        }
      });
    });
  }

  /**
   * Subscribes to given topic
   *
   * @param topic topic
   * @param onMessage message handler
   */
  public subscribe(topic: string, onMessage: OnMessageCallback) {
    const client = this.client;
    if (client) {
      const topicSubscribers = this.subscribers.get(topic) || [];
      topicSubscribers.push(onMessage);
      this.subscribers.set(topic, topicSubscribers);
      client.subscribe(topic);
    }
  }

  /**
   * Unsubscribes from given topic
   *
   * @param topic topic
   * @param onMessage message handler
   */
  public unsubscribe(topic: string, onMessage: OnMessageCallback) {
    const client = this.client;
    if (client) {
      client.unsubscribe(topic);
      const topicSubscribers = this.subscribers.get(topic) || [];
      this.subscribers.set(topic, topicSubscribers.filter(topicSubscriber => {
        return topicSubscriber !== onMessage;
      }));
    }
  }

  /**
   * Reconnects to MQTT server
   */
  public async reconnect() {
    if (this.client && this.client.connected) {
      await this.disconnect();
    }

    return this.connect();
  }

  /**
   * Connects to the MQTT server
   */
  public async connect() {
    await this.waitConnecting();
    return await this.doConnect();
  }

  /**
   * Returns whether client is connected
   *
   * @returns whether client is connected
   */
  public isConnected() {
    return this.client?.connected || false;
  }

  /**
   * Waits for connecting status
   */
  public async waitConnecting(): Promise<null> {
    const timeout = (new Date().getTime() + 60000);
    do {
      if (await this.waitConnectingDelayed()) {
        return null;
      }
    } while (timeout > (new Date().getTime()));

    throw new Error(`Timeout`);
  }

  /**
   * Disconnects from the server
   */
  public async disconnect() {
    return new Promise(resolve => {
      if (this.client && this.client.connected) {
        this.client.end(false, resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * Waits for connection connecting
   *
   * @returns promise for connection not connecting
   */
  private waitConnectingDelayed(): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(!this.connecting);
      }, 100);
    });
  }

  /**
   * Connects the MQTT client
   *
   * @returns promise for connection
   */
  private doConnect() {
    return new Promise(resolve => {
      if (this.client && this.client.connected) {
        return resolve();
      }

      const secure = process.env.REACT_APP_MQTT_SECURE !== "false";
      const host = process.env.REACT_APP_MQTT_HOST;
      const port = parseInt(process.env.REACT_APP_MQTT_PORT || "") || undefined;
      const path = process.env.REACT_APP_MQTT_PATH || "";
      const protocol = secure ? "wss://" : "ws://";
      const username = process.env.REACT_APP_MQTT_USERNAME;
      const password = process.env.REACT_APP_MQTT_PASSWORD;

      const url = `${protocol}${host}:${port}${path}`;
      const options: IClientOptions = {
        host: host,
        port: port,
        keepalive: 30,
        username: username,
        password: password
      };

      this.client = mqtt.connect(url, options);

      this.client.on("close", this.onClientClose.bind(this));
      this.client.on("offline", this.onClientOffline.bind(this));
      this.client.on("error", this.onClientError.bind(this));
      this.client.on("message", this.onClientMessage.bind(this));

      this.client.once("connect", () => {
        this.onClientConnect();
        resolve();
      });

    });
  }

  /**
   * Handles client connect event
   */
  private onClientConnect() {
    console.log("MQTT connection open");
  }

  /**
   * Handles client close event
   */
  private onClientClose() {
    console.log("MQTT connection closed");
  }

  /**
   * Handles client offline event
   */
  private onClientOffline() {
    console.log("MQTT connection offline");
  }

  /**
   * Handles client error event
   */
  private onClientError(error: Error) {
    console.error("MQTT connection error", error);
  }

  /**
   * Handles client message event
   */
  private onClientMessage(topic: string, payload: Buffer) {
    const message = JSON.parse(payload.toString());
    const topicSubscribers = this.subscribers.get(topic) || [];
    topicSubscribers.forEach((topicSubscriber: OnMessageCallback) => {
      topicSubscriber(message);
    });
  }

}

export default new Mqtt();