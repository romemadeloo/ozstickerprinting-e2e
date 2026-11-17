// Storefront copy and test data. Page objects and specs read text from here, never inline.

export const nav = {
  primary: [
    { name: 'STICKERS', path: '/stickers', h1: 'Stickers' },
    { name: 'BUSINESS CARD', path: '/business-cards', h1: /Business Card/i },
    { name: 'BADGES & MAGNETS', path: '/badges-and-magnets', h1: /Badges/i },
    { name: 'GET SAMPLES', path: '/sample-pack', h1: 'Sticker Sample Pack' }
  ]
} as const;

/** Public pages that must answer 200 with the given H1 and a title ending in the brand. */
export const publicPages = [
  { path: '/', h1: 'Custom Stickers Made for You', title: /Custom Stickers/ },
  { path: '/stickers', h1: 'Stickers', title: /Stickers Australia/ },
  { path: '/stickers/die-cut', h1: 'Die Cut Stickers', title: /Die Cut Stickers/ },
  { path: '/stickers/kiss-cut', h1: /Kiss Cut Stickers/i, title: /Kiss-Cut Stickers/ },
  { path: '/stickers/sheet', h1: 'Sticker Sheets', title: /Sticker Sheets/ },
  { path: '/stickers/roll', h1: 'Roll Stickers', title: /Roll Stickers/ },
  { path: '/stickers/vinyl/transparent', h1: 'Transparent Stickers', title: /Transparent Stickers/ },
  { path: '/stickers/special/hologram', h1: /Hologram Stickers/i, title: /Holographic Stickers/ },
  { path: '/business-cards/standard-business-card', h1: 'Standard Business Cards', title: /Business Cards/ },
  { path: '/badges/button-badge', h1: 'Button Badges', title: /Button Badges/ },
  { path: '/magnets/custom-magnet', h1: 'Custom Magnets', title: /Custom Magnets/ },
  { path: '/swing-tags', h1: 'Swing Tags', title: /Swing Tags/ },
  { path: '/sample-pack', h1: 'Sticker Sample Pack', title: /Sticker Samples/ },
  { path: '/vinyl-lettering-designer', h1: 'Vinyl Lettering Designer', title: /Vinyl Lettering/ },
  { path: '/about', h1: 'Who We Are', title: /About OzStickerPrinting/ },
  { path: '/user-guide/faq', h1: 'FAQ', title: /Frequently Asked Questions/ },
  { path: '/user-guide/artwork-guide', h1: 'Artwork Guide', title: /Artwork Guide/ },
  { path: '/blog', h1: 'Blogs', title: /Blog/ },
  { path: '/sitemap', h1: 'Site Map', title: /Sitemap/ },
  { path: '/terms-and-condition', h1: 'Terms and Conditions', title: /Terms/ },
  { path: '/privacy-policy', h1: 'Privacy Policy', title: /Privacy Policy/ }
] as const;

export const footerLinks = [
  { name: 'Die Cut Stickers', path: '/stickers/die-cut' },
  { name: 'Standard Business Card', path: '/business-cards/standard-business-card' },
  { name: 'About Us', path: '/about' },
  { name: 'FAQ', path: '/user-guide/faq' },
  { name: 'Artwork Guide', path: '/user-guide/artwork-guide' },
  { name: 'Terms of Service', path: '/terms-and-condition' },
  { name: 'Privacy Policy', path: '/privacy-policy' }
] as const;

export const contactEmail = 'info@ozstickerprinting.com';

export const auth = {
  signInHeading: 'Sign In to your account',
  registerHeading: 'New Member Registration',
  tabs: { member: 'Member', nonMember: 'Non-member' },
  labels: {
    email: 'Email Address',
    password: 'Password',
    orderNumber: 'Order Number',
    firstName: 'First Name',
    lastName: 'Last Name'
  },
  buttons: {
    openSignIn: 'Sign in to Account',
    openRegister: 'Register',
    signIn: 'Sign In',
    register: 'Register',
    checkOrder: 'Check Your Order',
    facebook: 'Login with Facebook',
    google: 'Login with Google'
  },
  errors: {
    emailRequired: 'Email address is required. Please try again.',
    passwordRequired: 'Password is required. Please try again.',
    invalidEmail: 'Please enter a valid email.',
    badCredentials: 'Your email address and password do not match.',
    firstNameRequired: 'First name is required. Please try again.',
    lastNameRequired: 'Last name is required. Please try again.'
  },
  // Reserved domain: never a real account.
  unknownMember: { email: 'qa-e2e-nobody@example.com', password: 'WrongPass123!' }
} as const;

export const search = {
  placeholder: 'Search products or uses...',
  hit: { query: 'hologram', result: /Hologram Stickers/ },
  miss: { query: 'zzqqxx-no-such-product' },
  noMatches: 'No matches found.',
  sections: { products: 'Products', uses: 'Uses' }
} as const;

export const cart = {
  emptyDropdown: 'There are no items in the cart.',
  pageHeading: /Cart \(\d+\)/,
  emptyPageHeading: 'Cart (0)'
} as const;

export const dieCut = {
  path: '/stickers/die-cut',
  defaults: { summary: 'Die Cut / Square / 30x30mm / Gloss / Normal / Qty : 100' },
  materials: ['Art Paper', 'Classic Paper', 'Kraft Paper'],
  finishes: ['Gloss', 'Matte', 'Uncoated'],
  quantities: { base: '100', next: '200', more: ['300', '400', '500', '1000', '5000', '10000'] },
  minSizeMessage: '* Width or height must not be below 30x30mm for Die Cut.',
  specialSizeMessage: '* For special sizes, request a quote from the button below.',
  quantityRule: 'We only accept those that are divisible by 100.',
  seeMore: 'See More',
  customQuantity: 'Custom Quantity',
  addToCart: 'Add to Cart',
  totalPrice: 'Total Price',
  artworkModal: {
    heading: 'Upload Artwork',
    skip: 'Skip & upload artwork later *'
  }
} as const;

export const notFound = {
  path: '/qa-e2e-this-page-does-not-exist',
  title: /Page Not Found/,
  h1: 'Page not Found'
} as const;
