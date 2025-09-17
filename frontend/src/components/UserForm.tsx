import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiMutations } from '../lib/api'
import type { User } from '../types/api'

interface UserFormProps {
  onUserCreated: (user: User) => void
}

export default function UserForm({ onUserCreated }: UserFormProps) {
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(false)

  const createUserMutation = useMutation({
    ...apiMutations.createUser(),
    onSuccess: (data) => {
      onUserCreated(data.user)
      setPseudo('')
      setEmail('')
    },
  })

  const loginUserMutation = useMutation({
    ...apiMutations.loginUser(),
    onSuccess: (data) => {
      onUserCreated(data.user)
      setEmail('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoginMode) {
      // Mode login - seulement email requis
      if (email.trim()) {
        loginUserMutation.mutate({ email: email.trim() })
      }
    } else {
      // Mode register - pseudo et email requis
      if (pseudo.trim() && email.trim()) {
        createUserMutation.mutate({ pseudo: pseudo.trim(), email: email.trim() })
      }
    }
  }

  const currentMutation = isLoginMode ? loginUserMutation : createUserMutation

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Identification
      </h2>

      {/* Toggle entre Login et Register */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setIsLoginMode(false)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            !isLoginMode
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          S'inscrire
        </button>
        <button
          type="button"
          onClick={() => setIsLoginMode(true)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            isLoginMode
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Se connecter
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Pseudo - seulement en mode register */}
        {!isLoginMode && (
          <div>
            <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 mb-1">
              Pseudo
            </label>
            <input
              type="text"
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre pseudo"
              required
              disabled={currentMutation.isPending}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={isLoginMode ? "Votre email existant" : "votre@email.com"}
            required
            disabled={currentMutation.isPending}
          />
        </div>

        {currentMutation.error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {currentMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={
            currentMutation.isPending || 
            !email.trim() || 
            (!isLoginMode && !pseudo.trim())
          }
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentMutation.isPending 
            ? (isLoginMode ? 'Connexion...' : 'Inscription...') 
            : (isLoginMode ? 'Se connecter' : 'S\'inscrire')
          }
        </button>
      </form>
    </div>
  )
}
