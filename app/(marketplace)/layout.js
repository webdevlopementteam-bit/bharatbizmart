import Header from "@/components/marketplace/Header";
import Footer from "@/components/marketplace/Footer";
import CompareBar from "@/components/marketplace/CompareBar";

export default function MarketplaceLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
    </>
  );
}
