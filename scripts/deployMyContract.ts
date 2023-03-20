import { toNano } from 'ton-core';
import { MyContract } from '../wrappers/MyContract';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const owner = provider.sender().address;
    if (owner === undefined) {
        throw new Error('Must know owner address');
    }

    const myContract = provider.open(await MyContract.fromInit(owner));

    await myContract.send(provider.sender(), { value: toNano('0.05') }, {
        $$type: 'Deploy',
        queryId: 0n,
    });

    await provider.waitForDeploy(myContract.address);

    // run methods on `myContract`
}
