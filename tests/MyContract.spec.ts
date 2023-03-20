import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { MyContract } from '../wrappers/MyContract';
import '@ton-community/test-utils';

describe('MyContract', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let myContract: SandboxContract<MyContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');

        myContract = blockchain.openContract(
            await MyContract.fromInit(owner.address)
        );

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await myContract.send(deployer.getSender(), {
            value: toNano('0.05'),
        }, {
            $$type: 'Deploy',
            queryId: 0n,
        });

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: myContract.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and myContract are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const counterBefore = await myContract.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = BigInt(Math.floor(Math.random() * 100));

            console.log('increasing by', increaseBy);

            const increaseResult = await myContract.send(owner.getSender(), {
                value: toNano('0.05'),
            }, {
                $$type: 'Add',
                amount: increaseBy,
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: owner.address,
                to: myContract.address,
                success: true,
            });

            const counterAfter = await myContract.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
