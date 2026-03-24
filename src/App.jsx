import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { useNotificationSocket } from './hooks/useNotificationSocket'

const App = () => {
  const { user } = useAuth();

  // Initialize socket connection and join notification room when user is logged in
  useNotificationSocket(user);

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={7000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App