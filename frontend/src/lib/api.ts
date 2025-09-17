import type {
  ApiError,
  CreateUserRequest,
  CreateUserResponse,
  GetVotesResponse,
  LoginUserRequest,
  LoginUserResponse,
  SubmitVoteRequest,
  SubmitVoteResponse,
} from '../types/api'

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Une erreur inconnue est survenue')
    }
  }

  // Créer un utilisateur
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    return this.request<CreateUserResponse>('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Connecter un utilisateur existant
  async loginUser(loginData: LoginUserRequest): Promise<LoginUserResponse> {
    return this.request<LoginUserResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  // Soumettre un vote
  async submitVote(voteData: SubmitVoteRequest): Promise<SubmitVoteResponse> {
    return this.request<SubmitVoteResponse>('/vote', {
      method: 'POST',
      body: JSON.stringify(voteData),
    })
  }

  // Récupérer tous les votes avec statistiques
  async getVotes(): Promise<GetVotesResponse> {
    return this.request<GetVotesResponse>('/votes', {
      method: 'GET',
    })
  }
}

// Instance singleton de l'API client
export const apiClient = new ApiClient(API_BASE_URL)

// Fonctions utilitaires pour React Query
export const apiQueries = {
  votes: () => ({
    queryKey: ['votes'],
    queryFn: () => apiClient.getVotes(),
    refetchInterval: 5000, // Actualisation toutes les 5 secondes pour les résultats en temps réel
  }),
}

export const apiMutations = {
  createUser: () => ({
    mutationFn: (userData: CreateUserRequest) => apiClient.createUser(userData),
  }),

  loginUser: () => ({
    mutationFn: (loginData: LoginUserRequest) => apiClient.loginUser(loginData),
  }),
  
  submitVote: () => ({
    mutationFn: (voteData: SubmitVoteRequest) => apiClient.submitVote(voteData),
  }),
}
