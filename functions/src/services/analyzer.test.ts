import { describe, it, expect } from 'vitest'
import {
  detectStack,
  detectCloudProvider,
  detectInfraFiles,
  detectCodecov,
  type TreeEntry,
} from './analyzer.js'

function blob(path: string): TreeEntry {
  return { path, type: 'blob' }
}

function tree(path: string): TreeEntry {
  return { path, type: 'tree' }
}

// ── detectStack ─────────────────────────────────────────────────────────────

describe('detectStack', () => {
  it('detects Node.js from package.json', () => {
    const result = detectStack([blob('package.json'), blob('index.js')])
    expect(result).toContain('Node.js')
  })

  it('detects React and TypeScript from package.json deps', () => {
    const result = detectStack([blob('package.json')], {
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
      devDependencies: { typescript: '^5.0.0', vite: '^5.0.0', tailwindcss: '^3.0.0' },
    })
    expect(result).toContain('Node.js')
    expect(result).toContain('React')
    expect(result).toContain('TypeScript')
    expect(result).toContain('Vite')
    expect(result).toContain('Tailwind CSS')
  })

  it('detects Go from go.mod', () => {
    const result = detectStack([blob('go.mod'), blob('main.go')])
    expect(result).toContain('Go')
  })

  it('detects Python from requirements.txt', () => {
    const result = detectStack([blob('requirements.txt'), blob('app.py')])
    expect(result).toContain('Python')
  })

  it('detects Python from pyproject.toml', () => {
    const result = detectStack([blob('pyproject.toml')])
    expect(result).toContain('Python')
  })

  it('detects Rust from Cargo.toml', () => {
    const result = detectStack([blob('Cargo.toml'), blob('src/main.rs')])
    expect(result).toContain('Rust')
  })

  it('detects Java from pom.xml', () => {
    const result = detectStack([blob('pom.xml')])
    expect(result).toContain('Java')
  })

  it('detects Ruby and Rails', () => {
    const result = detectStack([blob('Gemfile'), blob('config/routes.rb'), blob('config/application.rb')])
    expect(result).toContain('Ruby')
    expect(result).toContain('Rails')
  })

  it('detects Docker', () => {
    const result = detectStack([blob('Dockerfile'), blob('docker-compose.yml')])
    expect(result).toContain('Docker')
  })

  it('detects Kubernetes and Helm', () => {
    const result = detectStack([blob('Chart.yaml'), blob('helm/values.yaml')])
    expect(result).toContain('Kubernetes')
    expect(result).toContain('Helm')
  })

  it('detects Terraform', () => {
    const result = detectStack([blob('terraform/main.tf'), blob('terraform/variables.tf')])
    expect(result).toContain('Terraform')
  })

  it('detects multiple stacks', () => {
    const result = detectStack(
      [blob('package.json'), blob('Dockerfile'), blob('terraform/main.tf')],
      { dependencies: { react: '^18.0.0' }, devDependencies: { typescript: '^5.0.0' } },
    )
    expect(result).toContain('Node.js')
    expect(result).toContain('React')
    expect(result).toContain('TypeScript')
    expect(result).toContain('Docker')
    expect(result).toContain('Terraform')
  })

  it('returns empty array for unknown stack', () => {
    const result = detectStack([blob('README.md'), blob('LICENSE')])
    expect(result).toEqual([])
  })

  it('detects Express backend', () => {
    const result = detectStack([blob('package.json')], {
      dependencies: { express: '^4.18.0' },
    })
    expect(result).toContain('Express')
  })

  it('detects Apache Airflow in Python project', () => {
    const result = detectStack([blob('requirements.txt'), blob('dags/airflow_dag.py')])
    expect(result).toContain('Python')
    expect(result).toContain('Apache Airflow')
  })

  it('detects dbt', () => {
    const result = detectStack([blob('requirements.txt'), blob('dbt_project.yml')])
    expect(result).toContain('dbt')
  })
})

// ── detectCloudProvider ─────────────────────────────────────────────────────

describe('detectCloudProvider', () => {
  it('detects GCP from Terraform provider', () => {
    expect(detectCloudProvider([], 'provider "google" {\n  project = "my-project"\n}')).toBe('gcp')
  })

  it('detects GCP from google-beta provider', () => {
    expect(detectCloudProvider([], 'provider "google-beta" {}')).toBe('gcp')
  })

  it('detects AWS from Terraform provider', () => {
    expect(detectCloudProvider([], 'provider "aws" {\n  region = "us-east-1"\n}')).toBe('aws')
  })

  it('detects Azure from Terraform provider', () => {
    expect(detectCloudProvider([], 'provider "azurerm" {}')).toBe('azure')
  })

  it('detects GCP from app.yaml', () => {
    expect(detectCloudProvider([blob('app.yaml')])).toBe('gcp')
  })

  it('detects GCP from cloudbuild.yaml', () => {
    expect(detectCloudProvider([blob('cloudbuild.yaml')])).toBe('gcp')
  })

  it('detects AWS from buildspec.yml', () => {
    expect(detectCloudProvider([blob('buildspec.yml')])).toBe('aws')
  })

  it('detects AWS from serverless.yml', () => {
    expect(detectCloudProvider([blob('serverless.yml')])).toBe('aws')
  })

  it('detects AWS from SAM config', () => {
    expect(detectCloudProvider([blob('samconfig.toml')])).toBe('aws')
  })

  it('detects Azure from azure-pipelines.yml', () => {
    expect(detectCloudProvider([blob('azure-pipelines.yml')])).toBe('azure')
  })

  it('returns unknown when no signals', () => {
    expect(detectCloudProvider([blob('README.md')])).toBe('unknown')
  })

  it('prioritizes Terraform over file-based detection', () => {
    // Has both GCP files and AWS Terraform — Terraform wins
    expect(detectCloudProvider([blob('app.yaml')], 'provider "aws" {}')).toBe('aws')
  })
})

// ── detectInfraFiles ────────────────────────────────────────────────────────

describe('detectInfraFiles', () => {
  it('detects GitHub Actions workflows', () => {
    const result = detectInfraFiles([blob('.github/workflows/ci.yml'), blob('.github/workflows/deploy.yml')])
    expect(result).toContain('.github/workflows/ci.yml')
    expect(result).toContain('.github/workflows/deploy.yml')
  })

  it('detects Dockerfile', () => {
    const result = detectInfraFiles([blob('Dockerfile')])
    expect(result).toContain('Dockerfile')
  })

  it('detects Terraform files', () => {
    const result = detectInfraFiles([blob('terraform/main.tf'), blob('terraform/variables.tf')])
    expect(result).toContain('terraform/main.tf')
    expect(result).toContain('terraform/variables.tf')
  })

  it('detects root-level .tf files', () => {
    const result = detectInfraFiles([blob('main.tf')])
    expect(result).toContain('main.tf')
  })

  it('detects docker-compose', () => {
    const result = detectInfraFiles([blob('docker-compose.yml')])
    expect(result).toContain('docker-compose.yml')
  })

  it('detects dependabot config', () => {
    const result = detectInfraFiles([blob('.github/dependabot.yml')])
    expect(result).toContain('.github/dependabot.yml')
  })

  it('detects codecov config', () => {
    const result = detectInfraFiles([blob('codecov.yml')])
    expect(result).toContain('codecov.yml')
  })

  it('ignores non-blob entries', () => {
    const result = detectInfraFiles([tree('.github/workflows')])
    expect(result).toEqual([])
  })

  it('ignores unrelated files', () => {
    const result = detectInfraFiles([blob('src/index.ts'), blob('README.md'), blob('package.json')])
    expect(result).toEqual([])
  })

  it('returns sorted results', () => {
    const result = detectInfraFiles([
      blob('terraform/main.tf'),
      blob('Dockerfile'),
      blob('.github/workflows/ci.yml'),
    ])
    expect(result).toEqual([
      '.github/workflows/ci.yml',
      'Dockerfile',
      'terraform/main.tf',
    ])
  })
})

// ── detectCodecov ───────────────────────────────────────────────────────────

describe('detectCodecov', () => {
  it('detects from codecov.yml', () => {
    expect(detectCodecov([blob('codecov.yml')])).toBe(true)
  })

  it('detects from .codecov.yml', () => {
    expect(detectCodecov([blob('.codecov.yml')])).toBe(true)
  })

  it('detects from .github/codecov.yml', () => {
    expect(detectCodecov([blob('.github/codecov.yml')])).toBe(true)
  })

  it('detects from package.json dependency', () => {
    expect(detectCodecov([blob('package.json')], { devDependencies: { codecov: '^3.0.0' } })).toBe(true)
  })

  it('returns false when no codecov signals', () => {
    expect(detectCodecov([blob('package.json'), blob('README.md')])).toBe(false)
  })
})
