import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="p-10 text-5xl text-center">
            <h1>404 Not Found</h1>
            <p className="text-2xl my-4">Sorry, the page you are looking for does not exist.</p>
            <button
                onClick={handleBack}
                className="mt-6 py-2 px-4 bg-white border border-gray-500 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700"
            >
                Home
            </button>
        </div>
    );
}

export default NotFound;
