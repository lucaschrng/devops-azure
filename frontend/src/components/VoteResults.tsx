import { useQuery } from '@tanstack/react-query'
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { apiQueries } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function VoteResults() {
  const { data, isLoading, error } = useQuery(apiQueries.votes())

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-32 bg-muted rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-destructive text-center">
            <p>Erreur lors du chargement des résultats</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.stats.total === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Résultats en temps réel
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Aucun vote pour le moment.</p>
          <p className="text-sm mt-2 text-muted-foreground">Soyez le premier à exprimer votre opinion !</p>
        </CardContent>
      </Card>
    )
  }

  const { stats, votes, question } = data

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Statistiques visuelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center flex flex-col items-center justify-center gap-2 h-full">
            <ThumbsUpIcon size={32} className="text-green-700" />
            <div className="flex items-center gap-2 text-lg text-green-700">
              <span className="font-semibold">{stats.oui}</span>
              <span className="text-base">({stats.oui_percentage}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center flex flex-col items-center justify-center gap-2 h-full">
            <ThumbsDownIcon size={32} className="text-red-700" />
            <div className="flex items-center gap-2 text-lg text-red-700">
              <span className="font-semibold">{stats.non}</span>
              <span className="text-base">({stats.non_percentage}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center flex flex-col items-center justify-center gap-2 h-full">
            <span className="text-lg font-semibold text-blue-700">Total des votes</span>
            <div className="flex items-center gap-2 text-lg text-blue-700">
              <span className="font-semibold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-green-600">OUI: {stats.oui_percentage}%</span>
          <span className="text-red-600">NON: {stats.non_percentage}%</span>
        </div>
        <div className="flex rounded-lg overflow-hidden h-8 bg-muted">
          {stats.oui > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${stats.oui_percentage}%` }}
            >
              {stats.oui_percentage > 15 && `${stats.oui_percentage}%`}
            </div>
          )}
          {stats.non > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${stats.non_percentage}%` }}
            >
              {stats.non_percentage > 15 && `${stats.non_percentage}%`}
            </div>
          )}
        </div>
      </div>

      {/* Liste des votes */}
      <div>
        <h4 className="text-lg font-semibold mb-4">
          Derniers votes ({votes.length})
        </h4>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {votes.map((vote) => (
            <Card key={vote.id} className="bg-muted/50">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">
                      {vote.user.pseudo}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(vote.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  <Badge
                    variant={vote.choice === 'oui' ? 'default' : 'destructive'}
                    className={vote.choice === 'oui' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {vote.choice === 'oui' ? (<>
                      <ThumbsUpIcon size={16} />
                      <span>Oui</span>
                    </>) : (<>
                      <ThumbsDownIcon size={16} />
                      <span>Non</span>
                    </>)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
