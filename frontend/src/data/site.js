/* ------------------------------------------------------------------
   Site details. Fill in any of these to show them in the footer;
   leave a line empty ('') to hide it.
   ------------------------------------------------------------------ */
export const CONTACT = {
  instagram: '',   // e.g. 'https://www.instagram.com/yourhandle'
  whatsapp: '',    // e.g. '919876543210' (country code + number, digits only)
  email: '',       // e.g. 'hello@example.com'
};

export const hasContact = Object.values(CONTACT).some(Boolean);

// Name of the Netlify form that receives pre-order interest.
// It must match the hidden form in index.html.
export const FORM_NAME = 'preorder-interest';
