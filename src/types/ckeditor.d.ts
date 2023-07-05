/**
 * Custom CKEditor module declaration.
 */
declare module "ckeditor4-react" {
  import * as React from "react";

  /**
   * Custom CKEditor properties interface
   */
  export interface CKEditorProps {
    data: string;
    config: any;
    onChange: (event: any) => void;
    type: string;
    readOnly: boolean;
  }

  export default class CKEditor extends React.Component<CKEditorProps, any> {}
}
