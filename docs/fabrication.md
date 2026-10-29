# SD-01 revision A fabrication definition

This repository defines a passive, closed vapour-path tomato dryer and condensate collector. The website, CSV, JSON, developed DXF profiles, general arrangement SVG and OpenSCAD assembly are generated from native JavaScript in `assets/design.js` and `assets/assembly.js`. Units are millimetres. No Rust implementation, translation layer, native adapter or incomplete port is involved.

Revision A selects a **1200 × 800** chamber for a single removable 1050 × 650 tray. The original uploaded page's approximate 2000 × 1200 solid block was a concept, not a manufacturing specification. This smaller prototype permits manual access to the whole collector. Scaling requires regenerating and reviewing the complete definition; changing a BOM label alone is insufficient.

The files define fabrication geometry and interfaces. Physical food-process validation, wind/stability verification and glass supplier approval remain commissioning requirements; the website does not represent an already certified manufactured appliance.

## Datums and envelope

Workshop coordinates: X is width, Y is depth (positive toward front), Z is height above level ground. The browser/CAD uses X width, Y height, Z depth; this is a documented axis permutation, not a unit conversion. The centre drain is X0/Y0. All table heights are workshop Z.

| Feature                              | Dimension / datum                                       |
| ------------------------------------ | ------------------------------------------------------- |
| Chamber outer width × depth          | 1200 × 800                                              |
| Flat front / rear walls              | 1200 × 202 / 1200 × 422 blanks, 2 thick                 |
| Side wall blanks, qty 2              | 796 long; 203.1 front / 420.9 rear, 2 thick             |
| Collector perimeter / throat surface | Z885 / Z860                                             |
| Throat plate                         | 70 × 70 × 2, central Ø50.8 cutout                       |
| Sloped collector panels              | Four trapezoids; developed profiles in DXF; 25 fall     |
| Front / rear rim                     | Z1085 / Z1305                                           |
| Roof slope                           | atan(220/800) = 15.376°                                 |
| Tempered pane                        | 1300 × 933.4 × 6; plan overhang 50 all sides            |
| Compressed rim seal                  | 8 high, glass underside 8 above inclined wall rim       |
| Tray top                             | Z976.5, flat 1050 × 650 × 1.5                           |
| L-stand                              | Top Z975, lower sheet edges Z910                        |
| Drain                                | Ø53.8 OD, 1.5 wall, Ø50.8 ID; vertical 130; outlet Z730 |
| Vessel connector top / shelf top     | Z722 / Z430                                             |
| Cage plan footprint                  | 1230 × 830; leg centres X ±600 / Y ±400                 |
| Top rail centre / top face           | Z868 / Z883                                             |
| Maximum height including restraints  | Approximately 1363 nominal / 1563 fully raised          |
| Lower rail centre                    | Z230                                                    |
| Bottle shelf beam centre             | Z418                                                    |

General linear tolerance ±1; welded envelope ±2; angular ±0.5°. Drain concentricity to throat ≤0.5. Tray flatness ≤2 across 1050. Fixture diagonal difference ≤2. Treat these as drawing requirements to inspect, not measurements of an existing prototype. Purchase the glass only after checking the welded rim; tolerance stack-up must retain ≥45 plan overhang and continuous gasket contact.

## Parts and purchasing

The website's 12-row BOM lists subassemblies; quantities such as four feet are piece counts. Cage and stand rows contain multiple cut pieces. Download the CSV for material, dimensions and process notes. The JSON includes the complete solid list and cutting profiles.

All food/condensate-contact steel is 316L, including the tray, stand, collector, drain and cap. The external cage and shade are 304 stainless. Require material certificates for metal and supplier food-contact declarations for silicone, vent and seals at the validated operating temperature. Use low-iron tempered glass with polished edges, R10 corners and no holes. Calculated pane mass is approximately 18.2 kg using 2500 kg/m³; use two people and suction handles for removal. The pane needs supplier review for span, thermal gradients, clamp loads and local weather loads.

The purchased vessel envelope is Ø180, nominal 5 L, 292 high including cap, with a ≥Ø60 clear mouth. Its representation is an envelope, not a glass mould drawing. Verify the delivered vessel before fabricating the shelf/cap interface. A 316L Ø90 × 3 cap has an axial Ø50.8 through-port and an off-axis Ø6 vent through-port, centred 40 from the axis. Weld a Ø53.8 × 1.5 spigot 15 high around the axial port (cap face Z707; spigot top Z722); fit a removable silicone face gasket and an external retaining band to the delivered neck. The off-axis port receives a Ø8 OD / Ø6 bore vent standpipe, 57 high, with a Ø20 × 8 cartridge at Z764–772. This clears the sleeve and drain; its bore remains outside the central water path. The cap joint is entirely detachable.

A 40-long food-contact silicone sleeve has a Ø53.8 bore and 62 OD, overlapping the drain and cap spigot by at least 15 each across the 8 axial gap. Fit external band clamps; wetted connections have no exposed threads. Fit a purchased hydrophobic PTFE 0.2 µm vent cartridge to the cap vent spigot. The vent is pressure equalization, not an assurance of sterile filtration; follow the supplier's integrity and replacement instructions and keep it dry. Operate at atmospheric pressure only, never as a pressure vessel.

## Sheet cutting and joints

The DXF is in mm (`$INSUNITS=4`). Each named layer has one closed profile, quantity/thickness text and explicit circular holes. Profiles are separated for inspection; the file is **not a stock nesting plan**. Apply the shop's kerf compensation to nominal edges. There are no bend allowances because the shell uses cut panels and butt welds rather than folded blanks. The SVG is an arrangement drawing; do not scale it for cutting.

The collector has four planar trapezoids meeting a 70 × 70 flat throat at Z860. The throat avoids a varying-height joint between inclined planes and the circular drain. The developed panels preserve the sloped edge lengths: front/rear slant depth √(365²+25²), side slant depth √(565²+25²). Their seam edges meet along lines between outer and throat corners. Weld the entire throat perimeter, floor seams and wall/floor interfaces continuously; eliminate tack-only pockets and crevices. Weld the drain tube flush to the underside of the throat; the upper bore edge must be flush with the wetted face.

Wall blanks extend down to Z883, including a 2 mm weld land below the collector perimeter. Trim the collector perimeter to the inner wall faces during fit-up (2 mm in from each nominal outer edge); the DXF floor profiles retain this trimming allowance. The CAD unions the land and collector as the finished weld envelope, with no edge-only contact. Front/rear walls span the full 1200 width. Side walls fit between their inner faces, with 796 depth and the roof heights at Y ±398. The outer wall faces remain flat and uninterrupted. No leg anchors, threaded bosses, attachment welds or fasteners penetrate the shell. Full-penetration TIG seams are blended flush on both sides; form a smooth R3 minimum internal transition with weld metal. Finish wetted steel to Ra ≤0.8 µm, deburr exposed edges R0.5, pickle and passivate after welding. The CAD represents nominal sheet envelopes; weld bead blending and edge radii are fabrication operations, not additional assembled parts.

The purchased tray sheet is Ø3 perforation on 5 staggered pitch with a 10 solid border. The DXF gives its outer envelope; purchase the perforation pattern rather than cutting the thousands of holes individually. The renderer uses an alpha pattern to depict perforations. Cut rear stand sheet 1050 × 65 × 2 and left sheet 648 × 65 × 2. Butt weld them at 90° into a single L, rear and left only. There is no third support wall. The tray lifts off, rather than being welded on.

Stand feet centres are X/Y: (-495,-324), (495,-324), (-524,-294), (-524,295). Cut the feet after measuring the collector: nominal total heights 37.6, 37.6, 36.4, 36.4, including 8-deep × 2-wide saddle slots. Sheet lower edges are at Z910, feet tops Z918; the rest of the lower edges have approximately 28 mm drainage clearance. Removable Ø20 silicone feet contact the floor. Verify the tray is level and cannot tip under an eccentric load before use.

## Independent cage cut list

Square cuts, sealed tube ends, welded fixed perimeter joints. All cage bolts, pins and clamp screws are outside the chamber.

| Stock                | Quantity × length | Placement                               |
| -------------------- | ----------------- | --------------------------------------- |
| 304 SHS 30 × 30 × 2  | 4 × 733           | Outer legs, Z120 to Z853                |
| 304 SHS 25 × 25 × 2  | 4 × 500           | Sliding inner legs, Z20 to Z520 nominal |
| 304 SHS 30 × 30 × 2  | 2 × 1230          | Top front/rear rails, Z868              |
| 304 SHS 30 × 30 × 2  | 2 × 770           | Top side rails, Z868                    |
| 304 SHS 30 × 30 × 2  | 2 × 1170          | Lower front/rear rails, Z230            |
| 304 SHS 30 × 30 × 2  | 2 × 770           | Lower side rails, Z230                  |
| 304 SHS 20 × 20 × 2  | 2 × 1170          | Shelf crossbars, between legs at Z418   |
| 304 SHS 20 × 20 × 2  | 2 × 780           | Shelf bearers X ±140, Z418              |
| 304 strap 30 × 3     | 2 × 265 / 2 × 493 | Front/rear cage-only restraint posts    |
| 304 flat 60 × 30 × 3 | 4                 | Horizontal lid pressure bars            |
| 304 sheet 2          | 1 × 300 × 300     | Removable bottle shelf                  |
| 304 sheet 2          | 3 × 300 × 300     | Front and side sun shields              |

Front/rear top rails cap the side rails, which fit between their inner faces. Lower/shelf crossbars fit between leg inner faces. Two M8 cage-only locking pins per leg pass through Ø8.5 holes at nominal Z170 and Z195. Inner legs have matching holes every 25 from 50 to 450 above their lower ends. Raise all four outer assemblies together in 25 increments, +0 to 200; keep ≥200 overlap and both pins engaged. Fit M8 retaining nuts, not friction-only grub screws. Height changes move the shell, shelf and bottle datums together. The nominal drawing depicts the lowest setting. For a larger range, fabricate and review different leg lengths; the shell still needs no mounts.

Fit Ø44 levelling shoes and M12 stems to sealed inner leg end plates. Put 2-thick removable silicone strips on top rails under the chamber perimeter. Fit all four restraint posts with two M8 cage-only bolts each; put Ø8.5 holes 15 and 40 from each post's lower end. Pressure bars use M8 screws and Ø20 silicone tips; set stop nuts so the 10-high rim seal compresses to 8 and glass is never contacted by bare metal. Adjust each screw to the measured pane plane; do not use an unverified screw torque on glass. The 3D model depicts the lock pins and clamp envelopes; threads, end caps and joint drilling are specified here rather than individually tessellated.

Secure the bottle shelf to its bearers with four M6 bolts and the shields with four M6 bolts per panel. Use Ø6.5 holes 15 from both adjoining edges, mirror on the supporting cage angles. The front shield is removable for bottle access. Shelf and shield positions must not block removal of the bottle or cleaning brush. The model's open section hides the glass, seal, cage restraints, front chamber wall and front/right bottle shields; it is an inspection state, not an operating configuration.

## Assembly and acceptance

1. Fixture/weld the shell, collector and drain; verify dimensions and surface finish. No intermittent wetted seams. Inspect weld quality with the fabricator's suitable procedure; smooth appearance alone does not establish integrity.
2. Fabricate the square cage, telescoping legs and shelf beams. Level the shoes. Fit the shell on silicone strips with no hard point loads; attach all restraints to the cage alone.
3. Fit stand feet, stand and tray. Use the 45–50 nylon drain brush to verify straight-line access from above to below after removing the stand.
4. Install gasket, pane and padded pressure bars. Verify contact around the whole loop with a removable witness strip; correct uneven compression without bending the glass.
5. Fit the vessel, cap, sleeve and dry vent. Check engagement, face seals and access to each detachable joint. No exposed bottle mouth or open funnel is acceptable.
6. With the clean vessel attached and product removed, pour 1 L potable water around the collector perimeter. Record drainage time and residual pooling after 60 seconds; reject visible puddles, leaks, seam pockets or standing water outside the small throat weld radius. Investigate and correct fabrication before service.
7. Run a cool-water rain spray around the canopy, without pressurizing the vent. Use dry witness paper inside, without food present; reject ingress. Inspect seal seating and the 50 overhang. This is a prototype check, not a certified weather rating.
8. Have the cage and glass reviewed for the intended loaded tray mass, handling forces and site wind loads. Restrain the cage to the installation surface where required; do not put anchors on the chamber. Establish a permitted load and wind envelope before service.
9. Run an instrumented non-food commissioning cycle. Record ambient conditions, tray/chamber temperatures, condensation, water yield and seal behaviour. A closed chamber can stall at high humidity when the canopy is too warm; the site does not promise a drying rate. Validate drying kinetics, product water activity and microbiological acceptance for the intended food process before production. Collecting food-derived vapour does not establish potable-water purity.

No food drying time, purity percentage, validated cleaning-cycle duration, load rating or certified weather protection is claimed. These require physical observations; software geometry tests cannot substitute for them. This is a complete website and prototype fabrication definition, with physical commissioning explicitly distinguished from software acceptance.

## Cleaning between batches

Cool the apparatus; detach/cap the vessel and release the padded cage bars. Two people lift off the pane. Remove the gasket, tray, stand, all four feet, sleeve and cap. Keep the vent cartridge dry or replace it per its instructions. Wash accessible surfaces and straight brush the drain; rinse with potable water. Apply a compatible food-contact sanitizer according to its labelled dilution, temperature, contact time and rinsing requirements. Inspect, air dry and reassemble. Do not pour boiling water onto a cold pane or bottle. Avoid chloride cleaners on stainless steel.

The sequence follows the separation of cleaning and sanitization described in the [FDA Food Code](https://www.fda.gov/media/184685/download). The [USDA sanitizer guidance](https://ask.fsis.usda.gov/article/askFSIS-Public-Q-A-Sanitizers-in-FSIS-inspected-Establishments) explains why concentration, contact time and drying must follow the product label. General [NCHFP sun-drying guidance](https://nchfp.uga.edu/how/dry/sun-drying/) describes environmental limits; it does not validate this sealed prototype.

## Running and publishing the website

Serve the repository with any static HTTP server, for example `python3 -m http.server 8080`, and open `http://localhost:8080`. No build step, API key, CDN, external fonts or network access is needed after loading the local files. `?debug` enables optional browser interaction tracing; default logging is off. A WebGL failure leaves the specifications, tabs and exports usable.

`node scripts/build-blueprint.mjs` stages the public site and five pre-generated downloads in `dist/site`. The Pages build also preserves the existing universal example under `/demo/`; desktop/mobile example packaging stays intact. All URLs are relative and work at `/solar-distilling-dryer/`.

The `example-app.yml` workflow validates and stages the website for PRs, including native tests and Chromium interactions, and uploads artifacts without deploying a PR. After an authorized merge, its main-branch Pages job deploys `dist/site`. Set repository **Settings → Pages → Source → GitHub Actions** first. PR checks warn when Pages is disabled; the main branch fails with the exact setting to change. Do not run the deployment or merge as part of PR preparation. The expected published URL is `https://konard.github.io/solar-distilling-dryer/`; it is not evidence that deployment has already occurred.

Browser verification is in `experiments/blueprint-browser.mjs`, reused by the Playwright MCP session and `experiments/run-blueprint-browser.mjs` in CI. The browser suite exercises isometric/front/right/top views, orbit/pan/zoom, section/explosion/reset, BOM highlighting, keyboard tabs, all five downloads, three viewport widths and absence of external asset requests. OpenSCAD CI compiles the full assembly and renders the chamber, stand, drain and vessel to STL, rejecting warnings and non-manifold solids. Native tests cover architecture, fabrication data, primitive winding and the public artifact. Existing pipeline acceptance assertions remain enabled.
