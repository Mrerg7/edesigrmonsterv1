export const SITE = {
  name: 'eDesigr.monster',
  title: 'eDesigr.monster | Premium Domain for Sale | eDesigr',
  description:
    'eDesigr.monster for sale — $95,000 via secure escrow. Premium domain for electronic designers, AI art platforms & creative studios. Buy now or make an offer today.',
  url: 'https://edesigr.monster/',
  email: 'sales@desertrich.com',
  locale: 'en_US',
  location: 'Arizona',
  price: '95000',
  priceCurrency: 'USD',
  googleSiteVerification: 'T36XqRlqBzC_NkBJNi-_JsoKOeyTvxzRPlPRz1FZu8w',
} as const;

export const CF_IMAGES = {
  accountHash: '-sPAUAWeA405NiWJ0SNIQA',
  heroImageId: 'fb7221d2-dd3f-4e87-8831-df2f1bc06b00',
} as const;

export function cfImageUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${CF_IMAGES.accountHash}/${imageId}/${variant}`;
}

export const OG_IMAGE = cfImageUrl(CF_IMAGES.heroImageId);

export const ACQUISITION_MAILTO = `mailto:${SITE.email}?subject=${encodeURIComponent('eDesigr.monster Domain Acquisition Inquiry')}&body=${encodeURIComponent('Hello,\n\nI am interested in acquiring eDesigr.monster.\n\nIntended use:\nBudget range:\n\nThank you.')}`;
