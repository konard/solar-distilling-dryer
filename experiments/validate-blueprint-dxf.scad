// Run after build-blueprint.mjs: openscad -o /tmp/SD-01-cuts.stl experiments/validate-blueprint-dxf.scad
// OpenSCAD ignores the standard DXF TEXT labels with an expected unsupported-entity warning.
// Run after build-blueprint.mjs; imported closed contours must extrude cleanly.
linear_extrude(height=2) import("../dist/site/downloads/SD-01-rev-A.dxf");
