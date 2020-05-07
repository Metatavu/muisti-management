import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

/**
 * Interface describing localized strings
 */
export interface IStrings extends LocalizedStringsMethods {
  comingSoon: string;

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

  confirmDialog: {
    cancel: string;
    delete: string;
  };

  editorDialog: {
    cancel: string;
    save: string;
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
      capabilities: string;
      newDevice: string;
      dialog: {
        deleteDeviceTitle: string;
        deleteDeviceText: string;
        brand: string;
        model: string;
        displayMetrics: {
          displayInfo: string;
          widthPixels: string;
          heightPixels: string;
        };
        dimensions: {
          physicalSize: string;
          width: string;
          height: string;
          depth: string;
          screenWidth: string;
          screenHeight: string;
        };
        touchscreen: string;
        type: string;
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
    navigation: {
      search: string;
    };
    newPage: string;
    addPage: string;
    addDevice: string;
    addResource: string;
    addEventTrigger: string;
    onProduction: string;
    properties: {
      title: string;
    };
    resources: {
      title: string;
      imageView: {
        properties: {
          imageUrl: string;
        };
      };
      textView: {
        properties: {
          text: string;
        };
      };
    };

    pageSettingsEditor: {
      pageLayoutLabel: string;
      pageDeviceLabel: string;
    };

    deviceSettingsEditor: {
      indexPageId: string;
    };

    eventTriggers: {
      title: string;
      clickViewIdTitle: string;
      clickViewId: string;
      physicalButtonDownTitle: string;
      physicalButtonUpTitle: string;
      physicalButton: string;
      delayTitle: string;
      delay: string;
      actions: string;
      variableName: string;
      variableValue: string;
      selectPage: string;
    };
    
    addDeviceEditor: {
      title: string;
      defaultName: string;
      nameLabel: string;
      deviceModelLabel: string;
      screenOrientationLabel: string;
      screenOrientationPortrait: string;
      screenOrientationLandscape: string;
      saveButton: string;
    };
    
  };

  layout: {
    title: string;
    toolbar: {
      visual: string;
      code: string;
      name: string;
    };
    settings: {
      deviceModelId: string;
      screenOrientation: string;
      portrait: string;
      landscape: string;
    };
    properties: {
      title: string;
    };
  };

  deviceTypes: {
    screen: string;
    projector: string;
  };

  sorting: {
    dashboard: {
      recent: {
        byModifiedAt: string;
        byCreatedAt: string;
      };
    };
  };

  filtering: {
    dashboard: {
      devices: {
        all: string;
      };
    };
  };

}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;