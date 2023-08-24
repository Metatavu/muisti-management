import { PageLayout } from "../../../generated/client";
import strings from "../../../localization/strings";
import { ActionButton, HtmlComponentType, TreeObject } from "../../../types";
import ElementSettingsPane from "../../layouts/element-settings-pane";
import ButtonComponentProperties from "./button-component-properties";
import GenericComponentProperties from "./generic-component-properties";
import ImageComponentProperties from "./image-component-properties";
import LayoutComponentProperties from "./layout-component-properties";
import TextComponentProperties from "./text-component-properties";
import VideoComponentProperties from "./video-component-properties";
import { Close as CloseIcon } from "@mui/icons-material";

/**
 * Components properties
 */
interface Props {
  component: TreeObject;
  layout: PageLayout;
  setLayout: (layout: PageLayout) => void;
  updateComponent: (component: TreeObject) => void;
  deleteComponent: (component: TreeObject) => void;
  onClose: () => void;
}

/**
 * Layout Right Panel component
 */
const LayoutRightPanel = ({
  component,
  layout,
  setLayout,
  updateComponent,
  deleteComponent,
  onClose
}: Props) => {
  /**
   * Gets panel menu options
   */
  const getPanelMenuOptions = (): ActionButton[] => [
    {
      name: strings.genericDialog.close,
      action: onClose
    },
    {
      name: strings.genericDialog.delete,
      action: () => deleteComponent(component)
    }
  ];

  /**
   * Renders component specific properties
   */
  const renderComponentSpecificProperties = () => {
    switch (component.type) {
      case HtmlComponentType.LAYOUT:
        return (
          <LayoutComponentProperties component={component} updateComponent={updateComponent} />
        );
      case HtmlComponentType.TEXT:
        return (
          <TextComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.BUTTON:
        return (
          <ButtonComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.IMAGE:
        return (
          <ImageComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.VIDEO:
        return (
          <VideoComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
    }
  };

  return (
    <ElementSettingsPane
      width={250}
      open={!!component}
      title={strings.layoutEditorV2.drawerTitle}
      actionIcon={<CloseIcon sx={{ color: "#2196F3" }} />}
      menuOptions={getPanelMenuOptions()}
    >
      <GenericComponentProperties component={component} updateComponent={updateComponent} />
      {renderComponentSpecificProperties()}
    </ElementSettingsPane>
  );
};

export default LayoutRightPanel;
