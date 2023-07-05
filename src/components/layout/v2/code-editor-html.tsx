import strings from "../../../localization/strings";
import { html } from "@codemirror/lang-html";
import { Typography, styled } from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { html_beautify } from "js-beautify";

/**
 * Components properties
 */
interface Props {
  htmlString: string;
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
 * Code Editor HTML component
 */
const CodeEditorHTML = ({ htmlString, onCodeChange }: Props) => {
  const htmlBeautifyOptions: js_beautify.HTMLBeautifyOptions = {
    indent_size: 2,
    inline: [],
    indent_empty_lines: true,
    end_with_newline: false
  };

  return (
    <CodeEditorContainer>
      <Typography style={{ margin: 8 }}>{strings.exhibitionLayouts.editView.html}</Typography>
      <CodeMirror
        value={html_beautify(htmlString, htmlBeautifyOptions)}
        height="500px"
        style={{ overflow: "auto" }}
        extensions={[html()]}
        onChange={onCodeChange}
      />
    </CodeEditorContainer>
  );
};

export default CodeEditorHTML;
