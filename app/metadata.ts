import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MeDeMAP',
  description: 'MeDeMAP',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};