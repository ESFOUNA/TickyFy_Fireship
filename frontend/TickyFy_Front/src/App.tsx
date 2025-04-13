import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import Navbar from './components/Navbar';
import RoutesConfig from './routes';
import { CartProvider } from './context/CartContext';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const App = () => (
  <CartProvider>
    <BrowserRouter>
      <Navbar />
      <RoutesConfig />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  </CartProvider>
);

export default App;