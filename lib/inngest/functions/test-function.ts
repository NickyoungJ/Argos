import { inngest } from '../client'

export const testFunction = inngest.createFunction(
  { 
    id: 'test-function',
    name: 'Test Inngest Connection'
  },
  { event: 'test/event' },
  async ({ event, step }) => {
    await step.run('log-test-event', async () => {
      console.log('✅ Inngest 테스트 이벤트 수신:', event.data)
      return { 
        received: true, 
        message: event.data.message,
        timestamp: event.data.timestamp
      }
    })

    await step.run('wait-test', async () => {
      console.log('⏳ 3초 대기 중...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      console.log('✅ 대기 완료!')
      return { waited: true }
    })

    return { 
      success: true,
      message: 'Inngest 테스트 완료!'
    }
  }
)
