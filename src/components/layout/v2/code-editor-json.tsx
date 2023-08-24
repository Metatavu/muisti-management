import strings from "../../../localization/strings";
import { json } from "@codemirror/lang-json";
import { Typography, styled } from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";

/**
 * Components properties
 */
interface Props {
  jsonString: string;
  onCodeChange: (value: string) => void;
}

/**
 * Preview Container styled component
 */
const CodeEditorContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minHeight: "100%",
  position: "relative",
  backgroundColor: "#EFF0F1"
}));

/**
 * Code Editor JSON component
 */
const CodeEditorJSON = ({ jsonString, onCodeChange }: Props) => {
  return (
    <CodeEditorContainer>
      <Typography style={{ margin: 8 }}>{strings.exhibitionLayouts.editView.json}</Typography>
      <CodeMirror
        value={jsonString ? JSON.stringify(JSON.parse(jsonString), null, 2) : ""}
        height="500px"
        style={{ overflow: "auto" }}
        extensions={[json()]}
        onChange={onCodeChange}
      />
    </CodeEditorContainer>
  );
};

export default CodeEditorJSON;
