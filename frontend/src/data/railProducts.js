/* ------------------------------------------------------------------
   Clothing rail — the tees that hang on the home page rail.
   Edit names, prices and sizes right here.

   Images live in public/images/rail/ as transparent PNGs (each has a
   small .webp twin that is served first).

   The pre-order button sends `sku` to the API, so every sku below must
   also exist in the products database (see products-sample.csv).
   ------------------------------------------------------------------ */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const design = (sku, name, price, color, slug) => ({
  sku, name, price,
  collection: 'Oversized T-Shirts',
  sizes: SIZES,
  colors: [color],
  images: [`/images/rail/${slug}-front.png`, `/images/rail/${slug}-back.png`],
});

export const RAIL_DESIGNS = {
  doom: design('rail-doom-1', 'Doom Oversized T-Shirt', 849, 'Black', 'doom'),
  nothing: design('rail-nothing-1', 'Nothing Happened Oversized T-Shirt', 849, 'Cream', 'nothing'),
  thalapathy: design('rail-thalapathy-1', 'Thalapathy Oversized T-Shirt', 849, 'Black', 'thalapathy'),
  gta: design('rail-gta-1', 'Grand Theft Auto Oversized T-Shirt', 849, 'Black', 'gta'),
  virat: design('rail-virat-1', 'Virat 18 Oversized T-Shirt', 849, 'Navy', 'virat'),
};

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
    name: product.name.replace(/ Oversized T-Shirt$/, ''),
    price: product.price,
    sizes: product.sizes,
    front: product.images[view === 'Back' ? 1 : 0],
    side,
  };
};

// Left to right along the rail. Reorder, remove or add lines freely.
export const RAIL_ITEMS = [
  hanger('doom', 'Back'),
  hanger('nothing', 'Front'),
  hanger('gta', 'Back'),
  hanger('virat', 'Front'),
  hanger('thalapathy', 'Back'),
  hanger('doom', 'Front'),
  hanger('nothing', 'Back'),
  hanger('gta', 'Front'),
  hanger('virat', 'Back'),
  hanger('thalapathy', 'Front'),
];
