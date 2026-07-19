# Haba West Photo Integration Implementation Plan

> **For agentic workers:** Execute this plan task-by-task in the current workspace. Keep the original photos outside Git and do not add project dependencies.

**Goal:** Bind four named photos to matching Haba West map nodes and show all five `scene` photos in the existing route highlights section.

**Architecture:** Preserve the current data-driven UI. Published WebP assets live under `public/pics/haba/`; `routeMapData.ts` supplies node-card images and `routeData.ts` supplies the five existing `Highlights` blocks. A Node built-in test verifies asset presence, WebP structure, metadata stripping, and exact data references.

**Tech Stack:** Vite 5, React 18, TypeScript, Node built-in test runner, Sharp 0.34.5 in a disposable `/tmp` tool environment selected through the existing image compression skill.

---

### Task 1: Add a failing photo contract test

**Files:**
- Create: `scripts/haba-images.test.mjs`
- Read: `src/data/routeData.ts`
- Read: `src/data/routeMapData.ts`

- [x] **Step 1: Create the test with exact published filenames and bindings**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const routeData = await readFile(new URL('../src/data/routeData.ts', import.meta.url), 'utf8');
const routeMapData = await readFile(new URL('../src/data/routeMapData.ts', import.meta.url), 'utf8');

const sceneImages = Array.from({ length: 5 }, (_, index) => `/pics/haba/scene-${index + 1}.webp`);
const nodeImages = {
  'double-lake-camp': '/pics/haba/double-lake-camp.webp',
  'couple-lake-pass': '/pics/haba/couple-lake-pass.webp',
  'black-lake-camp': '/pics/haba/black-lake-camp.webp',
  'long-lake': '/pics/haba/long-lake.webp',
};
const publishedImages = [...sceneImages, ...Object.values(nodeImages)];

test('Haba West publishes five ordered scene images', () => {
  let previousIndex = -1;
  for (const image of sceneImages) {
    const index = routeData.indexOf(`image: '${image}'`);
    assert.ok(index > previousIndex, `${image} should appear in order`);
    previousIndex = index;
  }
});

test('Haba West named nodes reference matching images', () => {
  for (const [nodeId, image] of Object.entries(nodeImages)) {
    assert.match(
      routeMapData,
      new RegExp(`id: '${nodeId}'[^\\n]*image: '${image.replaceAll('/', '\\/')}'`),
    );
  }
});

test('Haba West published images are WebP without embedded EXIF or XMP', async () => {
  for (const image of publishedImages) {
    const file = await readFile(new URL(`../public${image}`, import.meta.url));
    assert.equal(file.subarray(0, 4).toString('ascii'), 'RIFF', image);
    assert.equal(file.subarray(8, 12).toString('ascii'), 'WEBP', image);
    assert.equal(file.includes(Buffer.from('EXIF')), false, image);
    assert.equal(file.includes(Buffer.from('XMP ')), false, image);
  }
});
```

- [x] **Step 2: Run the focused test and verify the red state**

Run: `node --test scripts/haba-images.test.mjs`

Expected: FAIL because the Haba West data contains no photo references and the nine WebP files do not exist.

---

### Task 2: Convert the nine local photos into publishable WebP assets

**Files:**
- Read only: `pics/haba/*`
- Create: `public/pics/haba/scene-1.webp`
- Create: `public/pics/haba/scene-2.webp`
- Create: `public/pics/haba/scene-3.webp`
- Create: `public/pics/haba/scene-4.webp`
- Create: `public/pics/haba/scene-5.webp`
- Create: `public/pics/haba/double-lake-camp.webp`
- Create: `public/pics/haba/couple-lake-pass.webp`
- Create: `public/pics/haba/black-lake-camp.webp`
- Create: `public/pics/haba/long-lake.webp`

- [x] **Step 1: Create the publication directory**

Run: `mkdir -p public/pics/haba`

Expected: the directory exists and is empty before conversion.

- [x] **Step 2: Prepare a disposable Sharp environment outside the project**

```bash
mkdir -p /tmp/haba-image-tools
cd /tmp/haba-image-tools
bun add sharp@0.34.5
```

Expected: Sharp and its macOS ARM image module are linked under `/tmp`; the project `package.json` and lockfiles remain unchanged.

- [x] **Step 3: Convert all nine inputs with rotation, resizing, and metadata stripping**

Create `/tmp/haba-image-tools/convert.mjs` with:

```js
import sharp from 'sharp';

const root = process.env.HABA_PROJECT_ROOT;
if (!root) throw new Error('HABA_PROJECT_ROOT is required');
const images = [
  ['pics/haba/scene1.jpg', 'public/pics/haba/scene-1.webp', 2400],
  ['pics/haba/scene2.jpg', 'public/pics/haba/scene-2.webp', 2400],
  ['pics/haba/scene3.JPG', 'public/pics/haba/scene-3.webp', 2400],
  ['pics/haba/scene4.JPG', 'public/pics/haba/scene-4.webp', 2400],
  ['pics/haba/scene5.JPG', 'public/pics/haba/scene-5.webp', 2400],
  ['pics/haba/双湖营地.JPG', 'public/pics/haba/double-lake-camp.webp', 1600],
  ['pics/haba/夫妻海垭口.jpg', 'public/pics/haba/couple-lake-pass.webp', 1600],
  ['pics/haba/黑海营地.DNG', 'public/pics/haba/black-lake-camp.webp', 1600],
  ['pics/haba/长湖.DNG', 'public/pics/haba/long-lake.webp', 1600],
];

for (const [input, output, maxSize] of images) {
  await sharp(`${root}/${input}`)
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(`${root}/${output}`);
}
```

Run from the project root: `HABA_PROJECT_ROOT="$PWD" bun /tmp/haba-image-tools/convert.mjs`

Expected: five scene images have a 2400px maximum edge; four node images have a 1600px maximum edge; Sharp omits source metadata by default.

- [x] **Step 4: Check output type, size, and source preservation**

Run: `file public/pics/haba/*.webp && du -ch public/pics/haba/*.webp | tail -n 1 && git status --short --untracked-files=all`

Expected: nine WebP files are reported; no original JPG or DNG is staged or tracked.

---

### Task 3: Bind photos through existing route data

**Files:**
- Modify: `src/data/routeData.ts`
- Modify: `src/data/routeMapData.ts`
- Test: `scripts/haba-images.test.mjs`

- [x] **Step 1: Fill the Haba West highlights in scene order**

Replace `highlights: []` on `habaWestRoute` with:

```ts
highlights: [
  { title: '哈巴西坡沿途风景 01', description: '哈巴西坡环线沿途实景。', image: '/pics/haba/scene-1.webp' },
  { title: '哈巴西坡沿途风景 02', description: '哈巴西坡环线沿途实景。', image: '/pics/haba/scene-2.webp' },
  { title: '哈巴西坡沿途风景 03', description: '哈巴西坡环线沿途实景。', image: '/pics/haba/scene-3.webp' },
  { title: '哈巴西坡沿途风景 04', description: '哈巴西坡环线沿途实景。', image: '/pics/haba/scene-4.webp' },
  { title: '哈巴西坡沿途风景 05', description: '哈巴西坡环线沿途实景。', image: '/pics/haba/scene-5.webp' },
],
```

- [x] **Step 2: Add images only to the four exact matching nodes**

Replace the four existing one-line node objects with these complete lines:

```ts
{ id: 'double-lake-camp', name: '双湖营地', category: '营地', dayLabel: '第1天', description: '第一天行程终点。抵达后应关注高海拔适应和夜间保暖。', image: '/pics/haba/double-lake-camp.webp', coordinates: [100.066454, 27.326323, 4071] },
{ id: 'couple-lake-pass', name: '夫妻海垭口', category: '垭口', dayLabel: '第2天', description: '第二天连续翻越路段中的高海拔垭口，应结合当季积雪谨慎通行。', image: '/pics/haba/couple-lake-pass.webp', coordinates: [100.054230, 27.358742, 4369] },
{ id: 'black-lake-camp', name: '黑海营地', category: '营地', dayLabel: '第2天', description: '第二天行程终点，也是第三天返回咖啡营地前的宿营位置。', image: '/pics/haba/black-lake-camp.webp', coordinates: [100.068445, 27.354640, 4110] },
{ id: 'long-lake', name: '长湖', category: '景点', dayLabel: '第3天', description: '第三天从黑海营地出发后经过的高山湖泊节点。', image: '/pics/haba/long-lake.webp', coordinates: [100.075398, 27.348398, 4168] },
```

- [x] **Step 3: Run the focused test and verify the green state**

Run: `node --test scripts/haba-images.test.mjs`

Expected: 3 tests pass.

- [x] **Step 4: Run the full route test suite**

Run: `node --test scripts/*.test.mjs`

Expected: all tests pass, including the existing Haba GeoJSON and route-map-state coverage.

---

### Task 4: Validate production output and visual behavior

**Files:**
- Verify: `public/pics/haba/*.webp`
- Verify: `src/data/routeData.ts`
- Verify: `src/data/routeMapData.ts`
- Update: `Obliviate/20_Projects/justdemo/STATUS.md`
- Update: `Obliviate/20_Projects/justdemo/OPEN_LOOPS.md`

- [x] **Step 1: Run repository checks**

Run: `npx vite build`

Expected: Vite production build completes.

Run: `git diff --check`

Expected: no whitespace errors.

- [x] **Step 2: Run desktop browser QA at `/route/haba-west`**

Verify at 1440×900:

- four named node list items show thumbnails;
- selecting each named node shows its matching image in the detail panel;
- five full-width scene blocks appear after the overview in numeric order;
- no broken image requests or console errors are introduced.

- [x] **Step 3: Run mobile browser QA at `/route/haba-west`**

Verify at 390×844:

- node thumbnails and selected-node image render inside the mobile sheet;
- all five scene blocks remain legible and preserve useful crops;
- map selection and sheet transitions still work.

- [x] **Step 4: Run a regression check on `/route/wusun`**

Expected: existing Wusun node images and five highlights remain unchanged.

- [x] **Step 5: Perform compliance and privacy review**

Verify:

- only `/pics/haba/*.webp` paths are referenced;
- no original JPG or DNG binary, source photo path, EXIF, GPS, device, or timestamp enters the staged diff;
- no component imports route constants directly;
- no new dependency or unrelated refactor exists.

- [x] **Step 6: Update project memory and rebuild the index**

Mark “补充哈巴西坡路线照片” complete in `OPEN_LOOPS.md`, append QA results to `STATUS.md`, then run:

`python3 .index/scripts/memory_index.py --scan`

- [x] **Step 7: Commit the implementation**

```bash
git add docs/plans/2026-07-19-haba-west-photos-plan.md public/pics/haba scripts/haba-images.test.mjs src/data/routeData.ts src/data/routeMapData.ts
git commit -m "feat: add Haba West route photography"
```

Expected: the implementation commit contains the plan, nine WebP files, one test, and two data-file edits; original photos remain untracked.
