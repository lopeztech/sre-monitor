import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function getRepo(owner: string, repo: string) {
  const response = await octokit.repos.get({ owner, repo })
  return response.data
}

export async function getTree(owner: string, repo: string, treeSha: string) {
  const response = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: 'true',
  })
  return response.data
}

export async function getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const response = await octokit.repos.getContent({ owner, repo, path })
    const data = response.data
    if ('content' in data && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }
    return null
  } catch {
    return null
  }
}

export async function listWorkflows(owner: string, repo: string) {
  const response = await octokit.actions.listRepoWorkflows({
    owner,
    repo,
    per_page: 100,
  })
  return response.data.workflows
}

export async function listWorkflowRuns(
  owner: string,
  repo: string,
  workflowId: number,
  options: { per_page?: number; page?: number } = {},
) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const response = await octokit.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowId,
    created: `>=${sevenDaysAgo.toISOString().split('T')[0]}`,
    per_page: options.per_page ?? 100,
    page: options.page ?? 1,
  })
  return response.data.workflow_runs
}
