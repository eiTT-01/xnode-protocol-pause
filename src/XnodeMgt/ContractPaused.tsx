import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useConnex } from '@vechain/dapp-kit-react';
import { useBeats } from '~/hooks/useBeats';

export default function ContractPaused({ address }: { address: string }) {
    const connex = useConnex();
    const blockChange = useBeats([address]);

    // 查询合约的paused状态
    const { data: isPaused, isLoading, error } = useQuery({
        queryKey: ['contractPaused', address],
        queryFn: async () => {
            try {
                const { decoded } = await connex.thor.account(address).method({
                    "constant": true,
                    "inputs": [],
                    "name": "paused",
                    "outputs": [
                        {
                            "name": "paused",
                            "type": "bool"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                }).call();
                
                return decoded.paused as boolean;
            } catch (err) {
                console.error('Error fetching paused status:', err);
                throw err;
            }
        },
        refetchInterval: 10000, // 每10秒刷新一次
        enabled: Boolean(address), // 只有当address存在时才执行查询
    });

    // 当区块变化时重新获取状态
    React.useEffect(() => {
        if (blockChange && address) {
            // 这里可以触发重新查询，但react-query会自动处理
        }
    }, [blockChange, address]);

    if (isLoading) {
        return (
            <p>
                Status: <span className="mt-1 px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 w-fit">Loading...</span>
            </p>
        );
    }

    if (error) {
        return (
            <p>
                Status: <span className="mt-1 px-2 py-1 text-xs rounded bg-red-100 text-red-800 w-fit">Failure</span>
            </p>
        );
    }

    return (
        <p>
            Status: <span className={`mt-1 px-2 py-1 text-xs rounded w-fit ${
                isPaused 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
            }`}>
                {isPaused ? 'Paused' : 'Running'}
            </span>
        </p>
    );
}