import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DispatcherView from './pages/DispatcherView';
import ContractorView from './pages/ContractorView';
import TechView from './pages/TechView';
import Layout from './components/Layout';

import { useEffect } from 'react';
import { useStore } from './store/useStore';

function App() {
    const fetchData = useStore(s => s.fetchData);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/dispatcher" replace />} />
                    <Route path="/dispatcher" element={<DispatcherView />} />
                    <Route path="/contractor" element={<ContractorView />} />
                    <Route path="/tech" element={<TechView />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
