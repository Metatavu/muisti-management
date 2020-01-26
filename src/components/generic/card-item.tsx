import * as React from "react";
import { Typography, Card, CardMedia, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import styles from "../../styles/card-item";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  
  /**
   * Card title
   */
  title: string,

  /**
   * Card image
   */
  img: string,

  /**
   * Handler for card click
   */
  onClick: () => void
}

/**
 * Component state
 */
interface State {

}

/**
 * Generic card item component
 */
class CardItem extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      title: "",
      img: "",
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <div>
        <Card elevation={10} variant="outlined">
          <CardActionArea onClick={ this.props.onClick }>
            <CardMedia image={ this.props.img }></CardMedia>
            <div>
              <Typography variant="h3">
                { this.props.title }
              </Typography>
            </div>
          </CardActionArea>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(CardItem);