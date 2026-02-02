import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
    </>
  )
}

export default App
