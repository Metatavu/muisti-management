import * as React from "react";

import { Box } from "@material-ui/core";
import ReactHtmlParser, { processNodes, convertNodeToElement } from 'react-html-parser';
import htmlparser2 from "../../../node_modules/@types/react-html-parser";

/**
 * Interface representing component properties
 */
interface Props {
  index: number;
  value: any;
  data: string;
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
   */
  public render = () => {
    const { data, value, index } = this.props;
    const test = new DOMParser().parseFromString(data, "text/html");
    return (
      <div
        role="tabpanel"
        hidden={ value !== index }
        id={ `simple-tabpanel-${index}` }
        aria-labelledby={ `simple-tab-${index}` }
      >
        { value === index && 
          ReactHtmlParser(test.body.innerHTML)
        }
      </div>
    );
  }
}
