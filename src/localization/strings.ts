import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

/**
 * Interface describing localized strings
 */
export interface IStrings extends LocalizedStringsMethods {
  exhibitions: {
    listTitle: string;
    newExhibitionLabel: string;
    createExhibitionDialog: {
      title: string;
      helpText: string;
      nameLabel: string;
      cancelButton: string;
      createButton: string;
    };
  };

  errorDialog: {
    title: string;
    reloadPage: string;
    unsavedContents: string;
    reportIssue: string;
    technicalDetails: string;
    time: string;
    url: string;
    errorMessage: string;
    close: string;
    reload: string;
  };

  exhibitionLayouts: {
    editView: {
      xml: string;
      json: string;
      saveButton: string;
      switchToCodeButton: string;
      switchToVisualButton: string;
      importButton: string;
      deleteButton: string;
      deleteConfirmTitle: string;
      deleteConfirmText: string;
      deleteConfirmDelete: string;
      deleteConfirmCancel: string;
    };
  };
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;