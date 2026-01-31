import "./../styles/globals.css";
import RQProvider from "@/components/RQProvider";
import ResponsiveProvider from "@/components/ResponsiveProvider";
import Head from "@/components/SEO/Head";
import { headers } from "next/headers";
import OptionalFilterFormProvider from "@/components/CourseFilterFormProvider";
import CPSATFilterFormProvider from "@/components/CPSATFilterFormProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const header = await headers();
  const userAgent = header.get("user-agent") || "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  return (
    <html lang="ko">
      <Head />
      <body>
        <RQProvider>
          <OptionalFilterFormProvider>
            <CPSATFilterFormProvider>
              <ResponsiveProvider
                initialDevice={isMobile ? "mobile" : "desktop"}
              >
                {children}
              </ResponsiveProvider>
            </CPSATFilterFormProvider>
          </OptionalFilterFormProvider>
        </RQProvider>
      </body>
    </html>
  );
}
