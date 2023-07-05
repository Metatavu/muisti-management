import Api from "../../api/api";
import { useInterval } from "../../app/hooks";
import { Config } from "../../constants/configuration";
import {
  MqttProximityUpdate,
  RfidAntenna,
  VisitorSession,
  VisitorSessionState
} from "../../generated/client";
import strings from "../../localization/strings";
import { Mqtt } from "../../mqtt";
import { ReduxState } from "../../store";
import styles from "../../styles/components/diagnostics/tag-monitoring-view";
import { AccessToken } from "../../types";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import React from "react";
import { connect } from "react-redux";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

/**
 * Visible tag data
 */
export interface VisibleTag {
  id: string;
  strength: number;
  zeroedAt: number;
  removedAt: number;
}

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  mqtt: Mqtt;
  antenna: RfidAntenna;
  accessToken?: AccessToken;
  exhibitionId: string;
}

/**
 * Tag monitoring view
 *
 * @param props component properties
 */
const TagMonitoringView: React.FC<Props> = ({
  classes,
  mqtt,
  antenna,
  accessToken,
  exhibitionId
}) => {
  const pendingMessages = React.useRef<MqttProximityUpdate[]>([]);
  const [visibleTags, setVisibleTags] = React.useState<VisibleTag[]>([]);
  const [tagSessions, setTagSessions] = React.useState<{ [tag: string]: VisitorSession }>({});
  const [loadingTagIds, setLoadingTagIds] = React.useState<string[]>([]);

  /**
   * Adds sessions found from tag to the tag sessions list
   *
   * @param tagId tag ID to list sessions with
   */
  const addTagSessions = async (tagId: string) => {
    if (!accessToken || !exhibitionId) {
      return;
    }

    const visitorSessions = await Api.getVisitorSessionsApi(accessToken).listVisitorSessions({
      exhibitionId,
      tagId
    });

    const activeSession = visitorSessions.find(
      (session) => session.state === VisitorSessionState.ACTIVE
    );

    activeSession && setTagSessions({ ...tagSessions, [tagId]: activeSession });
    setLoadingTagIds(loadingTagIds.filter((id) => id !== tagId));
  };

  /**
   * Event handler for proximity update
   *
   * @param message proximity update message
   */
  const onMqttProximityUpdate = (message: MqttProximityUpdate) => {
    message && pendingMessages.current.push(message);
  };

  /**
   * Updates visible tags list from pending mqtt proximity messages
   */
  const updateVisibleTags = () => {
    const messages = [...pendingMessages.current];
    pendingMessages.current = [];
    const updatedTagsList = messages
      .reduce(addOrUpdateTagFromMessage, [...visibleTags])
      .reduce(removeExpiredTag, []);

    setVisibleTags(updatedTagsList);
  };

  /**
   * Adds or updates message to tags list
   *
   * @param list list to modify
   * @param message message to add or update to list as tag
   * @returns updated list
   */
  const addOrUpdateTagFromMessage = (list: VisibleTag[], message: MqttProximityUpdate) => {
    const currentTime = new Date().getTime();

    const tagFromMessage: VisibleTag = {
      id: message.tag,
      strength: limitStrength(message.strength),
      zeroedAt: currentTime + Config.getConfig().diagnostics.tagZeroDelay,
      removedAt: currentTime + Config.getConfig().diagnostics.tagRemoveDelay
    };

    const existingIndex = list.findIndex((tag) => tag.id === message.tag);

    if (existingIndex === -1) {
      addTagSessions(tagFromMessage.id);
      setLoadingTagIds([...loadingTagIds, tagFromMessage.id]);
      return [...list, tagFromMessage];
    }

    return [...list.slice(0, existingIndex), tagFromMessage, ...list.slice(existingIndex + 1)];
  };

  /**
   * Limits strength between 0 and 100
   *
   * @param strength strength
   * @returns limited strength
   */
  const limitStrength = (strength: number) => {
    return Math.min(Math.max(strength, 0), 100);
  };

  /**
   * Reducer that removes tag from list if expired
   *
   * @param list list of tags
   * @param tag tag to remove if expired
   * @returns updated list
   */
  const removeExpiredTag = (list: VisibleTag[], tag: VisibleTag) => {
    const currentTime = new Date().getTime();

    if (tag.removedAt < currentTime) {
      return list;
    }

    if (tag.zeroedAt < currentTime) {
      return [...list, { ...tag, strength: 0 }];
    }

    return [...list, tag];
  };

  /**
   * Returns color based on signal strength
   *
   * @param strength signal strength
   * @returns color value
   */
  const getColor = (strength: number) => {
    return `rgb(${0}, ${strength * 2.5}, ${0})`;
  };

  /**
   * Formats tag to label
   *
   * @param tagId tag ID
   * @return label
   */
  const formatLabel = (tagId: string) => {
    if (loadingTagIds.includes(tagId)) {
      return "";
    }

    const tagSession = tagSessions[tagId];
    const sessionId = tagSession ? tagSession.id : undefined;

    return sessionId ? abbreviate(sessionId) : strings.diagnostics.noSession;
  };

  /**
   * Returns last four characters with ellipsis prefix from given string
   *
   * @param value value to abbreviate
   * @return abbreviated value
   */
  const abbreviate = (value: string) => {
    return `...${value.slice(-4)}`;
  };

  /**
   * Stop function for started update visible tags interval
   */
  const stopInterval = useInterval(updateVisibleTags, 500);

  /**
   * Effect that subscribes and unsubscribes to antenna's mqtt channel
   */
  React.useEffect(() => {
    const mqttChannel = `${Config.getConfig().mqttConfig.prefix}${antenna.readerId}/${
      antenna.antennaNumber
    }`;

    mqtt.subscribe(mqttChannel, onMqttProximityUpdate);

    return () => {
      mqtt.unsubscribe(mqttChannel, onMqttProximityUpdate);
    };
    // eslint-disable-next-line
  }, []);

  /**
   * Effect that stops update visible tags interval when component will unmount
   */
  React.useEffect(() => () => stopInterval && stopInterval(), [stopInterval]);

  /**
   * Component render
   */
  return (
    <div className={classes.chartContainer}>
      <ResponsiveContainer width="97%" height="95%">
        <BarChart data={visibleTags}>
          <YAxis domain={[0, 100]} width={30} />
          <XAxis
            domain={!visibleTags.length ? [] : undefined}
            dataKey="id"
            interval={0}
            height={20}
            tickFormatter={formatLabel}
          />
          <Bar dataKey="strength">
            {visibleTags
              .sort((a, b) => a.id.localeCompare(b.id))
              .map((tag) => (
                <Cell key={tag.id} fill={getColor(tag.strength)} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state Redux store state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  accessToken: state.auth.accessToken,
  selectedExhibition: state.exhibitions.selectedExhibition
});

export default connect(mapStateToProps)(withStyles(styles)(TagMonitoringView));
