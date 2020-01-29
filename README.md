[![npm version](https://badge.fury.io/js/eoslime.svg)](https://badge.fury.io/js/eoslime.svg) 
[![codecov](https://codecov.io/gh/LimeChain/eoslime/branch/master/graph/badge.svg)](https://codecov.io/gh/LimeChain/eoslime)

eoslime-core.js
============

**eoslime-core** is the main SDK used in the eoslime framework. Its goal is to be a general SDK for the EOS blockchain.

Telegram - https://t.me/eoslime   
Documentation - https://lyubo.gitbook.io/eoslime/


# Version 1.0.2 change log

* **Fix ABI Parsing** - https://github.com/LimeChain/eoslime/issues/37
* **Add more flexibility in eoslime initialization**
EOSLIME was able to be initialized only with pre-configured providers connections. Now you can connect eoslime to your chain and keep the pre-configured functionality as the **default account on local network**
    ```javascript
    // New local flexible initialization
    const eoslime = require('eoslime').init('local', { url: 'Your url', chainId: 'Your chainId' });
    const eoslime = require('eoslime').init('jungle', { url: 'Your url', chainId: 'Your chainId' });
    const eoslime = require('eoslime').init('bos', { url: 'Your url', chainId: 'Your chainId' });
    // ... any other supported netwok ...
    ```
* **Allow read-only contracts** - You are able now to instantiate a contract withouth a signer/executor and read the contract's tables
* **Add Tutorial section in the documentation**
* **Describe how examples in the documentation could be run**
* **Increase the code coverage from 46% to 90+ %**

# Version 1.0.1 change log

* **Token** option was added
There are cases, where you need to execute a contract function and pay some tokens, but this could be done by processing two transactions. The first one is to your contract, the second one is to eosio.token contract. But what about if the tokens transfer reverts and the transaction to your contract is successful. That is what payable contract actions are purposed for. You should be able to execute an atomic transaction constructed by both actions above.
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
const ABI_PATH = './contract/contract.abi';

// Pre-created local network accounts
const user1 = eoslime.Account.load('myacc1', 'privateKey1');

let contract = eoslime.Contract.at(ABI_PATH, CONTRACT_NAME, user1);

// Execute `doSmth` and transfer 5.0000 SYS tokens to the contract at once(atomically)
await contract.doSmth('Your args here', { from: user1, tokens: '5.0000 SYS' });
```

* **Scope** was added to the table query chain
If you skip scope, the default one will be set to the from
```javascript
await Provider.select('table').from('contract name').scope('account name').find()
```
