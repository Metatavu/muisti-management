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

  mediaLibrary: {
    title: string;
    selectMedia: string;
    selected: string;
    addMedia: string;
    addFolder: string;
    addFile: string;
    createFolder: string;
    search: string;
    files: {
      name: string;
      modified: string;
      type: string;
    };
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
    deleteExhibitionDialog: {
      title: string;
      description: string;
      deleteButton: string;
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
      delete: string;
      edit: string;
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
      spacesButton: string;
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
    deletePage: string;
    confirmDeletePage: string;
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
      mode: string;
      dynamic: {
        title: string;
        dataSource: string;
        key: string;
        when: string;
        addNewWhen: string;
        equals: string;
        value: string;
        default: string;
      };
      scripted: {
        title: string;
      };
      static: {
        title: string;
      };
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
    };

    deviceSettingsEditor: {
      indexPageId: string;
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
    addNew: string;
    confirmDelete: string;
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

  subLayout: {
    title: string;
    addNew: string;
    preview: {
      height: string;
      width: string;
    };
  };

  floorPlan: {
    title: string;
    listTitle: string;
    floor: {
      add: string;
      new: string;
      delete: string;
      edit: string;
      properties: string;
    };
    room: {
      add: string;
      new: string;
      delete: string;
      edit: string;
      properties: string;
      color: string;
    };
    deviceGroup: {
      add: string;
      new: string;
      delete: string;
      edit: string;
      properties: string;
    };
    device: {
      add: string;
      new: string;
      delete: string;
      edit: string;
      move: string;
      properties: string;
    };
    antenna: {
      add: string;
      new: string;
      newReaderId: string;
      delete: string;
      edit: string;
      move: string;
      properties: string;
    };
    structure: string;
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
      model: string;
      screenOrientation: string;
      landscape: string;
      portrait: string;
      allowVisitorSessionCreation: string;
      visitorSessionEndTimeout: string;
      visitorSessionStartThreshold: string;
      visitorSessionEndThreshold: string;
      name: string;
      readerId: string;
      deviceGroup: string;
      room: string;
      antennaNumber: string;
    };
    hasChildElements: string;
    brokenData: string;
  };

  device: {
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
        density: string;
        xdpi: string;
        ydpi: string;
      };
      dimensions: {
        physicalSize: string;
        width: string;
        height: string;
        depth: string;
        screenWidth: string;
        screenHeight: string;
      };
      type: string;
      orientation: string;
      defaultOrientation: string;
      landscape: string;
      portrait: string;
      touchscreen: string;
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
      name: string;
      layoutWidth: string;
      layoutHeight: string;
      elevation: string;
      elevationTooltip: string;
      backgroundColor: string;
      hasBackgroundImage: string;
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
      layoutGravityTooltip: string;
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
      backgroundColor: string;
      allCaps: string;
      gravity: string;
    };

    linearLayout: {
      orientation: string;
    };

    tab: {
      contentContainer: string;
      mode: {
        title: string;
        scrollable: string;
        fixed: string;
      };
      gravity: {
        title: string;
        center: string;
        fill: string;
      };
      selectedIndicatorColor: string;
      selectedIndicatorGravity: {
        title: string;
        bottom: string;
        center: string;
        top: string;
        stretch: string;
      };
      selectedIndicatorHeight: string;
      textColorNormal: string;
      textColorSelected: string;
      unboundedRipple: string;
      tabIndicatorFullWidth: string;
      data: string;
    }

    addLayoutViewDialog: {
      name: string;
      title: string;
      widget: string;
      confirm: string;
      cancel: string;
      subLayout: string;
      or: string;
    };
  };

  contentVersion: {
    add: string;
    addDialogTitle: string;
    name: string;
    language: string;
    rooms: string;
    deleteTitle: string;
    deleteText: string;
  };

  groupContentVersion: {
    add: string;
    addDialogTitle: string;
    name: string;
    deviceGroup: string;
    status: string;
    deleteTitle: string;
    deleteText: string;
  };

  contentEditor: {
    open: string;
    editor: {
      pageName: string;
      indexPageId: string;
      device: string;
      saveDevice: string;
      savePage: string;
      layout: string;
      content: string;
      properties: string;
      resources: string;
      transitions: {
        title: string;
        enterTransitions: string;
        exitTransitions: string;
        addTransition: string;
        editTransition: string;
        removeTransition: string;
      };
      eventTriggers: {
        noTriggers: string;
        noWebViews: string;
        add: string;
        addEvent: string;
        title: string;
        name: string;
        options: string;
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
        actionTypes: {
          hide: string;
          show: string;
          setuservalue: string;
          navigate: string;
          setsrc: string;
          settext: string;
          triggerdevicegroupevent: string;
          executeWebScript: string;
          visitorSessionEnd: string;
        };
        variableName: string;
        variableValue: string;
        selectPage: string;
      };
      tabs: {
        title: string;
        noTabs: string;
        add: string;
        label: string;
        properties: string;
        resources: string;
        edit: string;
        contentType: string;
        textContentHelp: string;
      };
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
  };

  genericDialog: {
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    add: string;
  };

  generic: {
    add: string;
    save: string;
    cancel: string;
    delete: string;
    loadNew: string;
    name: string;
    confirmDelete: string;
    or: string;
    undefined: string;
    refresh: string;
    unsaved: string;
  };

  spaces: {
    title: string;
  };

  reception: {
    title: string;
    registerNewVisitor: string;
    language: string;
    selectLanguageTitle: string;
    selectLanguage: string;
    checkEmail: string;
    registerTag: string;
    visitor: {
      visitorInfoFormTitle: string;
      tag: string;
      firstName: string;
      lastName: string;
      email: string;
      number: string;
      birthYear: string;
    };
    saveEmail: string;
    saveVisitor: string;
    confirmation: string;
    return: string;
    errorMessages: {
      required: string;
      email: string;
      number: string;
      minLength: string;
    };
  };

  visitorVariables: {
    title: string;
    saveButton: string;
    newButton: string;
    nameLabel: string;
    typeLabel: string;
    enumValuesLabel: string;
    typeBoolean: string;
    typeNumber: string;
    typeText: string;
    typeEnumerated: string;
    newVariableName: string;
    deleteConfirmTitle: string;
    deleteConfirmText: string;
    addEnumValue: string;
  };

}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;