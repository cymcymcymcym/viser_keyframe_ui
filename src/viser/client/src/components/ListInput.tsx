import * as React from "react";
import { Box, Text, TextInput, Tooltip } from "@mantine/core";
import { GuiListMessage } from "../WebsocketMessages";
import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";

type ListEventPayload = {
  event: "select" | "rename" | "reorder";
  selected_index: number;
  index: number | null;
  text: string | null;
  src_index: number | null;
  dst_index: number | null;
};

function extractInlineEditValue(item: string) {
  const tMatch = item.match(
    /(?:^|\|)\s*t\s*=\s*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/i,
  );
  if (tMatch !== null) {
    return tMatch[1] ?? "";
  }
  return item;
}

function coerceSelectedIndex(raw: unknown, itemCount: number) {
  if (itemCount <= 0) return -1;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return -1;
  const clamped = Math.max(-1, Math.min(itemCount - 1, Math.floor(raw)));
  return clamped;
}

export default function ListInputComponent({
  uuid,
  value,
  props: {
    hint,
    visible,
    disabled,
    items,
    allow_rename,
    allow_reorder,
    max_visible_rows,
  },
}: GuiListMessage) {
  const { setValue } = React.useContext(GuiComponentContext)!;
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  const selectedIndex = coerceSelectedIndex(
    value?.selected_index,
    items.length,
  );
  const rowHeight = 30;
  const visibleRows = Math.max(1, max_visible_rows);

  const emitEvent = React.useCallback(
    (payload: ListEventPayload) => {
      setValue(uuid, payload);
    },
    [setValue, uuid],
  );

  React.useEffect(() => {
    if (!allow_rename || disabled) {
      setEditingIndex(null);
      return;
    }
    if (
      editingIndex !== null &&
      (editingIndex < 0 || editingIndex >= items.length)
    ) {
      setEditingIndex(null);
    }
  }, [allow_rename, disabled, editingIndex, items.length]);

  if (!visible) return null;

  let content = (
    <Box
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid var(--mantine-color-gray-3)",
        borderRadius: "0.35rem",
        maxHeight: `${visibleRows * rowHeight}px`,
        overflowY: "auto",
        background: "var(--mantine-color-gray-0)",
      }}
    >
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        const isEditing = index === editingIndex;
        const isDropTarget =
          allow_reorder && draggingIndex !== null && index === dropIndex;

        return (
          <Box
            key={`${item}-${index}`}
            draggable={allow_reorder && !disabled && !isEditing}
            onClick={() => {
              emitEvent({
                event: "select",
                selected_index: index,
                index,
                text: null,
                src_index: null,
                dst_index: null,
              });
            }}
            onDoubleClick={() => {
              if (allow_rename && !disabled) {
                setEditingIndex(index);
                setEditingText(extractInlineEditValue(item));
              }
            }}
            onDragStart={() => {
              if (!allow_reorder || disabled) return;
              setDraggingIndex(index);
              setDropIndex(index);
            }}
            onDragEnter={() => {
              if (!allow_reorder || disabled || draggingIndex === null) return;
              setDropIndex(index);
            }}
            onDragOver={(event) => {
              if (!allow_reorder || disabled || draggingIndex === null) return;
              event.preventDefault();
            }}
            onDragEnd={() => {
              setDraggingIndex(null);
              setDropIndex(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!allow_reorder || disabled || draggingIndex === null) return;
              if (draggingIndex !== index) {
                emitEvent({
                  event: "reorder",
                  selected_index: index,
                  index,
                  text: null,
                  src_index: draggingIndex,
                  dst_index: index,
                });
              }
              setDraggingIndex(null);
              setDropIndex(null);
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              minHeight: `${rowHeight}px`,
              padding: "0.2rem 0.45rem",
              borderBottom:
                index === items.length - 1
                  ? "none"
                  : "1px solid var(--mantine-color-gray-2)",
              background: isDropTarget
                ? "var(--mantine-color-blue-1)"
                : isSelected
                  ? "var(--mantine-color-blue-0)"
                  : "transparent",
              cursor:
                allow_reorder && !disabled && !isEditing ? "grab" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isEditing ? (
              <TextInput
                value={editingText}
                size="xs"
                autoFocus
                styles={{
                  root: { width: "100%" },
                  input: { minHeight: "1.5rem", height: "1.5rem" },
                }}
                onFocus={(event) => {
                  // Select all text so users can type replacement immediately.
                  event.currentTarget.select();
                }}
                onChange={(event) => setEditingText(event.currentTarget.value)}
                onBlur={() => {
                  const name = editingText.trim();
                  setEditingIndex(null);
                  if (name.length === 0 || name === item) return;
                  emitEvent({
                    event: "rename",
                    selected_index: index,
                    index,
                    text: name,
                    src_index: null,
                    dst_index: null,
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setEditingIndex(null);
                    return;
                  }
                  if (event.key === "Enter") {
                    const name = editingText.trim();
                    setEditingIndex(null);
                    if (name.length === 0 || name === item) return;
                    emitEvent({
                      event: "rename",
                      selected_index: index,
                      index,
                      text: name,
                      src_index: null,
                      dst_index: null,
                    });
                  }
                }}
                disabled={disabled}
              />
            ) : (
              <Text
                style={{
                  width: "100%",
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  userSelect: "none",
                }}
              >
                {item}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );

  if (hint !== undefined && hint !== null) {
    content = (
      <Tooltip
        zIndex={100}
        label={hint}
        multiline
        style={{ width: "15rem" }}
        withArrow
        openDelay={500}
        withinPortal
      >
        <Box>{content}</Box>
      </Tooltip>
    );
  }

  return (
    <Box pb="0.5em" px="xs" style={{ width: "100%", boxSizing: "border-box" }}>
      {content}
    </Box>
  );
}
