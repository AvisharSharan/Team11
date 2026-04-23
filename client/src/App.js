import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import TeamManagementPage from './pages/TeamManagementPage';
import AddMemberPage from './pages/AddMemberPage';
import ViewMemberPage from './pages/ViewMemberPage';
import MemberDetailsPage from './pages/MemberDetailsPage';
import useAuthStore from './store/useAuthStore';

const PrivateRoute = ({ children }) => {
    const { user } = useAuthStore();
    return user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route
                    path="/chat"
                    element={
                        <PrivateRoute>
                            <ChatPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/team-management"
                    element={
                        <PrivateRoute>
                            <TeamManagementPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/add-member"
                    element={
                        <PrivateRoute>
                            <AddMemberPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/members"
                    element={
                        <PrivateRoute>
                            <ViewMemberPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/members/:memberId"
                    element={
                        <PrivateRoute>
                            <MemberDetailsPage />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;