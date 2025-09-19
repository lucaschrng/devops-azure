import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiMutations } from '../lib/api'
import type { User } from '../types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">
          Bonjour {user.pseudo} !
        </CardTitle>
        <CardDescription className="text-lg">
          Voici la question qui nous préoccupe tous...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-center">
              Est-ce que François Bayrou nous manque ?
            </h3>
          </CardContent>
        </Card>

        {submitVoteMutation.error && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
            {submitVoteMutation.error.message}
          </div>
        )}

        <div className="flex gap-6 justify-center">
          <Button
            onClick={() => handleVote('oui')}
            disabled={submitVoteMutation.isPending}
            className="flex-1 max-w-xs h-16 text-xl font-semibold bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105"
            size="lg"
          >
            {submitVoteMutation.isPending ? '...' : '✅ OUI'}
          </Button>

          <Button
            onClick={() => handleVote('non')}
            disabled={submitVoteMutation.isPending}
            className="flex-1 max-w-xs h-16 text-xl font-semibold bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105"
            size="lg"
          >
            {submitVoteMutation.isPending ? '...' : '❌ NON'}
          </Button>
        </div>

        {submitVoteMutation.isPending && (
          <div className="text-center">
            <p className="text-muted-foreground">Enregistrement de votre vote...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
