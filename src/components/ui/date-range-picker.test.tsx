import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker } from './date-range-picker'

describe('DateRangePicker', () => {
  it('renders Custom button', () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onRangeChange={vi.fn()}
        onClear={vi.fn()}
        isActive={false}
      />,
    )
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('shows date range when active', () => {
    render(
      <DateRangePicker
        startDate="2026-01-01"
        endDate="2026-01-31"
        onRangeChange={vi.fn()}
        onClear={vi.fn()}
        isActive={true}
      />,
    )
    expect(screen.getByText(/01-01/)).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onRangeChange={vi.fn()}
        onClear={vi.fn()}
        isActive={false}
      />,
    )
    await userEvent.click(screen.getByText('Custom'))
    expect(screen.getByText('Start date')).toBeInTheDocument()
    expect(screen.getByText('End date')).toBeInTheDocument()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('shows clear button when active', async () => {
    render(
      <DateRangePicker
        startDate="2026-01-01"
        endDate="2026-01-31"
        onRangeChange={vi.fn()}
        onClear={vi.fn()}
        isActive={true}
      />,
    )
    await userEvent.click(screen.getByText(/01-01/))
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('calls onClear when clear is clicked', async () => {
    const onClear = vi.fn()
    render(
      <DateRangePicker
        startDate="2026-01-01"
        endDate="2026-01-31"
        onRangeChange={vi.fn()}
        onClear={onClear}
        isActive={true}
      />,
    )
    await userEvent.click(screen.getByText(/01-01/))
    await userEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
