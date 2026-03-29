import type {
  CloudProvider,
  RegisteredRepository,
  RepositoryAnalysis,
} from '../../../shared/types/repository.js'
import { getRepo, getTree, getFileContent } from './github.js'

export interface TreeEntry {
  path: string
  type: string
}

// ── Stack detection ─────────────────────────────────────────────────────────

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export function detectStack(tree: TreeEntry[], packageJson?: PackageJson | null): string[] {
  const paths = new Set(tree.map((e) => e.path))
  const stack: string[] = []

  // Node.js / JavaScript ecosystem
  if (paths.has('package.json')) {
    stack.push('Node.js')

    if (packageJson) {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      if (allDeps['typescript']) stack.push('TypeScript')
      if (allDeps['react'] || allDeps['react-dom']) stack.push('React')
      if (allDeps['vue']) stack.push('Vue')
      if (allDeps['@angular/core']) stack.push('Angular')
      if (allDeps['next']) stack.push('Next.js')
      if (allDeps['vite']) stack.push('Vite')
      if (allDeps['tailwindcss']) stack.push('Tailwind CSS')
      if (allDeps['express']) stack.push('Express')
      if (allDeps['fastify']) stack.push('Fastify')
      if (allDeps['hono']) stack.push('Hono')
    }
  }

  // Go
  if (paths.has('go.mod') || paths.has('go.sum')) {
    stack.push('Go')
  }

  // Python
  if (paths.has('requirements.txt') || paths.has('pyproject.toml') || paths.has('setup.py') || paths.has('Pipfile')) {
    stack.push('Python')
    if (tree.some((e) => e.path.includes('airflow'))) stack.push('Apache Airflow')
    if (paths.has('dbt_project.yml')) stack.push('dbt')
  }

  // Rust
  if (paths.has('Cargo.toml')) {
    stack.push('Rust')
  }

  // Java
  if (paths.has('pom.xml') || paths.has('build.gradle') || paths.has('build.gradle.kts')) {
    stack.push('Java')
  }

  // Ruby
  if (paths.has('Gemfile')) {
    stack.push('Ruby')
    if (paths.has('config/routes.rb') || paths.has('config/application.rb')) stack.push('Rails')
  }

  // Docker
  if (paths.has('Dockerfile') || paths.has('docker-compose.yml') || paths.has('docker-compose.yaml')) {
    stack.push('Docker')
  }

  // Kubernetes / Helm
  if (paths.has('Chart.yaml') || tree.some((e) => e.path.startsWith('helm/'))) {
    stack.push('Kubernetes')
    stack.push('Helm')
  } else if (tree.some((e) => e.path.endsWith('.yaml') && e.path.includes('k8s'))) {
    stack.push('Kubernetes')
  }

  // Terraform
  if (tree.some((e) => e.path.endsWith('.tf'))) {
    stack.push('Terraform')
  }

  return stack
}

// ── Cloud provider detection ────────────────────────────────────────────────

export function detectCloudProvider(tree: TreeEntry[], tfContent?: string | null): CloudProvider {
  const paths = new Set(tree.map((e) => e.path))

  // Check Terraform provider blocks first (most reliable)
  if (tfContent) {
    if (/provider\s+"google"/.test(tfContent) || /provider\s+"google-beta"/.test(tfContent)) return 'gcp'
    if (/provider\s+"aws"/.test(tfContent)) return 'aws'
    if (/provider\s+"azurerm"/.test(tfContent)) return 'azure'
  }

  // GCP-specific files
  if (paths.has('app.yaml') || paths.has('app.yml') || paths.has('cloudbuild.yaml') || paths.has('cloudbuild.yml')) {
    return 'gcp'
  }

  // AWS-specific files
  if (paths.has('buildspec.yml') || paths.has('buildspec.yaml') || paths.has('samconfig.toml') || paths.has('template.yaml')) {
    return 'aws'
  }
  if (paths.has('serverless.yml') || paths.has('serverless.yaml')) {
    return 'aws'
  }

  // Azure-specific files
  if (paths.has('azure-pipelines.yml') || paths.has('azure-pipelines.yaml')) {
    return 'azure'
  }

  return 'unknown'
}

// ── Infra file detection ────────────────────────────────────────────────────

const INFRA_PATTERNS = [
  /^\.github\/workflows\/.+/,
  /^\.github\/dependabot\.ya?ml$/,
  /^Dockerfile$/,
  /^docker-compose\.ya?ml$/,
  /^\.dockerignore$/,
  /^terraform\/.+\.tf$/,
  /^[^/]+\.tf$/,
  /^helm\/.+/,
  /^Chart\.yaml$/,
  /^k8s\/.+/,
  /^cloudbuild\.ya?ml$/,
  /^buildspec\.ya?ml$/,
  /^serverless\.ya?ml$/,
  /^app\.ya?ml$/,
  /^azure-pipelines\.ya?ml$/,
  /^\.coveragerc$/,
  /^codecov\.ya?ml$/,
  /^\.codecov\.ya?ml$/,
  /^\.github\/codecov\.ya?ml$/,
]

export function detectInfraFiles(tree: TreeEntry[]): string[] {
  return tree
    .filter((e) => e.type === 'blob' && INFRA_PATTERNS.some((p) => p.test(e.path)))
    .map((e) => e.path)
    .sort()
}

// ── Coverage detection ──────────────────────────────────────────────────────

export function detectCodecov(tree: TreeEntry[], packageJson?: PackageJson | null): boolean {
  const paths = new Set(tree.map((e) => e.path))
  if (paths.has('codecov.yml') || paths.has('codecov.yaml') || paths.has('.codecov.yml') || paths.has('.codecov.yaml')) {
    return true
  }
  if (paths.has('.github/codecov.yml') || paths.has('.github/codecov.yaml')) {
    return true
  }
  if (packageJson?.devDependencies?.['codecov'] || packageJson?.dependencies?.['codecov']) {
    return true
  }
  return false
}

// ── Orchestrator ────────────────────────────────────────────────────────────

export async function analyzeRepository(
  owner: string,
  repo: string,
  githubUrl: string,
): Promise<RegisteredRepository> {
  // 1. Validate repo and get metadata
  const repoData = await getRepo(owner, repo)
  const defaultBranch = repoData.default_branch
  const treeSha = repoData.default_branch

  // 2. Get full file tree
  const treeData = await getTree(owner, repo, treeSha)
  if (treeData.truncated) {
    console.warn(`Tree truncated for ${owner}/${repo} — analysis may be incomplete`)
  }
  const tree: TreeEntry[] = (treeData.tree as TreeEntry[]).filter((e) => e.path !== undefined)

  // 3. Selectively fetch key files for deeper analysis
  const hasPackageJson = tree.some((e) => e.path === 'package.json')
  let packageJson: PackageJson | null = null
  if (hasPackageJson) {
    const content = await getFileContent(owner, repo, 'package.json')
    if (content) {
      try {
        packageJson = JSON.parse(content)
      } catch {
        // ignore malformed package.json
      }
    }
  }

  const firstTfFile = tree.find((e) => e.path.endsWith('.tf') && e.type === 'blob')
  let tfContent: string | null = null
  if (firstTfFile) {
    // Try to read main.tf first, fall back to first .tf file
    const mainTf = tree.find((e) => e.path.endsWith('main.tf'))
    tfContent = await getFileContent(owner, repo, mainTf?.path ?? firstTfFile.path)
  }

  // 4. Run detectors
  const detectedStack = detectStack(tree, packageJson)
  const cloudProvider = detectCloudProvider(tree, tfContent)
  const infraFiles = detectInfraFiles(tree)
  const hasGithubActions = tree.some((e) => e.path.startsWith('.github/workflows/'))
  const hasDependabot = tree.some((e) => e.path === '.github/dependabot.yml' || e.path === '.github/dependabot.yaml')
  const hasCodecov = detectCodecov(tree, packageJson)

  // 5. Build response
  const analysis: RepositoryAnalysis = {
    analyzedAt: new Date().toISOString(),
    detectedStack,
    cloudProvider,
    cloudAccountId: null,
    hasGithubActions,
    hasDependabot,
    hasCodecov,
    infraFiles,
  }

  return {
    id: `repo-${Date.now()}`,
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    githubUrl,
    defaultBranch,
    registeredAt: new Date().toISOString(),
    status: 'ready',
    analysis,
  }
}
