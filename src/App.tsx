import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import TeamProfile from "./pages/TeamProfile";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import Statistics from "./pages/Statistics";
import { NewsList, NewsDetail } from "./pages/News";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamProfile />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/news" element={<NewsList />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
