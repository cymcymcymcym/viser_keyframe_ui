import React from "react";
import { Box, Flex, SegmentedControl, Stack } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";

import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { GuiColumnsMessage } from "../WebsocketMessages";

function normalizeWidths(length: number, widths: number[] | null): number[] {
  if (!widths || widths.length !== length) {
    return Array.from({ length }, () => 1 / Math.max(length, 1));
  }
  const sanitized = widths.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const total = sanitized.reduce((acc, value) => acc + value, 0);
  if (total <= 0) {
    return Array.from({ length }, () => 1 / Math.max(length, 1));
  }
  return sanitized.map((value) => value / total);
}

const MIN_COLUMN_WIDTH_PX = 260;
const COLUMN_GAP_PX = 12;

export default function ColumnsComponent(conf: GuiColumnsMessage) {
  const { GuiContainer } = React.useContext(GuiComponentContext)!;
  const columnIds = conf.props._column_container_ids;
  const visible = conf.props.visible;

  const normalizedWidths = React.useMemo(
    () => normalizeWidths(columnIds.length, conf.props.column_widths),
    [columnIds.length, conf.props.column_widths],
  );

  const [activeColumn, setActiveColumn] = React.useState(0);
  const [containerRef, rect] = useResizeObserver();
  const availableWidth = rect.width;

  if (columnIds.length === 0) {
    return null;
  }

  const inlineThreshold =
    columnIds.length * MIN_COLUMN_WIDTH_PX +
    COLUMN_GAP_PX * Math.max(columnIds.length - 1, 0);
  const shouldCollapse =
    availableWidth !== undefined && availableWidth < inlineThreshold;

  React.useEffect(() => {
    if (activeColumn >= columnIds.length) {
      setActiveColumn(0);
    }
  }, [activeColumn, columnIds.length]);

  const columnLabels = React.useMemo(
    () =>
      columnIds.map((_, idx) => `Column ${idx + 1}`),
    [columnIds],
  );

  return (
    <Box
      ref={containerRef}
      style={{
        display: visible ? undefined : "none",
        width: "100%",
      }}
    >
      {shouldCollapse ? (
        <Stack gap="sm">
          <SegmentedControl
            fullWidth
            value={String(activeColumn)}
            onChange={(value) => setActiveColumn(Number(value))}
            data={columnLabels.map((label, idx) => ({
              value: String(idx),
              label,
            }))}
          />
          <Box>
            <GuiContainer containerUuid={columnIds[activeColumn]} />
          </Box>
        </Stack>
      ) : (
        <Flex
          gap={`${COLUMN_GAP_PX}px`}
          align="flex-start"
          wrap="nowrap"
          style={{
            width: "100%",
          }}
        >
          {columnIds.map((containerId, idx) => (
            <Box
              key={containerId}
              style={{
                flexGrow: normalizedWidths[idx],
                flexShrink: 1,
                flexBasis: 0,
                minWidth: MIN_COLUMN_WIDTH_PX,
              }}
            >
              <GuiContainer containerUuid={containerId} />
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}

