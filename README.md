# viser-keyframe

[![PyPI version](https://img.shields.io/pypi/v/viser-keyframe.svg)](https://pypi.org/project/viser-keyframe/)
[![Python versions](https://img.shields.io/pypi/pyversions/viser-keyframe.svg)](https://pypi.org/project/viser-keyframe/)

A fork of [viser](https://github.com/nerfstudio-project/viser) with additional features for building keyframe editors and multi-column GUI layouts.

## What's New in viser-keyframe

This fork adds the following features on top of the original viser:

### 1. Multi-Column GUI Layouts

Create side-by-side control panels with `gui.add_columns()`:

```python
import viser

server = viser.ViserServer()

# Create a 3-column layout
columns = server.gui.add_columns(3)

# Add controls to each column
with columns.column(0):
    server.gui.add_slider("Left Arm", 0, 1, 0.5)
    
with columns.column(1):
    server.gui.add_button("Center")
    
with columns.column(2):
    server.gui.add_slider("Right Arm", 0, 1, 0.5)
```

You can also specify custom column widths:

```python
columns = server.gui.add_columns(3, widths=[0.3, 0.4, 0.3])
```

### 2. Slider Precision Fix

Fixes floating-point display noise in sliders (e.g., `0.30000000001` → `0.3`), with improved input validation and dynamic width for high-precision values.

## Installation

```bash
pip install viser-keyframe
```

## Usage

This package is a drop-in replacement for viser. Just install it and import as usual:

```python
import viser

server = viser.ViserServer()

# All original viser features work
server.scene.add_frame("/world")

# Plus the new multi-column layout
columns = server.gui.add_columns(2)
```

## Original Viser Features

All features from the original viser are included:

- API for visualizing 3D primitives
- GUI building blocks: buttons, checkboxes, text inputs, sliders, etc.
- Scene interaction tools (clicks, selection, transform gizmos)
- Programmatic camera control and rendering
- Web-based client for easy use over SSH

For full documentation, see the original viser docs: https://viser.studio

## Credits

This package is a fork of [viser](https://github.com/nerfstudio-project/viser) by the Nerfstudio team.

To cite the original viser project:

```bibtex
@misc{yi2025viser,
      title={Viser: Imperative, Web-based 3D Visualization in Python},
      author={Brent Yi and Chung Min Kim and Justin Kerr and Gina Wu and Rebecca Feng and Anthony Zhang and Jonas Kulhanek and Hongsuk Choi and Yi Ma and Matthew Tancik and Angjoo Kanazawa},
      year={2025},
      eprint={2507.22885},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2507.22885},
}
```

## License

MIT License (same as original viser)
