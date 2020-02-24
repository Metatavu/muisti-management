import * as React from "react";

import { Typography, Card, CardMedia, withStyles, WithStyles, CardActionArea } from "@material-ui/core";
import styles from "../../styles/exhibitions-view";

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
  image?: string,

  /**
   * Card icon
   */
  icon?: JSX.Element,

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
    const { classes } = this.props;

    return (
      <div className={ classes.cardItem } onClick={ this.props.onClick }>
        <Card elevation={10} variant="outlined" className={ classes.card }>
          <div className={ classes.imageContainer }>
            { this.renderImage() }
          </div>
        </Card>

        <Typography variant="subtitle1" className={ classes.cardTitle }>
          { this.props.title }
        </Typography>
      </div>
    );
  }

  /**
   * Renders card image
   */
  private renderImage = () => {
    const { classes } = this.props;

    if (this.props.icon) {
      return (
        <CardMedia className={ classes.media }>
          { this.props.icon }
        </CardMedia>
      )
    }

    if (this.props.image) {
      return ( 
        <CardMedia className={ classes.media } image={ this.props.image }></CardMedia>
      )
    }

    return null;
  }
}

export default withStyles(styles)(CardItem);