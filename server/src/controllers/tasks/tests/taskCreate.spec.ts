import { authContext, requestContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { create } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    create({
      title: 'My New Task',
      startDate: '2024-11-11',
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should create a persisted task', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const { create } = createCaller(authContext({ db }, user))

  // ACT
  const taskReturned = await create({
    title: 'New Task',
    startDate: '2024-11-11',
  })

  // ASSERT
  expect(taskReturned).toMatchObject({
    id: expect.any(Number),
    completedAt: null,
    assignedUserId: null,
    categoryId: null,
    isCompleted: false,
    createdByUserId: user.id,
    description: null,
    groupId: null,
    importance: null,
    points: null,
    startDate: expect.any(Date),
    isFullDayEvent: false,
    startTime: null,
    title: 'New Task',
  })

  const [taskCreated] = await selectAll(db, 'tasks', (eb) =>
    eb('id', '=', taskReturned.id)
  )

  expect(taskCreated).toMatchObject(taskReturned)
})
