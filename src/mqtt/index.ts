import { Config } from "../constants/configuration";
import Paho from "paho-mqtt";

/**
 * Message subscribe callback handler
 */
export type OnMessageCallback = (message: any) => void;

const config = Config.getConfig();

/**
 * Class that handles MQTT connection
 */
export class Mqtt {
  private client: Paho.Client | null;
  private subscribers: Map<string, OnMessageCallback[]>;
  private connecting: boolean;
  private connected: boolean;

  /**
   * Constructor
   */
  constructor() {
    this.client = null;
    this.connecting = false;
    this.connected = false;
    this.subscribers = new Map();
  }

  /**
   * Publishes a message
   *
   * @param topic topic
   * @param payload message payload
   */
  public publish(topic: string, payload: any) {
    if (!this.client) {
      throw new Error("No client");
    }

    const message = new Paho.Message(JSON.stringify(payload));
    message.destinationName = topic;

    this.client.send(message);
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
      this.subscribers.set(
        topic,
        topicSubscribers.filter((topicSubscriber) => {
          return topicSubscriber !== onMessage;
        })
      );
    }
  }

  /**
   * Connects to the MQTT server
   */
  public async connect() {
    await this.waitConnecting();
    await this.doConnect();
    this.connected = true;
  }

  /**
   * Waits for connecting status
   */
  public async waitConnecting(): Promise<null> {
    const timeout = new Date().getTime() + 60000;
    do {
      if (await this.waitConnectingDelayed()) {
        return null;
      }
    } while (timeout > new Date().getTime());

    throw new Error(`Timeout`);
  }

  /**
   * Disconnects from the server
   */
  public disconnect() {
    this.client?.disconnect();
    this.connected = false;
  }

  /**
   * Waits for connection connecting
   *
   * @returns promise for connection not connecting
   */
  private waitConnectingDelayed(): Promise<boolean> {
    return new Promise((resolve) => {
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
  private doConnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client && this.connected) {
        return resolve();
      }

      const secure = config.mqttConfig.secure !== false;
      const host = config.mqttConfig.host;
      const port = config.mqttConfig.port || undefined;
      const path = config.mqttConfig.path || "";
      const protocol = secure ? "wss://" : "ws://";
      const username = config.mqttConfig.userName;
      const password = config.mqttConfig.password;

      this.client?.connect({
        hosts: [host!],
        ports: [port!],
        keepAliveInterval: 30,
        userName: username,
        password: password,
        onSuccess: () => {}
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
