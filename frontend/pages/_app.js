import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastProvider } from "../lib/toast";

export default function App({ Component, pageProps }) {
  // Pages that have their own full-screen layouts (no footer)
  const noFooter = Component.noFooter;

  return (
    <ToastProvider>
      <div className="page-wrapper">
        <Navbar />
        <Component {...pageProps} />
        {!noFooter && <Footer />}
      </div>
    </ToastProvider>
  );
}
