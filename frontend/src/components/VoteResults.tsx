import { useQuery } from '@tanstack/react-query'
import { apiQueries } from '../lib/api'

export default function VoteResults() {
  const { data, isLoading, error } = useQuery(apiQueries.votes())

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center">
          <p>Erreur lors du chargement des résultats</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data || data.stats.total === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Résultats en temps réel
        </h2>
        <div className="text-center text-gray-600">
          <p>Aucun vote pour le moment.</p>
          <p className="text-sm mt-2">Soyez le premier à exprimer votre opinion !</p>
        </div>
      </div>
    )
  }

  const { stats, votes, question } = data

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Résultats en temps réel
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
          {question}
        </h3>

        {/* Statistiques visuelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.oui}</div>
            <div className="text-sm text-green-700">Votes OUI</div>
            <div className="text-lg font-semibold text-green-600">{stats.oui_percentage}%</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.non}</div>
            <div className="text-sm text-red-700">Votes NON</div>
            <div className="text-lg font-semibold text-red-600">{stats.non_percentage}%</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Total des votes</div>
            <div className="text-lg font-semibold text-blue-600">100%</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex rounded-lg overflow-hidden h-8 bg-gray-200">
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
      </div>

      {/* Liste des votes */}
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800">
          Derniers votes ({votes.length})
        </h4>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="font-medium text-gray-900">
                  {vote.user.pseudo}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(vote.created_at).toLocaleString('fr-FR')}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${vote.choice === 'oui'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {vote.choice === 'oui' ? '✅ OUI' : '❌ NON'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Actualisation automatique toutes les 5 secondes
      </div>
    </div>
  )
}
