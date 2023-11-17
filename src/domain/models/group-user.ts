export type Permission = 'owner' | 'admin' | 'user'

export class GroupUser {
  readonly id: string
  readonly permission: Permission

  constructor (
    { id, permission }: { id: string, permission: 'owner' | 'admin' | 'user' }
  ) {
    this.id = id
    this.permission = permission
  }

  isAdmin (): boolean {
    return this.permission !== 'user'
  }
}
