import { Download } from 'lucide-react'
import { Button } from './button'

interface ExportButtonProps {
  onClick: () => void
  label?: string
}

export function ExportButton({ onClick, label = 'Export CSV' }: ExportButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Download size={13} />
      {label}
    </Button>
  )
}
