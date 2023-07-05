import { CSSProperties } from "@mui/material/styles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props {
  /*** Class name for rendered component */
  className?: string;
  /*** Style for rendered component */
  style?: CSSProperties;
  /*** Rendered component */
  component: (props: DebounceProps) => React.ReactNode;
  /** Key for rendered component */
  key?: string | number;
  /** Is component disabled or not */
  disabled?: boolean;
  /** Name for rendered component */
  name?: string;
  /** Label for rendered component */
  label?: string;
  /** Debounce timeout as milliseconds */
  debounceTimeout?: number;
  /** Value for rendered component */
  value: string | number;
  /** On change event handler to call with debounce */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Interface representing component state
 */
interface State {
  inputValue: string | number;
}

/**
 * Interface representing debounce properties given to render function
 */
interface DebounceProps {
  key?: string | number;
  disabled?: boolean;
  name?: string;
  label?: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Component for applying debounce to any text input
 */
class WithDebounce extends React.Component<Props, State> {
  /**
   * Debounce timer
   */
  private debounceTimer: NodeJS.Timeout | null = null;
  /**
   * Saved change event
   */
  private event?: React.ChangeEvent<HTMLInputElement>;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      inputValue: this.props.value || ""
    };
  }

  /**
   * Component did update life cycle method
   *
   * @param prevProps previous component properties
   */
  public componentDidUpdate = (prevProps: Props) => {
    const previousValue = prevProps.value;
    const currentValue = this.props.value;
    if (previousValue !== currentValue) {
      this.setState({ inputValue: currentValue });
    }
  };

  /**
   * Component render method
   */
  public render = () => {
    const { key, disabled, name, label, component, className, style } = this.props;

    const { inputValue } = this.state;

    return component({
      name: name,
      disabled: disabled,
      onChange: this.onChange,
      value: inputValue,
      className: className,
      key: key,
      label: label,
      style: style
    });
  };

  /**
   * Event handler for text field value change
   *
   * @param event react change event
   */
  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { debounceTimeout } = this.props;
    const value = event.target.value;

    if (!this.debounceTimer) {
      this.debounceTimer = setTimeout(() => {
        this.debouncedOnChange();
      }, debounceTimeout ?? 500);
    } else {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.debouncedOnChange();
      }, debounceTimeout ?? 500);
    }

    event.persist();
    this.event = event;
    this.setState({ inputValue: value });
  };

  /**
   * Update value with delay
   */
  private debouncedOnChange = () => {
    const { onChange } = this.props;
    onChange && this.event && onChange(this.event);
    this.event = undefined;
  };
}

export default WithDebounce;
