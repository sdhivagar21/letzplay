/* ------------------------------------------------------------------
   The drop — the only tees on the site.
   Edit names, colours and sizes right here.

   Images live in public/images/rail/ as transparent PNGs (each has a
   small .webp twin that is served first).
   ------------------------------------------------------------------ */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const design = (sku, name, color, slug, accent) => ({
  sku, name, color, accent,              // accent: glow colour behind the tee
  sizes: SIZES,
  images: [`/images/rail/${slug}-front.v2.png`, `/images/rail/${slug}-back.v2.png`],
});

export const RAIL_DESIGNS = {
  thalapathy: design('thalapathy', 'Thalapathy', 'Washed black', 'thalapathy', '#e0373a'),
  doom: design('doom', 'Doom', 'Washed black', 'doom', '#63c24a'),
  nothing: design('nothing-happened', 'Nothing Happened', 'Cream', 'nothing', '#e8d9b8'),
  gta: design('grand-theft-auto', 'Grand Theft Auto', 'Washed black', 'gta', '#ff5fa8'),
  virat: design('virat-18', 'Virat 18', 'Navy', 'virat', '#e3b53a'),
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
