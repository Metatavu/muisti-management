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
    delete: {
      deleteTitle: string;
      deleteText: string;
      contentTitle: string;
    };
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
    visitors: string;
    reception: string;
    visitorVariables: string;
    resetVisitorVariables: string;
    exhibitionManagement: string;
    content: string;
    tech: string;
    navigation: {
      search: string;
    };
    addLanguageVersion: string;
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
    layoutStructure: string;
    title: string;
    addNew: string;
    makeAsSubLayout: string;
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
    delete: {
      deleteTitle: string;
      deleteText: string;
      contentTitle: string;
    };
    editor: {
      delete: {
        deleteTitle: string;
        deleteText: string;
      };
    };
  };

  subLayout: {
    title: string;
    name: string;
    description: string;
    addNew: string;
    preview: {
      height: string;
      width: string;
    };
    delete: {
      deleteTitle: string;
      deleteText: string;
    };
    editor: {
      delete: {
        deleteTitle: string;
        deleteText: string;
      };
    };
  };

  floorPlan: {
    title: string;
    listTitle: string;
    exhibitions: string;
    exhibitionsDescription: string;
    delete: {
      floor: {
        deleteTitle: string;
        deleteText: string;
        contentTitle: string;
      };
      room: {
        deleteTitle: string;
        deleteText: string;
        contentTitle: string;
      };
      deviceGroup: {
        deleteTitle: string;
        deleteText: string;
        contentTitle: string;
      };
      device: {
        deleteTitle: string;
        deleteText: string;
        contentTitle: string;
      };
      antenna: {
        deleteTitle: string;
        deleteText: string;
      };
    };
    floor: {
      add: string;
      new: string;
      edit: string;
      properties: string;
    };
    room: {
      add: string;
      new: string;
      edit: string;
      properties: string;
      color: string;
    };
    deviceGroup: {
      add: string;
      new: string;
      edit: string;
      properties: string;
      copy: string;
    };
    device: {
      add: string;
      new: string;
      edit: string;
      move: string;
      properties: string;
    };
    antenna: {
      add: string;
      new: string;
      newReaderId: string;
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
      forcedPortrait: string;
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
    delete: {
      deleteTitle: string;
      deleteText: string;
      contentTitle: string;
    };
    dialog: {
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

    playerView: {
      src: string;
      autoPlay: string;
      autoPlayDelay: string;
      showPlaybackControls: string;
      showRewindButton: string;
      showFastForwardButton: string;
      showPreviousButton: string;
      showNextButton: string;
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
    addDialogDescription: string;
    name: string;
    language: string;
    rooms: string;
    room: string;
    delete: {
      deleteTitle: string;
      deleteText: string;
      contentTitle: string;
    };
    contentMaterials: string;
    nameAlreadyTaken: string;
    nameIsMandatory: string;
    contentIsActiveWhen: string;
    userVariable: string;
    equals: string;
  };

  groupContentVersion: {
    title: string;
    add: string;
    addDialogTitle: string;
    addDialogDescription: string;
    name: string;
    deviceGroup: string;
    status: string;
    delete: {
      deleteTitle: string;
      deleteText: string;
    };
  };

  contentEditor: {
    advanced: string;
    open: string;
    preview: {
      resourceModePreview: {
        dynamic: string;
        scripted: string;
      };
    };
    editor: {
      editorTabs: {
        noVisitor: string;
        visitorPresent: string;
      };
      addLanguageDialog: {
        title: string;
        language: string;
      };
      pageName: string;
      indexPageId: string;
      device: string;
      saveDevice: string;
      savePage: string;
      layout: string;
      content: string;
      properties: string;
      resources: string;
      resource: string;
      resourceProperties: string;
      transitions: {
        title: string;
        enterTransitions: string;
        enterTransitionsDescription: string;
        exitTransitions: string;
        exitTransitionsDescription: string;
        addTransition: string;
        editTransition: string;
        removeTransition: string;
      };
      eventTriggers: {
        eventName: string;
        noTriggers: string;
        noWebViews: string;
        add: string;
        addEvent: string;
        title: string;
        name: string;
        options: string;
        optionsInstructions: string;
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
          startVisitorSession: string;
        };
        variableName: string;
        variableValue: string;
        variableBooleanTrue: string;
        variableBooleanFalse: string;
        selectPage: string;
        selectLanguage: string;
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
        animationHelperText: string;
        timeInterpolation: string;
        timeInterpolationHelpertext: string;
        duration: string;
        viewPairs: string;
        addViewPair: string;
        startOfTransition: string;
        endOfTransition: string;
        interpolations: {
          accelerateDecelerate: string;
          accelerate: string;
          anticipate: string;
          decelerate: string;
          linear: string;
        };
      };
    };
    delete: {
      deleteTitle: string;
      deleteText: string;
    };
  };

  genericDialog: {
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    add: string;
    close: string;
  };

  generic: {
    add: string;
    save: string;
    cancel: string;
    clear: string;
    delete: string;
    loadNew: string;
    name: string;
    confirmDelete: string;
    or: string;
    undefined: string;
    refresh: string;
    unsaved: string;
    properties: string;
    noSelection: string;
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
    valuesTitle: string;
    isEditableFromUi: string;
    booleanValues: {
      true: string;
      false: string;
    };
  };

  manageVisitorSessionVariables: {
    title: string;
    value: string;
    noActiveSessionsFound: string;
    noVariables: string;
    lastModifiedAt: string;
    saveButton: string;
    emptyButton: string;
    confirmEmptyTitle: string;
    confirmEmptyText: string;
    errorMessages: {
      sessionNotFound: string;
    };
    delete: {
      deleteTitle: string;
      deleteText: string;
    }
  };

  /**
   * Visitor management screen related translations
   */
  visitorsManagement: {
    title: string;
    startSession: string;
    startNewSession: string;
    editSession: string;
    fillWithAnonymousData: string;
    tickets: string;
    tag: string;
    ticketContactInformation: string;
    activeVisitorSessions: string;
    visitor: string;
    visitors: string;
    search: string;
    placeTagToReader: string;
    scanRFID: string;
    scanTicketsHelp: string;
    sessionDuration: string;
    selection: string;
    value: string;
  }

  /**
   * Content specific delete messages
   */
  deleteContent: {
    rooms: string;
    deviceGroups: string;
    devices: string;
    antennas: string;
    pages: string;
    groupContentVersions: string;
    exhibitions: string;
    layouts: string;
    contentVersions: string;
    floors: string;
    visitors: string;
    visitorSessions: string;
    visitorVariables: string;
  };

  /**
   * UI help texts
   */
  helpTexts: {
    visitorVariables: {
      visitorVariablesDescription: string;
    };
    groupContentVersions: {
      selectDeviceGroupDescription: string;
    };
    layoutEditor: {
      selectDevice: string;
      selectOrientation: string;
      giveElementName: string;
      buttonDescription: string;
      textViewDescription: string;
      flowTextViewDescription: string;
      imageViewDescription: string;
      mediaViewDescription: string;
      playerViewDescrption: string;
      linearLayoutDescription: string;
      relativeLayoutDescription: string;
      frameLayoutDescription: string;
      mapViewDescription: string;
      materialTabViewDescription: string;
      visitorsViewDescription: string;
      webViewDescription: string;
    };
    contentManager: {
      animationInterpolations: {
        accelerateDecelerate: string;
        accelerate: string;
        anticipate: string;
        anticipateOvershoot: string;
        bounce: string;
        decelerate: string;
        linear: string;
        overshoot: string;
        notSupported: string;
      };
    };
  };

  /**
   * Help dialog contents
   */
  helpDialogs: {
    contentEditor: {
      resources: {
        staticDescription: string;
        dynamicDescription: string;
        programmedDescrption: string;
      };
      events: {
        nameDescription: string;
        physicalButtonUpDescription: string;
        physicalButtonDownDescription: string;
        deviceGroupEventDescription: string;
        delayEventDescription: string;
      };
      variables: {
        variableNameDescription: string;
        variableValueDescription: string;
        setUserValueDescription: string;
        navigateDescription: string;
        executeWebScriptDescription: string;
      }
    };
    floorPlanEditor: {
      groupAssemblyPointDescription: string;
      visitorSessionTimeoutDescription: string;
      visitorSessionTimeoutAdditionalDescription: string;
      visitorSessionStartThresholdDescription: string;
      visitorSessionEndThresholdDescription: string;
      antennaReaderIdDescription: string;
      antennaPortNumberDescription: string;
    };
    layoutEditor: {
      commonProperties: {
        name: string;
        layoutWidth: {
          introduction: string;
          matchParentDescription: string;
          wrapContentDescription: string;
          additionalNotes: string;
        };
        layoutHeight: {
          introduction: string;
          matchParentDescription: string;
          wrapContentDescription: string;
          additionalNotes: string;
        };
        elevation: {
          introduction: string;
          description: string;
          readMore: string;
          link: string;
        };
        backgroundColor: string;
        backgroundImage: string;
        padding: string;
        margin: string;
        gravity: {
          description: string;
          note: string;
        };
      };
      linearLayout: {
        introduction: string;
        verticalDescription: string;
        horizontalDescription: string;
      };
      button: {
        width: string;
        height: string;
        text: string;
        color: string;
        style: string;
        capitalize: string;
        textSize: {
          description: string;
          note: string;
        };
        gravity: {
          description: string;
          note: string;
        };
      };
    };
  };
};

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;