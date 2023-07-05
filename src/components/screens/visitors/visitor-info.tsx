import { Visitor } from "../../../generated/client";
import strings from "../../../localization/strings";
import WithDebounce from "../../generic/with-debounce";
import { Box, TextField } from "@mui/material";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props {
  visitor: Visitor;
  updateVisitor: (updatedVisitor: Visitor) => void;
}

/**
 * Component for visitor information
 *
 * @param props component props
 */
const VisitorInformation: React.FC<Props> = ({ visitor, updateVisitor }) => {
  /**
   * Event handler for contact info change
   *
   * @param event React change event
   */
  const onContactInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    name && updateVisitor({ ...visitor, [name]: value });
  };

  /**
   * Render contact information textfield with given parameter
   *
   * @param label text field label
   * @param name text field name
   * @param type text field type
   * @param value text field value
   */
  const renderContactInfoField = (
    label: string,
    name: string,
    type: string,
    value: string | number
  ) => {
    return (
      <Box mt={2}>
        <WithDebounce
          label={label}
          key={name}
          name={name}
          value={value}
          onChange={onContactInfoChange}
          component={(props) => <TextField type={type} {...props} />}
        />
      </Box>
    );
  };

  /**
   * Component render
   */
  return (
    <>
      {renderContactInfoField(
        strings.reception.visitor.firstName,
        "firstName",
        "text",
        visitor.firstName || ""
      )}
      {renderContactInfoField(
        strings.reception.visitor.lastName,
        "lastName",
        "text",
        visitor.lastName || ""
      )}
      {renderContactInfoField(
        strings.reception.visitor.email,
        "email",
        "text",
        visitor.email || ""
      )}
      {renderContactInfoField(
        strings.reception.visitor.number,
        "number",
        "text",
        visitor.phone || ""
      )}
      {renderContactInfoField(
        strings.reception.visitor.birthYear,
        "birthYear",
        "number",
        visitor.birthYear || 0
      )}
    </>
  );
};

export default VisitorInformation;
