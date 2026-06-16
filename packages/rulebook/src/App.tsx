import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RulebookLayout } from './components/RulebookLayout';
import { PackList } from './pages/PackList';
import { PackDetail } from './pages/PackDetail';
import { ContentEditor } from './pages/ContentEditor';
import { ContentBrowser } from './pages/ContentBrowser';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RulebookLayout />}>
          <Route path="/rulebook" element={<PackList />} />
          <Route path="/rulebook/packs/:id" element={<PackDetail />} />
          <Route
            path="/rulebook/editor/:packId/:contentType/:contentId?"
            element={<ContentEditor />}
          />
          <Route path="/rulebook/browse" element={<ContentBrowser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
