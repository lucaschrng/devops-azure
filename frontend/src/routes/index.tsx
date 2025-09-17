import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import UserForm from '../components/UserForm'
import VoteForm from '../components/VoteForm'
import VoteResults from '../components/VoteResults'
import type { User } from '../types/api'

export const Route = createFileRoute('/')({
  component: BayrouMeterApp,
})

function BayrouMeterApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleUserCreated = (user: User) => {
    setCurrentUser(user)
    setHasVoted(false)
  }

  const handleVoteSubmitted = () => {
    setHasVoted(true)
  }

  const handleNewUser = () => {
    setCurrentUser(null)
    setHasVoted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🗳️ Bayrou Meter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            L'application qui mesure l'opinion publique sur François Bayrou.
            Exprimez votre avis et découvrez ce que pensent les autres !
          </p>
        </div>

        <div className="space-y-12">
          {/* Étape 1: Identification utilisateur */}
          {!currentUser && (
            <section>
              <UserForm onUserCreated={handleUserCreated} />
            </section>
          )}

          {/* Étape 2: Vote */}
          {currentUser && !hasVoted && (
            <section>
              <VoteForm user={currentUser} onVoteSubmitted={handleVoteSubmitted} />
            </section>
          )}

          {/* Étape 3: Confirmation et bouton pour nouveau vote */}
          {currentUser && hasVoted && (
            <section>
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-green-600 text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Vote enregistré !
                </h2>
                <p className="text-gray-600 mb-6">
                  Merci {currentUser.pseudo} pour votre participation.
                  Découvrez les résultats ci-dessous.
                </p>
                <button
                  onClick={handleNewUser}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Nouveau vote
                </button>
              </div>
            </section>
          )}

          {/* Résultats en temps réel */}
          <section>
            <VoteResults />
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>© 2025 Bayrou Meter - Projet DevOps avec Azure Functions & Cosmos DB</p>
        </footer>
      </div>
    </div>
  )
}
