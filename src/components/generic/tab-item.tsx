import * as React from "react";

import ReactHtmlParser from 'react-html-parser';

/**
 * Interface representing component properties
 */
interface Props {
  index: number;
  value: any;
  data: string;
  visible: boolean;
}

/**
 * Interface representing component state
 */
interface State {

}

/**
 * React component tab items
 */
export default class TabItem extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = { };
  }

  /**
   * Component render method
   * TODO: Implement page-preview components
   */
  public render = () => {
    const { data, value, index, visible } = this.props;
    const html = new DOMParser().parseFromString(data, "text/html");
    return (
      <div
        role="tabpanel"
        hidden={ value !== index }
        id={ `simple-tabpanel-${index}` }
        aria-labelledby={ `simple-tab-${index}` }
        style={{ display: visible ? "flex" : "none" }}
      >
        { value === index &&
          ReactHtmlParser(html.body.innerHTML)
        }
      </div>
    );
  }
}
