import React from "react";
import { GuiSliderMessage } from "../WebsocketMessages";
import { Slider, Flex, NumberInput } from "@mantine/core";
import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { ViserInputComponent } from "./common";
import { sliderDefaultMarks } from "./ComponentStyles.css";

export default function SliderComponent({
  uuid,
  value,
  props: {
    label,
    hint,
    visible,
    disabled,
    min,
    max,
    precision,
    step,
    _marks: marks,
  },
}: GuiSliderMessage) {
  const { setValue } = React.useContext(GuiComponentContext)!;
  if (!visible) return null;
  const updateValue = (value: number) => setValue(uuid, value);
  const formattedValue =
    typeof value === "number" && precision != null
      ? Number(value.toFixed(precision))
      : value;
  const input = (
    <Flex justify="space-between">
      <Slider
        id={uuid}
        className={marks === null ? sliderDefaultMarks : undefined}
        size="xs"
        thumbSize={0}
        radius="xs"
        style={{ flexGrow: 1 }}
        styles={(theme) => ({
          thumb: {
            height: "0.75rem",
            width: "0.5rem",
            background: theme.colors[theme.primaryColor][6],
          },
          trackContainer: {
            zIndex: 3,
            position: "relative",
          },
          markLabel: {
            transform: "translate(-50%, 0.05rem)",
            fontSize: "0.6rem",
            textAlign: "center",
          },
          mark: {
            transform: "scale(2)",
          },
        })}
        pt="0.3em"
        pb="0.2em"
        showLabelOnHover={false}
        min={min}
        max={max}
        step={step ?? undefined}
        precision={precision}
        value={formattedValue}
        onChange={updateValue}
        marks={
          marks === null
            ? [
                {
                  value: min,
                  // The regex here removes trailing zeros and the decimal
                  // point if the number is an integer.
                  label: `${min.toFixed(6).replace(/\.?0+$/, "")}`,
                },
                {
                  value: max,
                  // The regex here removes trailing zeros and the decimal
                  // point if the number is an integer.
                  label: `${max.toFixed(6).replace(/\.?0+$/, "")}`,
                },
              ]
            : marks
        }
        disabled={disabled}
      />
      <NumberInput
        value={formattedValue}
        onChange={(newValue) => {
          if (newValue === "") {
            return;
          }
          const numeric = Number(newValue);
          if (Number.isFinite(numeric)) {
            const formatted = precision != null ? Number(numeric.toFixed(precision)) : numeric;
            updateValue(formatted);
          }
        }}
        size="xs"
        min={min}
        max={max}
        hideControls
        step={step ?? undefined}
        style={{ width: precision && precision > 3 ? "3.5rem" : "3rem" }}
        styles={{
          input: {
            padding: "0.375em",
            letterSpacing: "-0.5px",
            minHeight: "1.875em",
            height: "1.875em",
          },
        }}
        ml="xs"
      />
    </Flex>
  );

  return (
    <ViserInputComponent {...{ uuid, hint, label }}>
      {input}
    </ViserInputComponent>
  );
}
