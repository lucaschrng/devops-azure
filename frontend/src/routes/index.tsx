import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import VoteForm from '../components/VoteForm'
import VoteResults from '../components/VoteResults'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  const handleLogout = () => {
    setCurrentUser(null)
    setHasVoted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        currentUser={currentUser} 
        onUserCreated={handleUserCreated}
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
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

          {/* Étape 2: Vote */}
          {currentUser && !hasVoted && (
            <section>
              <VoteForm user={currentUser} onVoteSubmitted={handleVoteSubmitted} />
            </section>
          )}

          {/* Étape 3: Confirmation et bouton pour nouveau vote */}
          {currentUser && hasVoted && (
            <section>
              <Card className="max-w-md mx-auto text-center">
                <CardHeader>
                  <div className="text-green-600 text-5xl mb-4">✅</div>
                  <CardTitle className="text-2xl">Vote enregistré !</CardTitle>
                  <CardDescription>
                    Merci {currentUser.pseudo} pour votre participation.
                    Découvrez les résultats ci-dessous.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNewUser} className="w-full">
                    Nouveau vote
                  </Button>
                </CardContent>
              </Card>
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
