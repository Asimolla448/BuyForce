import HeroSection from "./component/Home/HeroSection";
import StatsSection from "./component/Home/StatsSection";
import ProductList from "./component/Home/Main/ProductList";
import UnderMain from "./component/Home/Main/UnderMain";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
     <HeroSection/>
     <StatsSection/>
     <ProductList products={[]}/>
     <UnderMain/>
    </div>
  );
}
