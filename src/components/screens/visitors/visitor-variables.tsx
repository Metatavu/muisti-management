import { VisitorSession, VisitorVariable, VisitorVariableType } from "../../../generated/client";
import strings from "../../../localization/strings";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import produce from "immer";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props {
  visitorVariables: VisitorVariable[];
  visitorSession: VisitorSession;
  onSessionUpdate: (updatedSession: VisitorSession) => void;
}

/**
 * Component for visitor variables
 *
 * @param props component props
 */
const VisitorVariables: React.FC<Props> = ({
  visitorVariables,
  visitorSession,
  onSessionUpdate
}) => {
  /**
   * Event handler for variable value change
   *
   * @param event React change event
   */
  const onVariableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    if (!name) {
      return;
    }

    const index = visitorSession.variables?.findIndex((variable) => variable.name === name);
    const updatedVariableList = produce(visitorSession.variables || [], (draft) => {
      if (index === undefined || index === -1) {
        draft.push({ name, value });
      } else {
        draft.splice(index, 1, { name, value });
      }
    });

    onSessionUpdate({ ...visitorSession, variables: updatedVariableList });
  };

  /**
   * Render visitor session variables
   */
  const renderSessionVariables = () => {
    const variables = visitorVariables
      .filter((_variable) => _variable.editableFromUI)
      .map((variable) => {
        switch (variable.type) {
          case VisitorVariableType.Enumerated:
          case VisitorVariableType.Boolean:
            return renderInput(variable, true);
          default:
            return renderInput(variable);
        }
      });

    return (
      <Box p={2}>
        <Typography variant="h3">{strings.visitorVariables.title}</Typography>
        {variables}
      </Box>
    );
  };

  /**
   * Render visitor session variable input
   *
   * @param variable visitor variable
   * @param select should TextField be select or not
   */
  const renderInput = (variable: VisitorVariable, select?: boolean) => {
    const value = visitorSession.variables?.find((_variable) => _variable.name === variable.name);

    return (
      <Box key={variable.name} mt={2} display="flex" justifyContent="center" alignItems="center">
        <TextField
          select={select}
          label={variable.name}
          name={variable.name}
          onChange={onVariableChange}
          value={value?.value || ""}
        >
          {renderItemsBasedOnVariableType(variable)}
        </TextField>
      </Box>
    );
  };

  /**
   * Renders menu items based on variable type
   *
   * @param variable variable
   */
  const renderItemsBasedOnVariableType = (variable: VisitorVariable) => {
    return (
      {
        [VisitorVariableType.Enumerated]: renderEnumValues(variable),
        [VisitorVariableType.Boolean]: renderBooleanValues(),
        [VisitorVariableType.Number]: null,
        [VisitorVariableType.Text]: null
      }[variable.type] ?? null
    );
  };

  /**
   * Renders possible enum menu items for select
   *
   * @param variable variable
   */
  const renderEnumValues = (variable: VisitorVariable) => {
    return (variable._enum || []).map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ));
  };

  /**
   * Renders boolean menu items for select
   */
  const renderBooleanValues = () => {
    return [
      <MenuItem key="true" value="true">
        {strings.visitorVariables.booleanValues.true}
      </MenuItem>,
      <MenuItem key="false" value="false">
        {strings.visitorVariables.booleanValues.false}
      </MenuItem>
    ];
  };

  /**
   * Component render
   */
  return renderSessionVariables();
};

export default VisitorVariables;
