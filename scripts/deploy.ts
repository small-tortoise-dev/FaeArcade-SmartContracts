import { toNano } from 'ton-core'
import { Counter } from '../wrappers/Counter'
import { NetworkProvider, compile } from '@ton/blueprint'

export async function run(provider: NetworkProvider) {
  const counter = provider.open(
    await Counter.fromInit(provider.sender()?.address!)
  )

  await counter.send(
    provider.sender(),
    {
      value: toNano('0.1'),
    },
    {
      $$type: 'Deploy',
      queryId: 0n,
    }
  )

  await provider.waitForDeploy(counter.address)

  console.log('Counter deployed at:', counter.address)
} 