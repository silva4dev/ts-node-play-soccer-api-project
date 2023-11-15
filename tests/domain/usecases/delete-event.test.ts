import type { Group } from '@/src/domain/models'
import type { DeleteEventRepository, LoadGroupRepository, DeleteMatchRepository } from '@/src/domain/repositories'

class DeleteEvent {
  constructor (
    private readonly loadGroupRepository: LoadGroupRepository,
    private readonly deleteEventRepository: DeleteEventRepository,
    private readonly deleteMatchRepository: DeleteMatchRepository
  ) { }

  async perform ({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepository.load({ eventId: id })
    if (group === undefined) throw new Error()
    if (group.users.find((user) => user.id === userId) === undefined) throw new Error()
    if (group.users.find((user) => user.id === userId)?.permission === 'user') throw new Error()

    await this.deleteEventRepository.delete({ id })
    await this.deleteMatchRepository.delete({ eventId: id })
  }
}

class LoadGroupRepositorySpy implements LoadGroupRepository {
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

class DeleteEventRepositoryMock implements DeleteEventRepository {
  id?: string
  callsCount = 0

  async delete ({ id }: { id: string }): Promise<void> {
    this.id = id
    this.callsCount++
  }
}

class DeleteMatchRepositoryMock implements DeleteMatchRepository {
  eventId?: string
  callsCount = 0

  async delete ({ eventId }: { eventId: string }): Promise<void> {
    this.eventId = eventId
    this.callsCount++
  }
}

type SutTypes = {
  sut: DeleteEvent
  loadGroupRepository: LoadGroupRepositorySpy
  deleteEventRepository: DeleteEventRepositoryMock
  deleteMatchRepository: DeleteMatchRepositoryMock
}

const makeSut = (): SutTypes => {
  const loadGroupRepository = new LoadGroupRepositorySpy()
  const deleteEventRepository = new DeleteEventRepositoryMock()
  const deleteMatchRepository = new DeleteMatchRepositoryMock()
  const sut = new DeleteEvent(loadGroupRepository, deleteEventRepository, deleteMatchRepository)

  return {
    sut,
    loadGroupRepository,
    deleteEventRepository,
    deleteMatchRepository
  }
}

describe('DeleteEvent', () => {
  const id = 'any_event_id'
  const userId = 'any_user_id'

  it('should get group data', async () => {
    const { sut, loadGroupRepository } = makeSut()

    await sut.perform({ id, userId })

    expect(loadGroupRepository.eventId).toBe(id)
    expect(loadGroupRepository.callsCount).toBe(1)
  })

  it('should throw if eventId is invalid', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = undefined

    const promise = sut.perform({ id, userId })

    await expect(promise).rejects.toThrowError()
  })

  it('should throw if userId is invalid', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'admin' }]
    }

    const promise = sut.perform({ id, userId: 'invalid_id' })

    await expect(promise).rejects.toThrowError()
  })

  it('should throw if permission is user', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'user' }]
    }

    const promise = sut.perform({ id, userId })
    await expect(promise).rejects.toThrowError()
  })

  it('should not throw if permission is admin', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'admin' }]
    }

    const promise = sut.perform({ id, userId })
    await expect(promise).resolves.not.toThrowError()
  })

  it('should not throw if permission is owner', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'owner' }]
    }

    const promise = sut.perform({ id, userId })
    await expect(promise).resolves.not.toThrowError()
  })

  it('should delete event', async () => {
    const { sut, deleteEventRepository } = makeSut()

    await sut.perform({ id, userId })

    expect(deleteEventRepository.id).toBe(id)
    expect(deleteEventRepository.callsCount).toBe(1)
  })

  it('should delete matches', async () => {
    const { sut, deleteMatchRepository } = makeSut()

    await sut.perform({ id, userId })

    expect(deleteMatchRepository.eventId).toBe(id)
    expect(deleteMatchRepository.callsCount).toBe(1)
  })
})
