export const metadata = {
  title: 'My App',
  description: 'A minimal Next.js app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}