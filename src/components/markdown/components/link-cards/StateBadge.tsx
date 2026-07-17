import { cn } from '@/utils/cn'

/** GitHub's state palette (same hues in light and dark). */
const STATE_COLORS: Record<string, string> = {
  open: '#2da44e',
  merged: '#8250df',
  closed: '#cf222e',
  draft: '#6e7781',
}

/** GitHub shows closed-as-completed issues in purple, closed PRs in red. */
const stateColor = (state: string, kind?: string) =>
  state === 'closed' && kind === 'issue' ? '#8250df' : STATE_COLORS[state]

/** PR / MR / issue state chip, shared by the GitHub and GitLab cards. */
export const StateBadge = ({
  state,
  kind,
}: {
  state: string
  kind?: string
}) => {
  const color = stateColor(state, kind)
  return (
    <span
      className={cn(
        'badge badge-sm border-none capitalize',
        color ? 'text-white' : 'badge-ghost',
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {state}
    </span>
  )
}
