import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><span>Content</span></Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<CardHeader title="Title" subtitle="Subtitle" />)
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
  })

  it('renders action', () => {
    render(<CardHeader title="Title" action={<button>Action</button>} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body</CardContent>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})
