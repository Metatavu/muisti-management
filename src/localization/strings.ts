import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

/**
 * Interface describing localized strings
 */
export interface IStrings extends LocalizedStringsMethods {
  comingSoon: string;
  removeSelection: string;

  fileUpload: {
    upload: string;
    cancel: string;
  };

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
    inProduction: string;
    inDraft: string;
    status: {
      ready: string;
    };
    cardMenu: {
      addExhibition: string;
      moveToProduction: string;
      moveToDraft: string;
      setStatus: string;
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

  header: {
    navigation: {
      exhibitionsButton: string;
      usersButton: string;
      devicesButton: string;
      layoutsButton: string;
      floorPlansButton: string;
    };
    tabs: {
      floorPlanTab: string;
      exhibitionContentsTab: string;
    };
  };

  dashboard: {
    newExhibitionButton: string;
    newContentVersionButton: string;
    navigation: {
      overviewButton: string;
      recentButton: string;
      draftsButton: string;
      archivedButton: string;
      settingsButton: string;
      usersButton: string;
      devicesButton: string;
      layoutsButton: string;
      floorPlansButton: string;
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
    floorPlans: {
      title: string;
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
    eventTrigger: string;
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
      mediaView: {
        properties: {
          imageOrVideoUrl: string;
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
      enterTransitions: string;
      exitTransitions: string;
      addTransition: string;
      editTransition: string;
      removeTransition: string;

      dialog: {
        animation: string;
        timeInterpolation: string;
        duration: string;
        viewPairs: string;
        addViewPair: string;
        startOfTransition: string;
        endOfTransition: string;
      };
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
      deviceGroupEventTitle: string;
      deviceGroupEvent: string;
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

  floorPlan: {
    title: string;
    toolbar: {
      save: string;
      upload: string;
    };
    properties: {
      title: string;
      imageHeight: string;
      imageWidth: string;
      physicalWidth: string;
      physicalHeight: string;
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

  map: {
    properties: {
      roomName: string;
      dialogTitle: string;
    };
  };

  layoutEditor: {
    commonComponents: {
      id: string;
      layoutWidth: string;
      layoutHeight: string;
      backgroundColor: string;
      paddings: {
        title: string;
        left: string;
        right: string;
        top: string;
        bottom: string;
        link: string;
      };
      margins: {
        title: string;
        left: string;
        right: string;
        top: string;
        bottom: string;
        link: string;
      };
      layoutGravity: string;
      layoutAlign: string;
    };

    textView: {
      width: string;
      height: string;
      color: string;
      textResource: string;
      fontStyle: string;
      textAlign: string;
      textGravity: string;
      textSize: string;
      typeface: string;
    };

    imageView: {
      src: string;
    };

    button: {
      width: string;
      height: string;
      color: string;
      textResource: string;
      fontStyle: string;
      textSize: string;
    };

    linearLayout: {
      orientation: string;
    };

    addLayoutViewDialog: {
      title: string;
      id: string;
      widget: string;
      confirm: string;
      cancel: string;
    };

  };

  groupContentVersion: {
    add: string;
    addDialogTitle: string;
    name: string;
    deviceGroup: string;
    status: string;
  };

  genericDialog: {
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    add: string;
  };

  generic: {
    save: string;
  };


}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;