const assert = require('assert');
const eoslime = require('./../');


/*
    You should have running local nodeos in order to run tests
*/

const Networks = {
    bos: {
        name: 'bos',
        url: 'https://hapi.bos.eosrio.io',
        chainId: 'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86'
    },
    local: {
        name: 'local',
        url: 'http://127.0.0.1:8888',
        chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
    },
    worbli: {
        name: 'main',
        url: 'https://eos.greymass.com',
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    },
    jungle: {
        name: 'jungle',
        url: 'https://jungle2.cryptolions.io',
        chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'
    },
    main: {
        name: 'main',
        url: 'https://eos.greymass.com',
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    },
    kylin: {
        name: 'kylin',
        url: 'https://kylin.eoscanada.com',
        chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'
    },
    custom: {
        name: 'custom',
        url: 'https://custom.com',
        chainId: '123'
    },
}


const TOKEN_ABI_PATH = "./tests/testing-contracts/compiled/eosio.token.abi";
const TOKEN_WASM_PATH = "./tests/testing-contracts/compiled/eosio.token.wasm";

const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

describe('Providers', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    describe('Instantiation', function () {
        it('Should instantiate correct instance of Provider', async () => {

            // Local
            const localProvider = eoslime.init().Provider;
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            // Jungle
            const jungleProvider = eoslime.init('jungle').Provider;
            assert(JSON.stringify(jungleProvider.network) == JSON.stringify(Networks.jungle));

            // Worbli
            const worbliProvider = eoslime.init('worbli').Provider;
            assert(JSON.stringify(worbliProvider.network) == JSON.stringify(Networks.worbli));

            // Main
            const mainProvider = eoslime.init('main').Provider;
            assert(JSON.stringify(mainProvider.network) == JSON.stringify(Networks.main));

            // Bos
            const bosProvider = eoslime.init('bos').Provider;
            assert(JSON.stringify(bosProvider.network) == JSON.stringify(Networks.bos));

            // Kylin
            const kylinProvider = eoslime.init('kylin').Provider;
            assert(JSON.stringify(kylinProvider.network) == JSON.stringify(Networks.kylin));

            // Custom
            const customProvider = eoslime.init({ url: Networks.custom.url, chainId: Networks.custom.chainId }).Provider;
            assert(JSON.stringify(customProvider.network) == JSON.stringify(Networks.custom));
        });
    });

    describe('Reset provider', function () {
        it('Should be able to reset the provider', async () => {
            const eoslimeInstance = eoslime.init();

            const localProvider = eoslimeInstance.Provider;
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            const localAccount = await eoslimeInstance.Account.createRandom();
            assert(JSON.stringify(localAccount.provider.network) == JSON.stringify(Networks.local));

            const jungleProvider = new eoslimeInstance.Provider('jungle');
            eoslimeInstance.Provider.reset(jungleProvider);

            assert(JSON.stringify(localAccount.provider.network) == JSON.stringify(Networks.jungle));
            assert(JSON.stringify(eoslimeInstance.Provider.network) == JSON.stringify(Networks.jungle));
        });
    });

    describe('Retrieve table', function () {

        const TOKEN_PRECISION = Math.pow(10, 4);
        const TOTAL_SUPPLY = "1000000000.0000 TKNS";
        const PRODUCED_TOKENS_AMOUNT = '100.0000 TKNS';

        it('Should retrieve table', async () => {
            const eoslimeInstance = eoslime.init();
            const Provider = eoslimeInstance.Provider;

            const tokenContract = await eoslimeInstance.Contract.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
            const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

            await tokenContract.create(faucetContract.name, TOTAL_SUPPLY);
            const tokensHolder = await eoslimeInstance.Account.createRandom();
            await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, "memo");

            // With equal criteria
            const equalResult = await Provider.select('withdrawers').from(faucetContract.name).equal(tokensHolder.name).find();
            assert(equalResult[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(equalResult[0].token_name == tokenContract.name);

            // With range criteria
            const rangeResult = await Provider.select('withdrawers').from(faucetContract.name).range(0, 100 * TOKEN_PRECISION).index(2).find();
            assert(rangeResult[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(rangeResult[0].token_name == tokenContract.name);

            // With limit
            // There is only one withdrawer
            const allWithdrawers = await Provider.select('withdrawers').from(faucetContract.name).limit(10).find();
            assert(allWithdrawers.length == 1);
            assert(allWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(allWithdrawers[0].token_name == tokenContract.name);

            // With different index (By Balance)
            const balanceWithdrawers = await Provider.select('withdrawers').from(faucetContract.name).equal(100 * TOKEN_PRECISION).index(2).find();
            assert(balanceWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(balanceWithdrawers[0].token_name == tokenContract.name);

            // With scope
            const allWithdrawersInScope = await Provider.select('withdrawers').from(faucetContract.name).scope(faucetContract.name).find();
            assert(allWithdrawersInScope.length == 1);
            assert(allWithdrawersInScope[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(allWithdrawersInScope[0].token_name == tokenContract.name);
        });
    });
});
