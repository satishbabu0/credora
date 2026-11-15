import './globals.css';

export const metadata = {
  title: 'Credora | Digital Credentials, Trusted Everywhere',
  description: 'Credora is a secure digital credential issuance, management and verification platform.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
