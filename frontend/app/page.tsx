import HeroSection from "./component/Home/HeroSection";
import StatsSection from "./component/Home/StatsSection";
import ProductList from "./products/component/ProductList";
import UnderMain from "./component/Home/UnderMain";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen" >
     <HeroSection/>
     <StatsSection/>
     <ProductList />
     <UnderMain/>
    </div>
  );
}
