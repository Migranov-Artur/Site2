import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Analysis from "@/pages/Analysis";
import Formatting from "@/pages/Formatting";
import About from "@/pages/About";
import TextCheck from "@/pages/TextCheck";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/formatting" component={Formatting} />
          <Route path="/about" component={About} />
          <Route path="/text-check" component={TextCheck} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
