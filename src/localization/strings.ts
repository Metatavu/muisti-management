import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";
import { StringStream } from "codemirror";

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

  dashboard: {
    newExhibitionButton: string;
    navigation: {
      overviewButton: string;
      recentButton: string;
      draftsButton: string;
      archivedButton: string;
      settingsButton: string;
      usersButton: string;
      devicesButton: string;
      layoutsButton: string;
    };
    overview: {
      onProduction: string;
      lastModified: string;
      visitors: string;
      longTour: string;
      shortTour: string;
      statistics: {
        title: string;
        day: string;
        week: string;
        month: string;
        year: string;
      };
    };
    recent: {
      title: string;
      lastModified: string;
    };
    archived: {
      title: string;
    };
    drafts: {
      title: string;
    };
    settings: {
      title: string;
    };
    users: {
      title: string;
    };
    devices: {
      title: string;
      dialog: {
        brand: string;
        model: string;
        resolution: string;
        physicalSize: string;
        type: string;
        touchScreen: string;
      };
    };
    layouts: {
      title: string;
      lastModified: string;
    };
  };

  exhibition: {
    content: string;
    tech: string;
  };

  sorting: {
    exhibition: {
      recent: {
        byModifiedAt: string;
        byCreatedAt: string;
      };
    };
  };

}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;