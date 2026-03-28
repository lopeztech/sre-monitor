import { repositoryHandlers } from './repositories'
import { costsHandlers } from './costs'
import { pipelinesHandlers } from './pipelines'
import { vulnerabilitiesHandlers } from './vulnerabilities'
import { logsHandlers } from './logs'
import { coverageHandlers } from './coverage'

export const handlers = [
  ...repositoryHandlers,
  ...costsHandlers,
  ...pipelinesHandlers,
  ...vulnerabilitiesHandlers,
  ...logsHandlers,
  ...coverageHandlers,
]
