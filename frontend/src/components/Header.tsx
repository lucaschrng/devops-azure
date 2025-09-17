import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🗳️</span>
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              Bayrou Meter
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link 
              to="/demo/tanstack-query" 
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Demo
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
