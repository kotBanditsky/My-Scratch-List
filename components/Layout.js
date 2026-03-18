import Sideboard from "./dashboard/sideboard";
import Footer from "./dashboard/footer";
import Nav from "./dashboard/nav";
import AlertViewer from "./details/alerton";
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen site-bg flex">
      <Sideboard />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-16 relative">
        <Nav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
        <Footer />
      </div>
      <AlertViewer />
    </div>
  );
};

export default Layout;
