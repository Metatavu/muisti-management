import { ContentSpecificDeleteMessage, DeleteDataHolder } from "../types";

/**
 * Utility class for displaying delete data
 */
export default class DeleteUtils {
  /**
   * Constructs content error message list
   *
   * @param messageList message list
   * @returns error message list
   */
  public static constructContentDeleteMessages = (dataHolder: DeleteDataHolder[]) => {
    const deleteMessages: ContentSpecificDeleteMessage[] = [];
    dataHolder.forEach((data) => {
      if (data.objects.length > 0) {
        deleteMessages.push(
          DeleteUtils.constructDeleteMessage(data.objects, data.localizedMessage)
        );
      }
    });

    return deleteMessages;
  };

  /**
   * Constructs single error message
   *
   * @param list any list specified in DeleteDataHolder
   * @param contentDeleteMessage localized content error message
   * @returns single error message
   */
  private static constructDeleteMessage = (
    list: any,
    contentDeleteMessage: string
  ): ContentSpecificDeleteMessage => {
    const errorMessage: string = contentDeleteMessage;
    const names: string[] = [];

    list.forEach((data: any) => {
      names.push(data.name || "");
    });

    return { localizedMessage: errorMessage, names: names };
  };
}
