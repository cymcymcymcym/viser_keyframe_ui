import React from "react";
import { Box, Flex, SegmentedControl, Stack } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";

import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { GuiColumnsMessage } from "../WebsocketMessages";
import {
  COLUMN_GAP_PX,
  DEFAULT_FIRST_COLUMN_WIDTH_PX,
  DEFAULT_JOINT_COLUMN_WIDTH_PX,
  FIRST_COLUMN_MIN_RATIO,
  JOINT_COLUMN_MIN_WIDTH_PX,
} from "../layoutConstants";

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

  const columnCount = columnIds.length;
  const jointColumnCount = Math.max(columnCount - 1, 0);
  const totalGapWidth = COLUMN_GAP_PX * Math.max(columnIds.length - 1, 0);
  const firstColumnMinWidthPx =
    DEFAULT_FIRST_COLUMN_WIDTH_PX * FIRST_COLUMN_MIN_RATIO;
  const inlineThreshold =
    (columnCount > 0 ? firstColumnMinWidthPx : 0) +
    jointColumnCount * JOINT_COLUMN_MIN_WIDTH_PX +
    totalGapWidth;
  const shouldCollapse =
    availableWidth !== undefined && availableWidth < inlineThreshold;

  const fixedWidths = React.useMemo(() => {
    if (
      shouldCollapse ||
      availableWidth === undefined ||
      columnIds.length === 0
    ) {
      return null;
    }

    const count = columnIds.length;
    const jointCount = Math.max(count - 1, 0);
    const gapWidth = COLUMN_GAP_PX * Math.max(count - 1, 0);
    const widthBudget = availableWidth - gapWidth;
    if (widthBudget <= 0) {
      return null;
    }

    const widths = new Array<number>(count);
    let firstWidth = DEFAULT_FIRST_COLUMN_WIDTH_PX;
    const jointWidths = Array.from(
      { length: jointCount },
      () => DEFAULT_JOINT_COLUMN_WIDTH_PX,
    );
    const baseTotal =
      firstWidth + jointWidths.reduce((acc, width) => acc + width, 0);

    if (baseTotal <= 0) {
      return null;
    }

    if (widthBudget >= baseTotal) {
      const scale = widthBudget / baseTotal;
      firstWidth *= scale;
      for (let idx = 0; idx < jointWidths.length; idx += 1) {
        jointWidths[idx] *= scale;
      }
    } else {
      let deficit = baseTotal - widthBudget;
      const jointMins = jointWidths.map((width) =>
        Math.min(width, JOINT_COLUMN_MIN_WIDTH_PX),
      );
      if (deficit > 0 && jointCount > 0) {
        const jointCapacity = jointWidths.reduce(
          (acc, width, idx) =>
            acc + Math.max(width - jointMins[idx], 0),
          0,
        );
        const jointShrink = Math.min(deficit, jointCapacity);
        if (jointShrink > 0) {
          let remaining = jointShrink;
          let jointsRemaining = jointCount;
          for (let idx = 0; idx < jointCount; idx += 1) {
            if (remaining <= 0) {
              break;
            }
            const minWidth = jointMins[idx];
            const currentWidth = jointWidths[idx];
            const available = Math.max(currentWidth - minWidth, 0);
            const share = Math.min(
              available,
              remaining / Math.max(jointsRemaining, 1),
            );
            jointWidths[idx] = currentWidth - share;
            remaining -= share;
            jointsRemaining -= 1;
          }
          deficit -= jointShrink;
        }
      }

      if (deficit > 0) {
        const firstMinWidth = firstWidth * FIRST_COLUMN_MIN_RATIO;
        const firstShrink = Math.min(
          deficit,
          Math.max(firstWidth - firstMinWidth, 0),
        );
        if (firstShrink > 0) {
          firstWidth -= firstShrink;
          deficit -= firstShrink;
        }
      }
    }

    widths[0] = firstWidth;
    for (let idx = 0; idx < jointCount; idx += 1) {
      widths[idx + 1] = jointWidths[idx];
    }

    const totalWidth = widths.reduce((acc, width) => acc + width, 0);
    const remaining = widthBudget - totalWidth;
    if (Math.abs(remaining) > 1e-3 && count > 0) {
      widths[count - 1] = Math.max(widths[count - 1] + remaining, 0);
    }

    return widths;
  }, [
    shouldCollapse,
    availableWidth,
    columnIds,
    normalizedWidths,
  ]);

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
          {columnIds.map((containerId, idx) => {
            const minWidth =
              idx === 0 ? firstColumnMinWidthPx : JOINT_COLUMN_MIN_WIDTH_PX;
            const fixedWidth = fixedWidths?.[idx];

            const style = fixedWidth
              ? {
                  flex: `0 0 ${fixedWidth}px`,
                  width: `${fixedWidth}px`,
                  minWidth: `${minWidth}px`,
                }
              : {
                  flexGrow: normalizedWidths[idx],
                  flexShrink: idx === 0 ? 0 : 1,
                  flexBasis: 0,
                  minWidth: `${minWidth}px`,
                };

            return (
              <Box key={containerId} style={style}>
                <GuiContainer containerUuid={containerId} />
              </Box>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}

