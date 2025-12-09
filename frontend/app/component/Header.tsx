import Avater from "./Header/Avater";
import Logo from "./Header/Logo";
import Nav from "./Header/Nav";
import Notification from "./Header/Notification";
import SearchField from "./Header/SearchField";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* צד שמאל – לוגו ותפריט */}
          <div className="flex items-center space-x-5">
            <Logo />
            <Nav />
          </div>

          {/* צד ימין – חיפוש, פעמון ואווטאר */}
          <div className="flex items-center space-x-4">
            <SearchField />
            <Notification />
            <Avater />
          </div>

        </div>
      </div>
    </header>
  );
}
