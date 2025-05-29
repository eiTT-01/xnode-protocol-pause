import React from 'react';
import {  APP_TITLE,  XNODE_CONTRACT_ADDRESS, AUCTION_CONTRACT_ADDRESS } from '~/config';
import { useWallet, useConnex } from '@vechain/dapp-kit-react';
import { Clause, Address, ABIContract } from '@vechain/sdk-core';
import Transaction from './Transaction';
import Error from '~/common/Error';
import ContractPaused from './ContractPaused';

export default function XnodeMgt() {
    // get the connected wallet
    const { account } = useWallet();

    // and access to connex for interaction with vechain
    const connex = useConnex()

    // state for sending status
    const [txId, setTxId] = React.useState<string>('')
    const [error, setError] = React.useState<string>('')

    const handlePause = async () => {
        if (!account) { return }

        try {
            setError('')

            const pauseABI = ABIContract.ofAbi([
                {
                    "constant": false,
                    "inputs": [],
                    "name": "pause",
                    "outputs": [
                        {
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ]).getFunction('pause')
            const clauses = [
                {
                    ...(
                        Clause.callFunction(Address.of(XNODE_CONTRACT_ADDRESS), pauseABI, [])
                    ),
                    comment: 'Pause ThorNode Contract',
                },
                {
                    ...(
                        Clause.callFunction(Address.of(AUCTION_CONTRACT_ADDRESS), pauseABI, [])
                    ),
                    comment: 'Pause ThorNode Auction Contract',
                }
            ]

            // build a transaction for the given clauses
            const tx = connex.vendor.sign('tx', clauses)

                // requesting a specific signer will prevent the user from changing the signer to another wallet than the signed in one, preventing confusion
                .signer(account)

            // ask the user to sign the transaction
            const { txid } = await tx.request()

            // the resulting transaction id is stored to check for its status later
            setTxId(txid)
        }
        catch (err) {
            setError(String(err))
        }
    }

    if (!account) { return 'Please connect your wallet to continue.' }

    return (
        <div className='space-y-4 max-w-2xl'>
            <div className='text-xl font-semibold'>{APP_TITLE}</div>

            <div>
                <div className="space-y-2">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">ThorNode Contract</h3>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex flex-col">
                                <span className="font-medium">Address: {XNODE_CONTRACT_ADDRESS}</span>
                                <ContractPaused address={XNODE_CONTRACT_ADDRESS} />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold">Auction Contract</h3>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex flex-col">
                                <span className="font-medium">Address: {AUCTION_CONTRACT_ADDRESS}</span>
                                <ContractPaused address={AUCTION_CONTRACT_ADDRESS} />
                            </div>
                        </div>

                        <div>
                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handlePause}
                                >
                                Pause Protocol
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {Boolean(error) && <Error>{error}</Error>}
            <Transaction txId={txId} />
        </div>
    )
}