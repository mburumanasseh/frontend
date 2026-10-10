import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import WhatsAppButton from '../components/layout/WhatsAppButton'
import honeycombImage from '../assets/honeycomb2.jpg'
import './CustomerLayout.css'

function CustomerLayout() {
  return (
    <>
      <Navbar />

      <main
        className="customer-layout"
        style={{ '--honeycomb-background': `url(${honeycombImage})` }}
      >
        <div className="customer-layout__overlay">
          <Outlet />
        </div>
      </main>

      <WhatsAppButton />
    </>
  )
}

export default CustomerLayout