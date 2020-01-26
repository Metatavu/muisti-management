import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

/**
 * Interface describing localized strings
 */
export interface IStrings extends LocalizedStringsMethods {
  exhibitions: {
    listTitle: string,
    createExhibitionDialog: {
      title: string,
      helpText: string,
      nameLabel: string,
      cancelButton: string
      createButton: string
    }
  },

  errorDialog: {
    title: string,
    reloadPage: string,
    unsavedContents: string,
    reportIssue: string,
    technicalDetails: string,
    time: string,
    url: string,
    errorMessage: string,
    close: string
    reload: string,
  },
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;