import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiMutations } from '../lib/api'
import type { User } from '../types/api'

interface VoteFormProps {
  user: User
  onVoteSubmitted: () => void
}

export default function VoteForm({ user, onVoteSubmitted }: VoteFormProps) {
  const queryClient = useQueryClient()

  const submitVoteMutation = useMutation({
    ...apiMutations.submitVote(),
    onSuccess: () => {
      // Invalider et refetch les votes pour mettre à jour les résultats
      queryClient.invalidateQueries({ queryKey: ['votes'] })
      onVoteSubmitted()
    },
  })

  const handleVote = (choice: 'oui' | 'non') => {
    submitVoteMutation.mutate({
      user_id: user.id,
      choice,
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Bonjour {user.pseudo} !
        </h2>
        <p className="text-gray-600">
          Voici la question qui nous préoccupe tous...
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
        <h3 className="text-xl font-semibold text-blue-800 text-center">
          Est-ce que François Bayrou nous manque ?
        </h3>
      </div>

      {submitVoteMutation.error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-6">
          {submitVoteMutation.error.message}
        </div>
      )}

      <div className="flex gap-6 justify-center">
        <button
          onClick={() => handleVote('oui')}
          disabled={submitVoteMutation.isPending}
          className="flex-1 max-w-xs bg-green-600 text-white py-4 px-8 rounded-lg text-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {submitVoteMutation.isPending ? '...' : '✅ OUI'}
        </button>

        <button
          onClick={() => handleVote('non')}
          disabled={submitVoteMutation.isPending}
          className="flex-1 max-w-xs bg-red-600 text-white py-4 px-8 rounded-lg text-xl font-semibold hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {submitVoteMutation.isPending ? '...' : '❌ NON'}
        </button>
      </div>

      {submitVoteMutation.isPending && (
        <div className="text-center mt-6">
          <p className="text-gray-600">Enregistrement de votre vote...</p>
        </div>
      )}
    </div>
  )
}
