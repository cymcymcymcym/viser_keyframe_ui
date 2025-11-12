"""GUI layouts

Organize GUI controls using folders, columns, tabs, and nested structures for better user experience.

**Features:**

* :meth:`viser.GuiApi.add_columns` for side-by-side control panels with adjustable widths
* :meth:`viser.GuiApi.add_folder` for grouping related controls
* :meth:`viser.GuiApi.add_tab_group` and :meth:`viser.GuiTabGroupHandle.add_tab` for tabbed interfaces
* Nested folder hierarchies for complex layouts
* Context managers for automatic grouping
"""

import time

import viser


def main() -> None:
    server = viser.ViserServer()

    columns = server.gui.add_columns(3, widths=(0.3, 0.2, 0.2))

    # Example 1: Organizing with folders, placed in the first column
    with columns[0]:
        with server.gui.add_folder("Camera Controls"):
            with server.gui.add_folder("Position"):
                server.gui.add_slider(
                    "X", min=-5.0, max=5.0, step=0.1, initial_value=0.0
                )
                server.gui.add_slider(
                    "Y", min=-5.0, max=5.0, step=0.1, initial_value=2.0
                )
                server.gui.add_slider(
                    "Z", min=-5.0, max=5.0, step=0.1, initial_value=3.0
                )

            with server.gui.add_folder("Rotation"):
                server.gui.add_slider("Pitch", min=-180, max=180, step=1, initial_value=0)
                server.gui.add_slider("Yaw", min=-180, max=180, step=1, initial_value=0)
                server.gui.add_slider("Roll", min=-180, max=180, step=1, initial_value=0)

    # Example 2: Scene objects organization in the second column
    with columns[1]:
        with server.gui.add_folder("Scene Objects"):
            with server.gui.add_folder("Lighting"):
                server.gui.add_checkbox("Enable Lighting", initial_value=True)
                server.gui.add_slider(
                    "Intensity", min=0.0, max=2.0, step=0.1, initial_value=1.0
                )
                server.gui.add_rgb("Color", initial_value=(255, 255, 255))

            with server.gui.add_folder("Objects"):
                show_axes = server.gui.add_checkbox(
                    "Show Coordinate Axes", initial_value=True
                )
                server.gui.add_checkbox("Show Grid", initial_value=False)

                with server.gui.add_folder("Sphere"):
                    sphere_radius = server.gui.add_slider(
                        "Radius", min=0.1, max=2.0, step=0.1, initial_value=0.5
                    )
                    sphere_color = server.gui.add_rgb("Color", initial_value=(255, 0, 0))
                    sphere_visible = server.gui.add_checkbox(
                        "Visible", initial_value=True
                    )

    # Example 3: Settings and preferences in the third column
    with columns[2]:
        with server.gui.add_folder("Settings"):
            with server.gui.add_folder("Display"):
                server.gui.add_rgb("Background", initial_value=(40, 40, 40))
                server.gui.add_checkbox("Wireframe Mode", initial_value=False)

            with server.gui.add_folder("Performance"):
                server.gui.add_slider(
                    "FPS Limit", min=30, max=120, step=10, initial_value=60
                )
                server.gui.add_dropdown(
                    "Quality", options=["Low", "Medium", "High"], initial_value="Medium"
                )
        with server.gui.add_folder("Diagnostics"):
            for idx in range(12):
                server.gui.add_slider(
                    f"Metric {idx + 1}",
                    min=0.0,
                    max=100.0,
                    step=1.0,
                    initial_value=float(idx * 5),
                )
            for flag_idx in range(6):
                server.gui.add_checkbox(
                    f"Flag {flag_idx + 1}", initial_value=flag_idx % 2 == 0
                )

    # Add some visual objects to demonstrate the controls
    server.scene.add_icosphere(
        name="demo_sphere",
        radius=sphere_radius.value,
        color=(
            sphere_color.value[0] / 255.0,
            sphere_color.value[1] / 255.0,
            sphere_color.value[2] / 255.0,
        ),
        position=(0.0, 0.0, 0.0),
        visible=sphere_visible.value,
    )

    if show_axes.value:
        server.scene.add_frame("axes", axes_length=1.0, axes_radius=0.02)

    print("This example shows GUI organization with folders.")
    print("The sphere demonstrates some interactive controls.")

    print("Explore the organized GUI controls!")
    print("Notice how folders help group related functionality.")

    while True:
        time.sleep(0.1)


if __name__ == "__main__":
    main()
