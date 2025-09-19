// Types pour l'API Bayrou Meter

export interface User {
  id: string;
  pseudo: string;
  email: string;
}

export interface CreateUserRequest {
  pseudo: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  status: 'success';
  user: User;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  status: 'success';
  user: User;
}

export interface Vote {
  id: string;
  user: {
    id: string;
    pseudo: string;
  };
  choice: 'oui' | 'non';
  question: string;
  created_at: string;
}

export interface SubmitVoteRequest {
  user_id: string;
  choice: 'oui' | 'non';
}

export interface SubmitVoteResponse {
  status: 'success';
  vote: {
    id: string;
    user_id: string;
    choice: 'oui' | 'non';
    question: string;
  };
}

export interface VoteStats {
  oui: number;
  non: number;
  total: number;
  oui_percentage: number;
  non_percentage: number;
}

export interface GetVotesResponse {
  votes: Array<Vote>;
  stats: VoteStats;
  question: string;
}

export interface ApiError {
  error: string;
}
