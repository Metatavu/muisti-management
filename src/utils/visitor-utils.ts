import { Config } from "../constants/configuration";
import { Visitor, VisitorSession } from "../generated/client";
import strings from "../localization/strings";
import moment from "moment";
import { v4 as uuid } from "uuid";

/**
 * Utility class for visitor management
 */
export default class VisitorUtils {
  /**
   * Fills entire Visitor object with anonymous data. This also applies to already created visitors who have missing data
   *
   * @param tag RFID-tag
   * @param visitor visitor or undefined
   * @returns filled Visitor object
   */
  public static fillWithAnonymousData = (tag: string, visitor?: Visitor): Visitor => {
    return {
      id: visitor?.id,
      email: visitor?.email ?? `${uuid()}@example.com`,
      language: visitor?.language ?? "fi",
      tagId: tag,
      firstName: visitor?.firstName ?? "firstName",
      lastName: visitor?.lastName ?? "lastName",
      phone: visitor?.phone ?? "+358123456789",
      birthYear: visitor?.birthYear ?? 1900
    };
  };

  /**
   * Get visitor session info text
   *
   * @param session session
   * @returns visitor session info text
   */
  public static getVisitorSessionInfoText = (session: VisitorSession): string => {
    const sessionVisitors = session.visitorIds.length;
    const visitorString =
      sessionVisitors > 1
        ? strings.visitorsManagement.visitors
        : strings.visitorsManagement.visitor;
    const dateString = moment(session.createdAt).format("HH:mm");

    return `${sessionVisitors} ${visitorString} - ${dateString}`;
  };

  /**
   * Gets session expiration date in string format
   *
   * @param session session
   * @returns expiration date in DD.MM.YYYY HH:mm format
   */
  public static getSessionExpiresTime = (session: VisitorSession): string => {
    const sessionTime = Config.getConfig().mqttConfig.sessionTime;
    const dateString = moment(session.createdAt)
      .add(sessionTime, "hours")
      .format("DD.MM.YYYY HH:mm");

    return `${strings.visitorsManagement.sessionExpires}: ${dateString}`;
  };
}
