import Menu from './Menu';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container mx-auto px-4 py-4 max-w-4xl'>
                <div className='flex justify-end mb-4'><Menu /></div>
            <div className='flex justify-center'>
                    <div className='w-full'>
                {children}
                    </div>
                </div>
            </div>
        </div>
    )
}