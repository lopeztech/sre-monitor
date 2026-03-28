import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './theme-toggle'
import { useThemeStore } from '@/store/themeStore'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' })
  })

  it('renders three buttons', () => {
    render(<ThemeToggle />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('switches to dark mode on click', async () => {
    render(<ThemeToggle />)
    await userEvent.click(screen.getByTitle('Dark'))
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('switches to light mode on click', async () => {
    render(<ThemeToggle />)
    await userEvent.click(screen.getByTitle('Light'))
    expect(useThemeStore.getState().mode).toBe('light')
  })
})
