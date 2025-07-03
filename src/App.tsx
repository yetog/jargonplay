import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ImportPage } from './pages/ImportPage';
import { WordSearchGame } from './pages/WordSearchGame';
import { CrosswordGame } from './pages/CrosswordGame';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/import/:type" element={<ImportPage />} />
          <Route path="/game/wordsearch" element={<WordSearchGame />} />
          <Route path="/game/crossword" element={<CrosswordGame />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;