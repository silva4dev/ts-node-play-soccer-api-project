import type { Group } from '@/src/domain/models'
import type { LoadGroupRepository } from '@/src/domain/repositories'

export class LoadGroupRepositorySpy implements LoadGroupRepository {
  eventId?: string
  callsCount = 0
  output?: Group = {
    users: [{ id: 'any_user_id', permission: 'admin' }]
  }

  async load ({ eventId }: { eventId: string }): Promise<Group | undefined> {
    this.eventId = eventId
    this.callsCount++

    return this.output
  }
}
