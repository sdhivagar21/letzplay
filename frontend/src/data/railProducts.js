/* ------------------------------------------------------------------
   The drop — the only tees on the site.
   Edit names, colours and sizes right here.

   Images live in public/images/rail/ as transparent PNGs (each has a
   small .webp twin that is served first).
   ------------------------------------------------------------------ */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// tryOn: what the live AI try-on is told to draw, with the front or the back
// print showing (20–30 words, starting "Substitute the current top with").
const design = (sku, name, color, slug, accent, tryOn) => ({
  sku, name, color, accent,              // accent: colour of the picked size and "In your picks"
  sizes: SIZES,
  images: [`/images/rail/${slug}-front.v2.png`, `/images/rail/${slug}-back.v2.png`],
  tryOn,
});

const tee = (colour) => `Substitute the current top with an oversized ${colour} heavyweight cotton t-shirt with dropped shoulders and a boxy fit`;

export const RAIL_DESIGNS = {
  thalapathy: design('thalapathy', 'Thalapathy', 'Washed black', 'thalapathy', '#c8102e', {
    front: `${tee('washed-black')}, a cream "Thalapathy" brush-script logo with a thin red underline across the chest`,
    back: `${tee('washed-black')}, a large black-and-white portrait print of a smiling man in a suit inside a red brush-stroke circle`,
  }),
  doom: design('doom', 'Doom', 'Washed black', 'doom', '#c8102e', {
    front: `${tee('washed-black')}, a small dark print of a hooded green figure with a metal mask and thin gold "DOOM" lettering on the chest`,
    back: `${tee('washed-black')}, a large print of a cloaked armoured figure in glowing green smoke under big gold "DOOM" lettering`,
  }),
  nothing: design('nothing-happened', 'Nothing Happened', 'Cream', 'nothing', '#c8102e', {
    front: `${tee('cream')}, small black typewriter text "nothing happened." above three thin swords on the left chest`,
    back: `${tee('cream')}, a large black ink sketch of a scarred swordsman with crossed arms under typewriter text "nothing happened."`,
  }),
  gta: design('grand-theft-auto', 'Grand Theft Auto', 'Washed black', 'gta', '#c8102e', {
    front: `${tee('washed-black')}, a small white stacked "grand theft auto" logo with a pink and purple stripe on the left chest`,
    back: `${tee('washed-black')}, a large retro sunset print with palm trees, a purple muscle car, a couple and the "grand theft auto" logo`,
  }),
  virat: design('virat-18', 'Virat 18', 'Navy', 'virat', '#c8102e', {
    front: `${tee('navy')}, a small white "VIRAT" and "18" print on the left chest`,
    back: `${tee('navy')}, a large print of a cricketer in a white number 18 jersey raising two fingers, under "VIRAT" and a big gold-outlined 18`,
  }),
};

// The five designs, in the order they are listed under the rail.
export const DESIGNS = Object.values(RAIL_DESIGNS);

// One hanger on the rail.
//   front: the picture shown when the tee faces you (transparent PNG)
//   side:  optional side-view picture. When it is set the rail crossfades
//          from it to `front`; when it is missing the side view is faked
//          by turning `front` in 3D.
const hanger = (key, view, side = null) => {
  const product = RAIL_DESIGNS[key];
  return {
    id: `${product.sku}-${view.toLowerCase()}`,
    product,
    view,                                   // "Front" or "Back"
    name: product.name,
    sizes: product.sizes,
    front: product.images[view === 'Back' ? 1 : 0],
    side,
  };
};

// Left to right along the rail. Reorder, remove or add lines freely.
export const RAIL_ITEMS = [
  hanger('thalapathy', 'Back'),
  hanger('doom', 'Front'),
  hanger('nothing', 'Back'),
  hanger('gta', 'Front'),
  hanger('virat', 'Back'),
  hanger('thalapathy', 'Front'),
  hanger('doom', 'Back'),
  hanger('nothing', 'Front'),
  hanger('gta', 'Back'),
  hanger('virat', 'Front'),
];
