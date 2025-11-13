export const DEFAULT_CANVAS_RATIO = 0.35;
export const MIN_CANVAS_RATIO = 0.2;
export const CANVAS_MIN_SHRINK_RATIO =
  MIN_CANVAS_RATIO / DEFAULT_CANVAS_RATIO; // Allow canvas to shrink to 20% of screen.
export const DEFAULT_PANEL_RATIO = 1 - DEFAULT_CANVAS_RATIO;

export const DEFAULT_FIRST_COLUMN_WIDTH_PX = 360;
export const DEFAULT_JOINT_COLUMN_WIDTH_PX = 260;
export const FIRST_COLUMN_MIN_RATIO = 0.9; // First column may shrink to 90% of default.
export const JOINT_COLUMN_MIN_WIDTH_PX = 250; // Prevent joint slider labels from colliding.

export const COLUMN_GAP_PX = 12;
export const DEFAULT_COLUMN_COUNT = 3;
export const DEFAULT_JOINT_COLUMN_COUNT = Math.max(DEFAULT_COLUMN_COUNT - 1, 0);

export function basePanelWidthWithoutGaps(
  columnCount: number,
  firstWidth = DEFAULT_FIRST_COLUMN_WIDTH_PX,
  jointWidth = DEFAULT_JOINT_COLUMN_WIDTH_PX,
): number {
  if (columnCount <= 0) {
    return 0;
  }
  const jointCount = Math.max(columnCount - 1, 0);
  return firstWidth + jointCount * jointWidth;
}

export function basePanelWidthWithGaps(columnCount: number): number {
  if (columnCount <= 0) {
    return 0;
  }
  const gapWidth = COLUMN_GAP_PX * Math.max(columnCount - 1, 0);
  return basePanelWidthWithoutGaps(columnCount) + gapWidth;
}

