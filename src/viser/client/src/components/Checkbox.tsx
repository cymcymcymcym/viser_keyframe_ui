import * as React from "react";
import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { GuiCheckboxMessage } from "../WebsocketMessages";
import { Box, Checkbox, Tooltip } from "@mantine/core";

export default function CheckboxComponent({
  uuid,
  value,
  props: { disabled, visible, hint, label },
}: GuiCheckboxMessage) {
  const { setValue } = React.useContext(GuiComponentContext)!;
  if (!visible) return null;
  let input = (
    <Checkbox
      id={uuid}
      label={label}
      checked={value}
      size="xs"
      styles={{
        root: { width: "100%" },
        label: {
          whiteSpace: "nowrap",
          lineHeight: "1.375em",
          letterSpacing: "-0.75px",
        },
      }}
      onChange={(value) => {
        setValue(uuid, value.target.checked);
      }}
      disabled={disabled}
    />
  );
  if (hint !== null && hint !== undefined) {
    // For checkboxes, we want to make sure that the wrapper
    // doesn't expand to the full wuuidth of the parent. This will
    // de-center the tooltip.
    input = (
      <Tooltip
        zIndex={100}
        label={hint}
        multiline
        style={{ width: "15rem" }}
        withArrow
        openDelay={500}
        withinPortal
      >
        <Box style={{ display: "inline-block" }}>{input}</Box>
      </Tooltip>
    );
  }
  return (
    <Box pb="0.5em" px="xs">
      {input}
    </Box>
  );
}
