export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
}

export interface GitHubCallbackRequest {
  code: string
}

export interface GitHubCallbackResponse {
  jwt: string
  user: GitHubUser
}

export interface GitHubVerifyResponse {
  valid: boolean
  user: GitHubUser
}
